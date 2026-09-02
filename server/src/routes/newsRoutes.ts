import { Router } from 'express';
import { createNewsHandler, getNewsHandler } from '../controllers/newsController';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(generalLimiter);
router.post('/', createNewsHandler);
router.get('/', getNewsHandler);

export default router;
