import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { getMandiPrices, MandiPricesError } from '../services/mandiPricesService';

export const getMandiPricesHandler = asyncHandler(async (req: Request, res: Response) => {
  try {
    const province = typeof req.query.province === 'string' ? req.query.province : '';
    const crop = typeof req.query.crop === 'string' ? req.query.crop : '';
    const result = await getMandiPrices(province, crop);
    res.json({ status: 'ok', data: result });
  } catch (error) {
    if (error instanceof MandiPricesError) {
      res.status(error.statusCode).json({ status: 'error', error: error.message, code: error.code });
      return;
    }
    res.status(503).json({ status: 'error', error: 'Price information is temporarily unavailable.', code: 'PRICE_SOURCE_UNAVAILABLE' });
  }
});