import { env } from './config/env';
import { connectDB } from './config/db';
import { logger } from './utils/logger';
import app from './app';

const PORT = env.port;

async function start() {
  // Connect to MongoDB (non-blocking if unavailable)
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Server running on port ${PORT} in ${env.nodeEnv} mode`);
    logger.info(`Health check: http://0.0.0.0:${PORT}/api/health`);
  });
}

start();
