import { env, validateEnv } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import app from './app';

const PORT = env.port;

process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception; shutting down', {
    error: error.message,
    stack: error.stack,
  });
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection; shutting down', {
    error: reason instanceof Error ? reason.message : String(reason),
    stack: reason instanceof Error ? reason.stack : undefined,
  });
  process.exit(1);
});

async function start() {
  logger.info('Startup: loading environment');
  validateEnv();
  logger.info('Startup: environment validated', {
    nodeEnv: env.nodeEnv,
    port: PORT,
    clientUrl: env.clientUrl || 'not configured',
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info('Startup: server listening', {
      host: '0.0.0.0',
      port: PORT,
      environment: env.nodeEnv,
    });
    logger.info(`Health check: http://0.0.0.0:${PORT}/api/health`);
  });

  server.on('error', (error) => {
    logger.error('Startup: server failed to listen', {
      error: error.message,
      code: (error as NodeJS.ErrnoException).code,
      stack: error.stack,
    });
    process.exit(1);
  });

  logger.info('Startup: attempting MongoDB connection');
  connectDB().catch((err) => logger.error(err));
  logger.info('Startup: MongoDB connection step complete');
}

start().catch((error: unknown) => {
  logger.error('Startup failed', {
    error: error instanceof Error ? error.message : String(error),
    stack: error instanceof Error ? error.stack : undefined,
  });
  process.exit(1);
});
