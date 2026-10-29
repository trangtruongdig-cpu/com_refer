import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { generateOpenApiDocument } from './docs/openapi';
import { httpLogger } from './lib/logger';
import { errorHandler } from './middlewares/error-handler';
import { notFound } from './middlewares/not-found';
import { apiLimiter } from './middlewares/rate-limit';
import { routes } from './routes';

/** Tạo Express app — tách khỏi server.ts để test bằng Supertest */
export function createApp(): Express {
  const app = express();

  // Đứng sau Caddy: lấy đúng IP client từ X-Forwarded-For
  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(httpLogger);

  // Swagger mount trước helmet vì Swagger UI cần inline script/style
  if (env.SWAGGER_ENABLED) {
    const openApiDocument = generateOpenApiDocument();
    app.get('/api/docs.json', (_req, res) => {
      res.json(openApiDocument);
    });
    app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));
  }

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());

  app.use('/api', apiLimiter, routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
