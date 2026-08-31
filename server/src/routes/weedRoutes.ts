import { Router } from 'express';
import { body, query, param } from 'express-validator';
import { listWeeds, listCrops, getWeed, searchWeedsHandler } from '../controllers/weedController';
import { validate } from '../middleware/validate';

const router = Router();

const VALID_CROPS = ['wheat', 'rice', 'cotton', 'sugarcane', 'maize', 'chickpea', 'mango', 'potato', 'citrus'];

router.get(
  '/',
  validate([
    query('crop')
      .optional()
      .isString()
      .isIn(VALID_CROPS)
      .withMessage(`Crop must be one of: ${VALID_CROPS.join(', ')}`),
  ]),
  listWeeds
);

router.get('/crops', listCrops);

router.get(
  '/search',
  validate([
    query('q')
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
  ]),
  searchWeedsHandler
);

router.get(
  '/:id',
  validate([
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Weed ID is required'),
  ]),
  getWeed
);

export default router;
