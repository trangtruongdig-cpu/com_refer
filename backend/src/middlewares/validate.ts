import type { Request, RequestHandler } from 'express';
import type { AnyZodObject } from 'zod';

interface ValidatedParts {
  body?: unknown;
  query?: unknown;
  params?: unknown;
}

/**
 * Validate `body`, `query`, `params` theo schema dạng:
 *   z.object({ body: ..., query: ..., params: ... })
 * Giá trị sau khi parse (đã coerce, default, trim...) ghi đè lại vào req.
 * ZodError được errorHandler chuyển thành response 422.
 */
export const validate =
  (schema: AnyZodObject): RequestHandler =>
  (req, _res, next) => {
    const parsed = schema.parse({
      body: req.body as unknown,
      query: req.query,
      params: req.params,
    }) as ValidatedParts;

    if ('body' in parsed) req.body = parsed.body;
    if ('query' in parsed) req.query = parsed.query as Request['query'];
    if ('params' in parsed) req.params = parsed.params as Request['params'];
    next();
  };
