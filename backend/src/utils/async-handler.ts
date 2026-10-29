import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ParamsDictionary } from 'express-serve-static-core';
import type { ParsedQs } from 'qs';

/**
 * Bọc controller async: lỗi được chuyển cho errorHandler, không cần try/catch.
 * Generic P/B/Q là type đã được middleware `validate` kiểm tra (lấy từ z.infer).
 */
export function asyncHandler<P = ParamsDictionary, B = unknown, Q = ParsedQs>(
  fn: (req: Request<P, unknown, B, Q>, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req as unknown as Request<P, unknown, B, Q>, res, next).catch(next);
  };
}
