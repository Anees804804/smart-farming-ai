import { Router } from 'express';
import { getHealth, getReady } from '../controllers/healthController';

const router = Router();

router.get('/', getHealth);
router.get('/ready', getReady);

export default router;
