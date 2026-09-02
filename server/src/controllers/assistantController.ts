import { Request, Response } from 'express';
import { chat, isGroqConfigured, transcribeAudio } from '../services/groqService';
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

export const transcribeHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!isGroqConfigured()) {
    res.status(503).json({
      error: 'AI Assistant is not configured. Please contact the administrator.',
      code: 'AI_NOT_CONFIGURED',
    });
    return;
  }

  if (!req.file) {
    res.status(400).json({
      error: 'Audio file is required.',
      code: 'AUDIO_REQUIRED',
    });
    return;
  }

  try {
    const text = await transcribeAudio({
      buffer: req.file.buffer,
      mimetype: req.file.mimetype,
      originalname: req.file.originalname,
    });
    res.json({ text });
  } catch (error: any) {
    logger.error('Transcription handler error', { error: error.message });
    res.status(500).json({
      error: error.message || 'Transcription failed. Please try again.',
      code: 'TRANSCRIPTION_FAILED',
    });
  }
});
