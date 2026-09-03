import cors from 'cors';
import { env } from '../config/env';

const allowedOrigins =
  env.nodeEnv === 'production'
    ? env.clientUrl
      ? [env.clientUrl]
      : []
    : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];

export const corsMiddleware = cors({
  origin: allowedOrigins,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
});
