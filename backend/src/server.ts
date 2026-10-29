import { createApp } from './app';
import { env } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';

const SHUTDOWN_TIMEOUT_MS = 10_000;

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`🚀 Server chạy tại http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
  if (env.SWAGGER_ENABLED) {
    logger.info(`📚 Swagger: http://localhost:${env.PORT}/api/docs`);
  }
});

let isShuttingDown = false;

async function closeResources(exitCode: number): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Đã đóng kết nối database');
  } catch (error) {
    logger.error({ err: error }, 'Lỗi khi đóng kết nối database');
    exitCode = 1;
  }
  process.exit(exitCode);
}

function shutdown(signal: string, exitCode = 0): void {
  if (isShuttingDown) return;
  isShuttingDown = true;
  logger.info(`Nhận ${signal}, đang tắt server...`);

  // Quá thời gian thì ép thoát
  setTimeout(() => {
    logger.error('Tắt server quá lâu, buộc thoát');
    process.exit(1);
  }, SHUTDOWN_TIMEOUT_MS).unref();

  server.close((error) => {
    if (error) {
      logger.error({ err: error }, 'Lỗi khi đóng HTTP server');
    }
    void closeResources(error ? 1 : exitCode);
  });
  // Đóng các keep-alive connection đang rảnh để server.close() hoàn tất nhanh
  server.closeIdleConnections();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error({ err: reason }, 'Unhandled promise rejection');
});

process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception');
  shutdown('uncaughtException', 1);
});
