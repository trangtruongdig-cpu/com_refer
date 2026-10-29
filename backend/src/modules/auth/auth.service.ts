import { createHash } from 'node:crypto';
import type { User } from '@prisma/client';
import { env } from '../../config/env';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt';
import { comparePassword, hashPassword } from '../../lib/password';
import { ConflictError, NotFoundError, UnauthorizedError } from '../../utils/app-error';
import { parseDuration } from '../../utils/duration';
import { userRepository } from '../users/user.repository';
import { toPublicUser, type PublicUser } from '../users/user.service';
import { refreshTokenRepository } from './auth.repository';
import type { LoginInput, RegisterInput } from './auth.schema';

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
  user: PublicUser;
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

async function issueTokens(user: User): Promise<AuthResult> {
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken(user.id);
  const refreshTokenExpiresAt = new Date(Date.now() + parseDuration(env.JWT_REFRESH_EXPIRES));

  await refreshTokenRepository.create({
    tokenHash: hashToken(refreshToken),
    userId: user.id,
    expiresAt: refreshTokenExpiresAt,
  });

  return { accessToken, refreshToken, refreshTokenExpiresAt, user: toPublicUser(user) };
}

export const authService = {
  async register(input: RegisterInput): Promise<AuthResult> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('Email đã được sử dụng', 'EMAIL_TAKEN');
    }

    const user = await userRepository.create({
      email: input.email,
      name: input.name,
      password: await hashPassword(input.password),
    });
    return issueTokens(user);
  },

  async login(input: LoginInput): Promise<AuthResult> {
    const user = await userRepository.findByEmail(input.email);
    // Cùng một thông báo lỗi để không lộ email nào đã tồn tại
    if (!user || !(await comparePassword(input.password, user.password))) {
      throw new UnauthorizedError('Email hoặc mật khẩu không đúng', 'INVALID_CREDENTIALS');
    }
    return issueTokens(user);
  },

  /** Xoay vòng refresh token: token cũ bị thu hồi, cấp cặp token mới */
  async refresh(rawToken: string): Promise<AuthResult> {
    const payload = verifyRefreshToken(rawToken);
    const stored = await refreshTokenRepository.findByTokenHash(hashToken(rawToken));

    if (!stored || stored.userId !== payload.sub) {
      throw new UnauthorizedError('Refresh token không hợp lệ', 'INVALID_REFRESH_TOKEN');
    }

    if (stored.revokedAt) {
      // Token đã thu hồi mà vẫn bị dùng lại => có thể đã bị đánh cắp, thu hồi toàn bộ phiên
      await refreshTokenRepository.revokeAllByUserId(stored.userId);
      throw new UnauthorizedError('Refresh token đã bị thu hồi', 'REFRESH_TOKEN_REUSED');
    }

    if (stored.expiresAt.getTime() <= Date.now()) {
      throw new UnauthorizedError('Phiên đăng nhập đã hết hạn', 'REFRESH_TOKEN_EXPIRED');
    }

    const user = await userRepository.findById(stored.userId);
    if (!user) {
      throw new UnauthorizedError('Người dùng không còn tồn tại', 'INVALID_REFRESH_TOKEN');
    }

    await refreshTokenRepository.revoke(stored.id);
    return issueTokens(user);
  },

  async logout(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const stored = await refreshTokenRepository.findByTokenHash(hashToken(rawToken));
    if (stored && !stored.revokedAt) {
      await refreshTokenRepository.revoke(stored.id);
    }
  },

  async me(userId: string): Promise<PublicUser> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('Không tìm thấy người dùng', 'USER_NOT_FOUND');
    }
    return toPublicUser(user);
  },
};
