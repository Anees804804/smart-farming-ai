import { Router } from 'express';
import { body } from 'express-validator';
import { chatHandler } from '../controllers/assistantController';
import { validate } from '../middleware/validate';
import { assistantLimiter } from '../middleware/rateLimiter';

const router = Router();

router.use(assistantLimiter);

router.post(
  '/chat',
  validate([
    body('message')
      .isString()
      .trim()
      .notEmpty()
      .withMessage('Message is required and cannot be empty')
      .isLength({ max: 2000 })
      .withMessage('Message must not exceed 2000 characters'),
    body('language')
      .optional()
      .isIn(['en', 'ur', 'roman-urdu'])
      .withMessage('Language must be one of: en, ur, roman-urdu'),
    body('sessionId')
      .optional()
      .isString()
      .isLength({ min: 1, max: 100 })
      .withMessage('Session ID must be between 1 and 100 characters'),
  ]),
  chatHandler
);

export default router;
