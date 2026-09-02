import { Router } from 'express';
import multer from 'multer';
import { body } from 'express-validator';
import { chatHandler, transcribeHandler } from '../controllers/assistantController';
import { validate } from '../middleware/validate';
import { assistantLimiter } from '../middleware/rateLimiter';

const router = Router();
const audioUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => {
    const allowed = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/wave',
      'audio/ogg', 'audio/webm', 'audio/flac', 'audio/mp4',
      'audio/m4a', 'audio/x-m4a', 'audio/aac', 'audio/x-caf',
    ];
    callback(null, allowed.includes(file.mimetype));
  },
});

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

router.post('/transcribe', (req, res, next) => {
  audioUpload.single('audio')(req, res, (error) => {
    if (error) {
      const status =
        error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      res.status(status).json({
        error: status === 413 ? 'Audio file is too large. Maximum size is 25MB.' : 'Invalid audio upload.',
        code: status === 413 ? 'AUDIO_TOO_LARGE' : 'INVALID_AUDIO_UPLOAD',
      });
      return;
    }
    next();
  });
}, transcribeHandler);

export default router;
