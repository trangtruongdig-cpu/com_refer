import type { RefreshToken, Role, User } from '@prisma/client';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * Test API auth không cần database thật: thay repository bằng bản in-memory.
 * Nhờ kiến trúc phân lớp, chỉ cần mock tầng repository.
 */
const db = vi.hoisted(() => ({
  users: new Map<string, User>(),
  tokens: new Map<string, RefreshToken>(),
}));

vi.mock('../src/modules/users/user.repository', () => ({
  userRepository: {
    findById: async (id: string) => db.users.get(id) ?? null,
    findByEmail: async (email: string) =>
      [...db.users.values()].find((user) => user.email === email) ?? null,
    create: async (data: { email: string; password: string; name: string; role?: Role }) => {
      const now = new Date();
      const user: User = {
        id: globalThis.crypto.randomUUID(),
        email: data.email,
        password: data.password,
        name: data.name,
        role: data.role ?? 'USER',
        createdAt: now,
        updatedAt: now,
      };
      db.users.set(user.id, user);
      return user;
    },
  },
}));

vi.mock('../src/modules/auth/auth.repository', () => ({
  refreshTokenRepository: {
    create: async (data: { tokenHash: string; userId: string; expiresAt: Date }) => {
      const token: RefreshToken = {
        id: globalThis.crypto.randomUUID(),
        ...data,
        revokedAt: null,
        createdAt: new Date(),
      };
      db.tokens.set(token.id, token);
      return token;
    },
    findByTokenHash: async (tokenHash: string) =>
      [...db.tokens.values()].find((token) => token.tokenHash === tokenHash) ?? null,
    revoke: async (id: string) => {
      const token = db.tokens.get(id);
      if (token) token.revokedAt = new Date();
    },
    revokeAllByUserId: async (userId: string) => {
      for (const token of db.tokens.values()) {
        if (token.userId === userId && !token.revokedAt) token.revokedAt = new Date();
      }
    },
  },
}));

const { createApp } = await import('../src/app');
const app = createApp();

const credentials = { email: 'john@example.com', password: 'Password@123', name: 'John Doe' };

function getRefreshCookie(res: request.Response): string {
  const raw = res.headers['set-cookie'] as unknown;
  const cookies = Array.isArray(raw) ? (raw as string[]) : [];
  const cookie = cookies.find((value) => value.startsWith('refresh_token='));
  if (!cookie) throw new Error('Không có cookie refresh_token');
  return cookie.split(';')[0] ?? '';
}

describe('Auth API', () => {
  beforeEach(() => {
    db.users.clear();
    db.tokens.clear();
  });

  it('đăng ký thành công, trả access token và set cookie httpOnly', async () => {
    const res = await request(app).post('/api/auth/register').send(credentials);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.accessToken).toEqual(expect.any(String));
    expect(res.body.data.user).toMatchObject({ email: credentials.email, role: 'USER' });
    expect(res.body.data.user.password).toBeUndefined();

    const setCookie = (res.headers['set-cookie'] as unknown as string[]).join(';');
    expect(setCookie).toContain('refresh_token=');
    expect(setCookie).toContain('HttpOnly');
  });

  it('trả 409 khi email đã tồn tại', async () => {
    await request(app).post('/api/auth/register').send(credentials);
    const res = await request(app).post('/api/auth/register').send(credentials);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_TAKEN');
  });

  it('trả 422 khi dữ liệu không hợp lệ', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: '123', name: '' });

    expect(res.status).toBe(422);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    const fields = (res.body.error.details as { field: string }[]).map((d) => d.field);
    expect(fields).toEqual(expect.arrayContaining(['email', 'password', 'name']));
  });

  it('đăng nhập sai mật khẩu trả 401', async () => {
    await request(app).post('/api/auth/register').send(credentials);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email, password: 'wrong-password' });

    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('đăng nhập rồi gọi /auth/me bằng access token', async () => {
    await request(app).post('/api/auth/register').send(credentials);
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: credentials.email.toUpperCase(), password: credentials.password });
    expect(login.status).toBe(200);

    const me = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${login.body.data.accessToken as string}`);

    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe(credentials.email);
  });

  it('/auth/me không có token trả 401', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('refresh xoay vòng token, dùng lại token cũ bị từ chối', async () => {
    const register = await request(app).post('/api/auth/register').send(credentials);
    const oldCookie = getRefreshCookie(register);

    const refresh = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);
    expect(refresh.status).toBe(200);
    expect(refresh.body.data.accessToken).toEqual(expect.any(String));
    const newCookie = getRefreshCookie(refresh);
    expect(newCookie).not.toBe(oldCookie);

    const reuse = await request(app).post('/api/auth/refresh').set('Cookie', oldCookie);
    expect(reuse.status).toBe(401);
    expect(reuse.body.error.code).toBe('REFRESH_TOKEN_REUSED');

    // Phát hiện dùng lại => mọi phiên của user bị thu hồi, kể cả token mới
    const afterReuse = await request(app).post('/api/auth/refresh').set('Cookie', newCookie);
    expect(afterReuse.status).toBe(401);
  });

  it('logout thu hồi refresh token', async () => {
    const register = await request(app).post('/api/auth/register').send(credentials);
    const cookie = getRefreshCookie(register);

    const logout = await request(app).post('/api/auth/logout').set('Cookie', cookie);
    expect(logout.status).toBe(200);

    const refresh = await request(app).post('/api/auth/refresh').set('Cookie', cookie);
    expect(refresh.status).toBe(401);
  });

  it('USER không truy cập được danh sách users', async () => {
    const register = await request(app).post('/api/auth/register').send(credentials);
    const res = await request(app)
      .get('/api/users')
      .set('Authorization', `Bearer ${register.body.data.accessToken as string}`);

    expect(res.status).toBe(403);
  });
});
