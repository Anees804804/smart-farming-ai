import dotenv from 'dotenv';
import path from 'path';

// Skip .env loading during tests — tests rely on empty API keys
if (process.env.NODE_ENV !== 'test') {
  dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
}

interface EnvConfig {
  port: number;
  nodeEnv: string;
  mongoUri: string;
  clientUrl: string;
  groqApiKey: string;
  groqModel: string;
  openweatherApiKey: string;
  mlServiceUrl: string;
}

export const env: EnvConfig = {
  port: parseInt(process.env.PORT || '5000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-farming-ai',
  clientUrl: process.env.CLIENT_URL || '',
  groqApiKey: process.env.GROQ_API_KEY || '',
  groqModel: process.env.GROQ_MODEL || '',
  openweatherApiKey: process.env.OPENWEATHER_API_KEY || '',
  mlServiceUrl: process.env.ML_SERVICE_URL || 'http://localhost:8000',
};

export function validateEnv(): void {
  const errors: string[] = [];

  if (!Number.isInteger(env.port) || env.port < 1 || env.port > 65535) {
    errors.push('PORT must be an integer between 1 and 65535');
  }

  if (env.nodeEnv === 'production') {
    if (!process.env.MONGODB_URI) errors.push('MONGODB_URI is required in production');
    if (!env.clientUrl) errors.push('CLIENT_URL is required in production');
  }

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }
}
