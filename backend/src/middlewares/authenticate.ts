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

/** Lấy user đã xác thực trong controller (route phải có `authenticate`) */
export function requireUser(req: Request): NonNullable<Request['user']> {
  if (!req.user) {
    throw new UnauthorizedError();
  }
  return req.user;
}
