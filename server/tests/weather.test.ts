import request from 'supertest';
import app from '../src/app';

// Mock axios for OpenWeather calls
jest.mock('axios');
import axios from 'axios';
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Weather API', () => {
  describe('GET /api/weather/current', () => {
    it('should return 503 when OPENWEATHER_API_KEY is not set', async () => {
      const res = await request(app).get('/api/weather/current?lat=33.68&lon=73.04');
      expect(res.status).toBe(503);
      expect(res.body.code).toBe('WEATHER_NOT_CONFIGURED');
    });

    it('should reject invalid latitude', async () => {
      const res = await request(app).get('/api/weather/current?lat=200&lon=73');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });

    it('should reject invalid longitude', async () => {
      const res = await request(app).get('/api/weather/current?lat=33&lon=200');
      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/weather/city', () => {
    it('should return 503 when OPENWEATHER_API_KEY is not set', async () => {
      const res = await request(app).get('/api/weather/city?city=Lahore');
      expect(res.status).toBe(503);
      expect(res.body.code).toBe('WEATHER_NOT_CONFIGURED');
    });

    it('should reject empty city', async () => {
      const res = await request(app).get('/api/weather/city?city=a');
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/weather/farming-advice', () => {
    it('should return 503 when OPENWEATHER_API_KEY is not set', async () => {
      const res = await request(app).get('/api/weather/farming-advice?lat=33.68&lon=73.04');
      expect(res.status).toBe(503);
      expect(res.body.code).toBe('WEATHER_NOT_CONFIGURED');
    });
  });
});
