import type { Role } from '@prisma/client';
import type { RequestHandler } from 'express';
import { ForbiddenError, UnauthorizedError } from '../utils/app-error';

/** Chỉ cho phép các role được liệt kê. Dùng sau `authenticate`. */
export const authorize =
  (...roles: Role[]): RequestHandler =>
  (req, _res, next) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }
    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError();
    }
    next();
  };
