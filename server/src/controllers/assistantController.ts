import { Request, Response } from 'express';
import { chat, isGroqConfigured } from '../services/groqService';
import { asyncHandler } from '../utils/asyncHandler';
import { logger } from '../utils/logger';

export const chatHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isGroqConfigured()) {
    res.status(503).json({
      error: 'AI Assistant is not configured. Please contact the administrator.',
      code: 'AI_NOT_CONFIGURED',
    });
    return;
  }

  const { message, sessionId, language } = req.body;

  try {
    const result = await chat({
      message: message.trim(),
      sessionId: sessionId || undefined,
      language: language || 'en',
    });

    res.json({
      status: 'ok',
      data: result,
    });
  } catch (error: any) {
    logger.error('Chat handler error', { error: error.message });
    res.status(500).json({
      error: 'Chat service error',
      message: 'An unexpected error occurred. Please try again.',
    });
  }
});
