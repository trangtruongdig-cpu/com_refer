import { randomUUID } from 'node:crypto';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/app-error';

const accessTokenPayloadSchema = z.object({
  sub: z.string(),
  role: z.enum(['ADMIN', 'USER']),
});

const refreshTokenPayloadSchema = z.object({
  sub: z.string(),
  jti: z.string(),
});

export type AccessTokenPayload = z.infer<typeof accessTokenPayloadSchema>;
export type RefreshTokenPayload = z.infer<typeof refreshTokenPayloadSchema>;

function sign(payload: object, secret: string, expiresIn: string): string {
  return jwt.sign(payload, secret, { expiresIn: expiresIn as SignOptions['expiresIn'] });
}

function verify<T>(token: string, secret: string, schema: z.ZodType<T>): T {
  try {
    const decoded = jwt.verify(token, secret);
    return schema.parse(decoded);
  } catch {
    throw new UnauthorizedError('Token không hợp lệ hoặc đã hết hạn', 'INVALID_TOKEN');
  }
}

export function signAccessToken(payload: AccessTokenPayload): string {
  return sign(payload, env.JWT_ACCESS_SECRET, env.JWT_ACCESS_EXPIRES);
}

/** Mỗi refresh token có jti ngẫu nhiên để hash luôn là duy nhất */
export function signRefreshToken(userId: string): string {
  const payload: RefreshTokenPayload = { sub: userId, jti: randomUUID() };
  return sign(payload, env.JWT_REFRESH_SECRET, env.JWT_REFRESH_EXPIRES);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return verify(token, env.JWT_ACCESS_SECRET, accessTokenPayloadSchema);
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return verify(token, env.JWT_REFRESH_SECRET, refreshTokenPayloadSchema);
}
