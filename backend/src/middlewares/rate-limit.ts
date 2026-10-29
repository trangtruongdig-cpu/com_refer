import rateLimit from 'express-rate-limit';
import { isTest } from '../config/env';
import { sendError } from '../utils/response';

const baseOptions: Parameters<typeof rateLimit>[0] = {
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  skip: (req) => isTest || req.path === '/health',
  handler: (_req, res) => {
    sendError(res, 429, 'Quá nhiều yêu cầu, vui lòng thử lại sau', 'TOO_MANY_REQUESTS');
  },
};

/** Giới hạn chung cho toàn bộ /api */
export const apiLimiter = rateLimit({ ...baseOptions, windowMs: 15 * 60 * 1000, limit: 300 });

/** Giới hạn chặt hơn cho login/register để chống brute-force */
export const authLimiter = rateLimit({ ...baseOptions, windowMs: 15 * 60 * 1000, limit: 20 });
