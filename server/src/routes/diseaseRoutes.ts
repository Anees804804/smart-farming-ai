import { Router } from 'express';
import multer from 'multer';
import { detectDiseaseHandler } from '../controllers/diseaseController';
import { mlLimiter } from '../middleware/rateLimiter';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

router.use(mlLimiter);
router.post('/detect', (req, res, next) => {
  upload.single('image')(req, res, (error) => {
    if (error) {
      const status = error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      res.status(status).json({ status: 'error', error: 'Invalid image upload.', code: status === 413 ? 'IMAGE_TOO_LARGE' : 'INVALID_IMAGE_UPLOAD' });
      return;
    }
    next();
  });
}, detectDiseaseHandler);

export default router;