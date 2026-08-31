import { Router } from 'express';
import { getMandiPricesHandler } from '../controllers/mandiPricesController';
import { mlLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(mlLimiter);
router.get('/', getMandiPricesHandler);

export default router;