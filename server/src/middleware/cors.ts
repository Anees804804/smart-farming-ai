import cors from 'cors';
import { env } from '../config/env';

const allowedOrigins =
  env.nodeEnv === 'production'
    ? [process.env.CLIENT_URL || 'http://localhost:3000']
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

export const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
