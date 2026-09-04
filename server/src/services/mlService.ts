import axios, { AxiosError } from 'axios';
import FormData from 'form-data';
import { env } from '../config/env';

export interface DiseasePrediction {
  disease: string;
  confidence: number;
  topPredictions: Array<{ label: string; confidence: number }>;
}

export interface DiseaseDetectionResult {
  status: string;
  data: DiseasePrediction;
  message?: string;
}

interface MlResponse<T> { status: string; data: T; message?: string; }

export class MlServiceError extends Error {
  constructor(message: string, public readonly statusCode: number, public readonly code: string) {
    super(message);
    this.name = 'MlServiceError';
  }
}

function mapMlError(error: unknown): MlServiceError {
  if (error instanceof MlServiceError) return error;
  const axiosError = error as AxiosError<{ detail?: string }>;
  const connectionCodes = ['ECONNABORTED', 'ETIMEDOUT', 'ECONNRESET', 'ECONNREFUSED', 'ENOTFOUND', 'ERR_NETWORK'];

  if (connectionCodes.includes(axiosError.code || '')) {
    return new MlServiceError(
      'ML service is unreachable. Please ensure the Python ML service is running and the ML_SERVICE_URL points to http://127.0.0.1:8000 or http://localhost:8000.',
      502,
      'ML_SERVICE_UNAVAILABLE'
    );
  }
  if (axiosError.code === 'ECONNABORTED' || axiosError.code === 'ETIMEDOUT') {
    return new MlServiceError('ML service request timed out.', 504, 'ML_TIMEOUT');
  }
  if (axiosError.response?.status === 503) {
    return new MlServiceError('ML model is currently unavailable.', 503, 'MODEL_UNAVAILABLE');
  }
  if (axiosError.response?.status === 400) {
    return new MlServiceError(axiosError.response.data?.detail || 'ML request was invalid.', 400, 'ML_VALIDATION_ERROR');
  }
  return new MlServiceError('ML service is unavailable.', 502, 'ML_SERVICE_UNAVAILABLE');
}

function requireData<T>(data: T | undefined): T {
  if (!data || typeof data !== 'object') {
    throw new MlServiceError('ML service returned a malformed response.', 502, 'ML_INVALID_RESPONSE');
  }
  return data;
}

export async function detectDisease(file: Express.Multer.File): Promise<DiseaseDetectionResult> {
  const form = new FormData();
  form.append('image', file.buffer, { filename: 'upload', contentType: file.mimetype, knownLength: file.size });
  try {
    const response = await axios.post<MlResponse<DiseasePrediction>>(`${env.mlServiceUrl}/predict/disease`, form, { timeout: 60000, headers: form.getHeaders() });
    const body = response.data;
    return { status: body.status, data: requireData(body.data), message: body.message };
  } catch (error) {
    throw mapMlError(error);
  }
}