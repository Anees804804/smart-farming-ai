import { Request, Response } from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
import { env } from '../config/env';
import { isGroqConfigured } from '../services/groqService';
import { isWeatherConfigured } from '../services/weatherService';

export async function getHealth(_req: Request, res: Response): Promise<void> {
  // Check MongoDB status
  let mongoStatus: 'connected' | 'unavailable' = 'unavailable';
  try {
    if (mongoose.connection.readyState === 1) {
      mongoStatus = 'connected';
    }
  } catch {
    mongoStatus = 'unavailable';
  }

  // Check ML service status
  let mlStatus: 'available' | 'unavailable' = 'unavailable';
  try {
    const mlUrl = `${env.mlServiceUrl}/health`;
    await axios.get(mlUrl, { timeout: 3000 });
    mlStatus = 'available';
  } catch {
    mlStatus = 'unavailable';
  }

  res.status(200).json({
    status: 'ok',
    service: 'smart-farming-api',
    timestamp: new Date().toISOString(),
    environment: env.nodeEnv,
    dependencies: {
      mongodb: mongoStatus,
      ml: mlStatus,
      groq: isGroqConfigured() ? 'configured' : 'not_configured',
      weather: isWeatherConfigured() ? 'configured' : 'not_configured',
    },
  });
}
