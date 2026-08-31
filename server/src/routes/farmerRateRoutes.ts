import { Router } from 'express';
import { submitFarmerRateHandler, getFarmerRatesHandler } from '../controllers/farmerRateController';
import { generalLimiter } from '../middleware/rateLimiter';

const router = Router();
router.use(generalLimiter);
router.post('/', submitFarmerRateHandler);
router.get('/', getFarmerRatesHandler);

export default router;
