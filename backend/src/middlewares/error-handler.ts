import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import { isProduction } from '../config/env';
import { logger } from '../lib/logger';
import { AppError } from '../utils/app-error';
import { sendError } from '../utils/response';

function isBodyParseError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'type' in err &&
    (err as { type: unknown }).type === 'entity.parse.failed'
  );
}

/** Middleware xử lý lỗi tập trung — luôn đặt cuối cùng */
export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    const details = err.issues.map((issue) => ({
      // Bỏ tiền tố body/query/params cho dễ đọc
      field: issue.path.slice(1).join('.') || issue.path.join('.'),
      location: issue.path[0],
      message: issue.message,
    }));
    sendError(res, 422, 'Dữ liệu không hợp lệ', 'VALIDATION_ERROR', details);
    return;
  }

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message, err.code, err.details);
    return;
  }

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(res, 409, 'Dữ liệu đã tồn tại', 'UNIQUE_CONSTRAINT', { target: err.meta?.target });
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 404, 'Không tìm thấy bản ghi', 'NOT_FOUND');
      return;
    }
  }

  if (isBodyParseError(err)) {
    sendError(res, 400, 'JSON không hợp lệ', 'INVALID_JSON');
    return;
  }

  (req.log ?? logger).error({ err }, 'Unhandled error');
  const message =
    !isProduction && err instanceof Error ? err.message : 'Lỗi hệ thống, vui lòng thử lại sau';
  sendError(res, 500, message, 'INTERNAL_ERROR');
}
