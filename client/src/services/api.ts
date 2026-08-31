import axios from 'axios';
import type { DiseaseDetectionResponse, FarmerRatesResponse, MandiPricesResponse } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const serverMessage = error.response.data?.message || error.response.data?.error;
      // For network problems or 502/503
      if (error.response.status >= 500) {
        return Promise.reject(
          new Error(serverMessage || 'The service is temporarily unavailable. Please try again.')
        );
      }
      return Promise.reject(
        new Error(serverMessage || 'Something went wrong. Please try again.')
      );
    }
    if (error.request) {
      return Promise.reject(
        new Error('Internet connection or server connection is unavailable. Please try again.')
      );
    }
    return Promise.reject(new Error('Something went wrong. Please try again.'));
  }
);

export default api;

export async function detectDisease(file: File, crop?: string) {
  const formData = new FormData();
  formData.append('image', file);
  if (crop) formData.append('crop', crop);
  const response = await api.post<DiseaseDetectionResponse>('/disease/detect', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 30000,
  });
  return response.data;
}

export async function getMandiPrices(province: string, crop: string) {
  const response = await api.get<MandiPricesResponse>('/mandi-prices', { params: { province, crop } });
  return response.data;
}

export async function getFarmerRates(province: string, crop: string) {
  const response = await api.get<FarmerRatesResponse>('/farmer-rates', { params: { province, crop } });
  return response.data;
}

export interface FarmerRatePayload {
  phone: string;
  province: string;
  crop: string;
  rate: number;
}

export type FarmerRateSubmitResult =
  | { status: 'created' }
  | { status: 'duplicate' };

export async function submitFarmerRate(payload: FarmerRatePayload): Promise<FarmerRateSubmitResult> {
  // Treat 409 as a resolved response so duplicate submissions can be shown as a friendly notice
  const response = await api.post('/farmer-rates', payload, {
    validateStatus: (status) => status === 201 || status === 409,
  });
  if (response.status === 409) {
    return { status: 'duplicate' };
  }
  return { status: 'created' };
}
