import type { RequestHandler } from 'express';
import { NotFoundError } from '../utils/app-error';

export const notFound: RequestHandler = (req, _res, next) => {
  next(
    new NotFoundError(`Không tìm thấy route ${req.method} ${req.originalUrl}`, 'ROUTE_NOT_FOUND'),
  );
};
