import { Router } from 'express';
import { query } from 'express-validator';
import { getCurrentWeather, getCityWeather, getFarmingAdvice } from '../controllers/weatherController';
import { validate } from '../middleware/validate';
import { weatherLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(weatherLimiter);

router.get(
  '/current',
  validate([
    query('lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    query('lon')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
  ]),
  getCurrentWeather
);

router.get(
  '/city',
  validate([
    query('city')
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('City name must be between 2 and 100 characters'),
  ]),
  getCityWeather
);

router.get(
  '/farming-advice',
  validate([
    query('lat')
      .isFloat({ min: -90, max: 90 })
      .withMessage('Latitude must be between -90 and 90'),
    query('lon')
      .isFloat({ min: -180, max: 180 })
      .withMessage('Longitude must be between -180 and 180'),
  ]),
  getFarmingAdvice
);

export default router;
