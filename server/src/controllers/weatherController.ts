import { Request, Response } from 'express';
import {
  getWeatherByCoords,
  getWeatherByCity,
  isWeatherConfigured,
} from '../services/weatherService';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

export const getCurrentWeather = asyncHandler(async (req: Request, res: Response) => {
  if (!isWeatherConfigured()) {
    res.status(503).json({
      error: 'Weather service is not configured',
      code: 'WEATHER_NOT_CONFIGURED',
    });
    return;
  }

  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  try {
    const weather = await getWeatherByCoords(lat, lon);
    res.json({ status: 'ok', data: weather });
  } catch (error: any) {
    logger.warn('Weather fetch failed', { error: error.message });
    res.status(502).json({
      error: 'Weather data unavailable',
      message: error.message || 'Unable to fetch weather data. Please try again later.',
    });
  }
});

export const getCityWeather = asyncHandler(async (req: Request, res: Response) => {
  if (!isWeatherConfigured()) {
    res.status(503).json({
      error: 'Weather service is not configured',
      code: 'WEATHER_NOT_CONFIGURED',
    });
    return;
  }

  const city = req.query.city as string;

  try {
    const weather = await getWeatherByCity(city);
    res.json({ status: 'ok', data: weather });
  } catch (error: any) {
    logger.warn('Weather fetch failed', { error: error.message });
    res.status(502).json({
      error: 'Weather data unavailable',
      message: error.message || 'Unable to fetch weather data. Please try again later.',
    });
  }
});

export const getFarmingAdvice = asyncHandler(async (req: Request, res: Response) => {
  if (!isWeatherConfigured()) {
    res.status(503).json({
      error: 'Weather service is not configured',
      code: 'WEATHER_NOT_CONFIGURED',
    });
    return;
  }

  const lat = parseFloat(req.query.lat as string);
  const lon = parseFloat(req.query.lon as string);

  try {
    const weather = await getWeatherByCoords(lat, lon);
    res.json({
      status: 'ok',
      data: {
        weather,
        disclaimer: 'This is general agricultural guidance. Always consult local agricultural extension professionals for specific advice.',
      },
    });
  } catch (error: any) {
    logger.warn('Farming advice fetch failed', { error: error.message });
    res.status(502).json({
      error: 'Weather data unavailable',
      message: error.message || 'Unable to fetch weather data for farming advice. Please try again later.',
    });
  }
});
