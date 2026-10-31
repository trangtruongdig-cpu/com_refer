import type { Request, RequestHandler } from 'express';
import { verifyAccessToken } from '../lib/jwt';
import { UnauthorizedError } from '../utils/app-error';

/** Xác thực access token trong header `Authorization: Bearer <token>` */
export const authenticate: RequestHandler = (req, _res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Thiếu access token', 'MISSING_TOKEN');
  }

  const payload = verifyAccessToken(header.slice('Bearer '.length).trim());
  req.user = { id: payload.sub, role: payload.role };
  next();
};

/**
 * Lấy user đã xác thực trong controller (route phải có `authenticate`).
 *
 * Nhận `Pick<Request, 'user'>` chứ không phải `Request`: controller nào khai
 * kiểu cho `query`/`body` đã qua zod sẽ có generic khác `Request` mặc định, và
 * truyền vào đây sẽ không khớp kiểu dù chỉ đọc đúng một thuộc tính `user`.
 */
export function requireUser(req: Pick<Request, 'user'>): NonNullable<Request['user']> {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}
