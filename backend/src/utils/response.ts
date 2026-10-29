import type { Response } from 'express';

export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
  meta?: Record<string, unknown>;
  error?: { code: string; details?: unknown };
}

interface SuccessOptions {
  message?: string;
  meta?: Record<string, unknown>;
  statusCode?: number;
}

export function sendSuccess<T>(res: Response, data: T, options: SuccessOptions = {}): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message: options.message,
    meta: options.meta,
  };
  return res.status(options.statusCode ?? 200).json(body);
}

export function sendError(
  res: Response,
  statusCode: number,
  message: string,
  code = 'INTERNAL_ERROR',
  details?: unknown,
): Response {
  const body: ApiResponse<null> = {
    success: false,
    data: null,
    message,
    error: { code, details },
  };
  return res.status(statusCode).json(body);
}
