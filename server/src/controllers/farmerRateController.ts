import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { FarmerRate } from '../models/FarmerRate';

const DUPLICATE_WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

export const submitFarmerRateHandler = asyncHandler(async (req: Request, res: Response) => {
  const { phone, province, crop, rate } = req.body ?? {};

  if (
    typeof phone !== 'string' || !phone.trim() ||
    typeof province !== 'string' || !province.trim() ||
    typeof crop !== 'string' || !crop.trim() ||
    typeof rate !== 'number' || !Number.isFinite(rate)
  ) {
    res.status(400).json({
      status: 'error',
      error: 'phone, province, crop and a numeric rate are required.',
      code: 'INVALID_PAYLOAD',
    });
    return;
  }

  // Spam prevention: one submission per phone per province+crop within 24 hours
  const since = new Date(Date.now() - DUPLICATE_WINDOW_MS);
  const existing = await FarmerRate.findOne({
    phone: phone.trim(),
    province: province.trim(),
    crop: crop.trim(),
    createdAt: { $gte: since },
  });

  if (existing) {
    res.status(409).json({
      status: 'error',
      message: 'You have already submitted a rate for this province and crop within the last 24 hours.',
      code: 'DUPLICATE_SUBMISSION',
    });
    return;
  }

  const created = await FarmerRate.create({
    phone: phone.trim(),
    province: province.trim(),
    crop: crop.trim(),
    rate,
  });

  res.status(201).json({
    status: 'ok',
    data: {
      province: created.province,
      crop: created.crop,
      rate: created.rate,
      createdAt: created.createdAt,
    },
  });
});

export const getFarmerRatesHandler = asyncHandler(async (req: Request, res: Response) => {
  const province = typeof req.query.province === 'string' ? req.query.province.trim() : '';
  const crop = typeof req.query.crop === 'string' ? req.query.crop.trim() : '';

  if (!province || !crop) {
    res.status(400).json({
      status: 'error',
      error: 'province and crop query parameters are required.',
      code: 'INVALID_QUERY',
    });
    return;
  }

  const entries = await FarmerRate.find({ province, crop })
    .sort({ createdAt: -1 })
    .limit(10);

  // Never expose phone numbers in public rate listings
  const data = entries.map((entry) => ({
    province: entry.province,
    crop: entry.crop,
    rate: entry.rate,
    createdAt: entry.createdAt,
  }));

  res.json({ status: 'ok', data });
});
