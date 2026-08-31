import { Request, Response, NextFunction } from 'express';
import { getAllWeeds, getCrops, getWeedById, searchWeeds } from '../services/weedService';
import { asyncHandler } from '../utils/asyncHandler';

export const listWeeds = asyncHandler(async (req: Request, res: Response) => {
  const crop = typeof req.query.crop === 'string' ? req.query.crop : undefined;
  const weeds = getAllWeeds(crop);

  res.json({
    status: 'ok',
    count: weeds.length,
    data: weeds,
  });
});

export const listCrops = asyncHandler(async (_req: Request, res: Response) => {
  const crops = getCrops();

  res.json({
    status: 'ok',
    data: crops,
  });
});

export const getWeed = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const weed = getWeedById(id);

  if (!weed) {
    res.status(404).json({
      error: 'Weed not found',
      message: `No weed record found with id "${id}".`,
    });
    return;
  }

  res.json({
    status: 'ok',
    data: weed,
  });
});

export const searchWeedsHandler = asyncHandler(async (req: Request, res: Response) => {
  const q = typeof req.query.q === 'string' ? req.query.q : '';

  if (!q || q.trim().length < 2) {
    res.status(400).json({
      error: 'Validation failed',
      message: 'Search query must be at least 2 characters.',
    });
    return;
  }

  const weeds = searchWeeds(q);

  res.json({
    status: 'ok',
    count: weeds.length,
    data: weeds,
  });
});
