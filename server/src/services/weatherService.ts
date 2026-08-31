import axios from 'axios';
import { env } from '../config/env';
import { logger } from '../utils/logger';

interface WeatherCacheEntry {
  data: WeatherResponse;
  timestamp: number;
}

export interface WeatherResponse {
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  rainfall: number;
  location: string;
  farmingAdvice: string;
}

// In-memory cache — ~30 minute expiration
const cache = new Map<string, WeatherCacheEntry>();
const CACHE_TTL_MS = 30 * 60 * 1000;

function getCacheKey(...parts: string[]): string {
  return parts.join(':');
}

function getCached(key: string): WeatherResponse | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL_MS) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: WeatherResponse): void {
  cache.set(key, { data, timestamp: Date.now() });
}

function generateFarmingAdvice(temp: number, humidity: number, windSpeed: number, rainfall: number): string {
  const advice: string[] = [];

  if (rainfall > 10) {
    advice.push('Heavy rainfall detected — ensure proper field drainage and avoid unnecessary irrigation.');
  }
  if (temp > 38) {
    advice.push('High temperature alert — monitor irrigation closely and consider shade for sensitive crops.');
  }
  if (temp < 5) {
    advice.push('Low temperature warning — protect sensitive crops from frost damage.');
  }
  if (humidity > 80) {
    advice.push('High humidity increases risk of fungal diseases — consider preventive measures and ensure proper air circulation.');
  }
  if (windSpeed > 25) {
    advice.push('Strong winds — avoid spraying pesticides and protect fragile crops and seedlings.');
  }
  if (temp >= 20 && temp <= 35 && humidity >= 40 && humidity <= 70 && rainfall < 5) {
    advice.push('Favourable conditions for most field operations including sowing and harvesting.');
  }

  if (advice.length === 0) {
    advice.push('Conditions are moderate — continue regular field monitoring and maintenance.');
  }

  return advice.join(' ');
}

function normalizeWeather(raw: any, locationName: string): WeatherResponse {
  const temp = raw.main?.temp ?? 0;
  const humidity = raw.main?.humidity ?? 0;
  const windSpeed = raw.wind?.speed ?? 0;
  const condition = raw.weather?.[0]?.description ?? 'Unknown';
  const rainfall = raw.rain?.['1h'] ?? 0;

  return {
    temperature: Math.round(temp * 10) / 10,
    humidity,
    windSpeed: Math.round(windSpeed * 10) / 10,
    condition,
    rainfall: Math.round(rainfall * 10) / 10,
    location: locationName,
    farmingAdvice: generateFarmingAdvice(temp, humidity, windSpeed, rainfall),
  };
}

export async function getWeatherByCoords(lat: number, lon: number): Promise<WeatherResponse> {
  const cacheKey = getCacheKey('coords', lat.toString(), lon.toString());
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${env.openweatherApiKey}`;

  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const locationName = `${data.name || 'Unknown'}, ${data.sys?.country || ''}`.trim();
    const weather = normalizeWeather(data, locationName);
    setCache(cacheKey, weather);
    return weather;
  } catch (error: any) {
    logger.warn('OpenWeather API request failed', {
      error: error.message,
      lat,
      lon,
    });
    throw new Error('Unable to fetch weather data. Please try again later.');
  }
}

export async function getWeatherByCity(city: string): Promise<WeatherResponse> {
  const cacheKey = getCacheKey('city', city.toLowerCase());
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=metric&appid=${env.openweatherApiKey}`;

  try {
    const { data } = await axios.get(url, { timeout: 10000 });
    const locationName = `${data.name || city}, ${data.sys?.country || ''}`.trim();
    const weather = normalizeWeather(data, locationName);
    setCache(cacheKey, weather);
    return weather;
  } catch (error: any) {
    logger.warn('OpenWeather API request failed', {
      error: error.message,
      city,
    });
    throw new Error('Unable to fetch weather data for this city. Please try again later.');
  }
}

export function isWeatherConfigured(): boolean {
  return !!env.openweatherApiKey && env.openweatherApiKey.length > 0;
}
