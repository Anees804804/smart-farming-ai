import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { NewsUpdate } from '../models/NewsUpdate';

export const createNewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const adminKey = req.headers['x-admin-key'];

  if (!adminKey || adminKey !== process.env.ADMIN_KEY) {
    res.status(401).json({
      status: 'error',
      error: 'Unauthorized. Invalid or missing admin key.',
      code: 'UNAUTHORIZED',
    });
    return;
  }

  const { title, description, province, category, imageUrl } = req.body ?? {};

  if (
    typeof title !== 'string' || !title.trim() ||
    typeof description !== 'string' || !description.trim() ||
    typeof province !== 'string' || !province.trim() ||
    !['news', 'scheme'].includes(category)
  ) {
    res.status(400).json({
      status: 'error',
      error: 'title, description, province and a valid category (news | scheme) are required.',
      code: 'INVALID_PAYLOAD',
    });
    return;
  }

  const created = await NewsUpdate.create({
    title: title.trim(),
    description: description.trim(),
    province: province.trim(),
    category,
    ...(typeof imageUrl === 'string' && imageUrl.trim() ? { imageUrl: imageUrl.trim() } : {}),
  });

  res.status(201).json({
    status: 'ok',
    data: {
      title: created.title,
      description: created.description,
      province: created.province,
      category: created.category,
      imageUrl: created.imageUrl ?? null,
      createdAt: created.createdAt,
    },
  });
});

export const getNewsHandler = asyncHandler(async (req: Request, res: Response) => {
  const province = typeof req.query.province === 'string' ? req.query.province.trim() : '';

  if (!province) {
    res.status(400).json({
      status: 'error',
      error: 'province query parameter is required.',
      code: 'INVALID_QUERY',
    });
    return;
  }

  const entries = await NewsUpdate.find({
    $or: [{ province }, { province: 'all' }],
  })
    .sort({ createdAt: -1 })
    .limit(20);

  const data = entries.map((entry) => ({
    title: entry.title,
    description: entry.description,
    province: entry.province,
    category: entry.category,
    imageUrl: entry.imageUrl ?? null,
    createdAt: entry.createdAt,
  }));

  res.json({ status: 'ok', data });
});
