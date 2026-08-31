import mongoose from 'mongoose';
import dns from 'dns';
import { env } from './env';
import { logger } from '../utils/logger';

// Fix SRV resolution on networks where the local DNS proxy refuses SRV queries.
// Node.js c-ares uses 127.0.0.1 by default; Google public DNS handles SRV correctly.
const defaultServers = dns.getServers();
const hasReliableSRV = defaultServers.some(
  (s) => s !== '127.0.0.1' && s !== '::1' && !s.startsWith('fe80')
);
if (!hasReliableSRV) {
  dns.setServers(['8.8.8.8', '8.8.4.4']);
  logger.info('DNS: using public resolvers for SRV compatibility');
}

export async function connectDB(): Promise<void> {
  try {
    await mongoose.connect(env.mongoUri);
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.warn('MongoDB connection failed. Running without database.', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    // Do NOT crash the process — allow server to run without DB
  }
}

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error', { error: err.message });
});
