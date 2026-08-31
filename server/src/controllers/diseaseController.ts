import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { detectDisease, MlServiceError } from '../services/mlService';
import { explainDisease, observeCropImage } from '../services/groqService';

const CONFIDENCE_THRESHOLD = Number(process.env.DISEASE_CONFIDENCE_THRESHOLD || 0.6) * 100;
const FALLBACK_CROPS = new Set(['cotton', 'wheat', 'rice', 'chilli', 'okra']);

function detectedCrop(label: string): string | undefined {
  const crop = label.split(/\s*[-_/|]\s*/)[0]?.trim();
  return crop && crop.toLowerCase() !== label.trim().toLowerCase() ? crop : undefined;
}

function isSupportedPrediction(disease: string, confidence: number, selectedCrop?: string): boolean {
  if (!disease.trim() || /^(unknown|unsupported|unrecognized|undetermined)$/i.test(disease.trim())) return false;
  if (confidence < CONFIDENCE_THRESHOLD) return false;
  if (!selectedCrop) return false;
  const crop = detectedCrop(disease);
  return !!crop && crop.toLowerCase() === selectedCrop.trim().toLowerCase();
}

export const detectDiseaseHandler = asyncHandler(async (req: Request, res: Response) => {
  if (!req.file) {
    res.status(400).json({ status: 'error', error: 'Image file is required.', code: 'IMAGE_REQUIRED' });
    return;
  }
  try {
    const selectedCrop = typeof req.body?.crop === 'string' ? req.body.crop.trim() : undefined;
    if (selectedCrop && FALLBACK_CROPS.has(selectedCrop.toLowerCase())) {
      const observation = await observeCropImage(req.file, selectedCrop);
      res.json({ status: 'fallback_observation', data: { crop: selectedCrop, observation } });
      return;
    }

    const result = await detectDisease(req.file);
    const confirmed = result.status === 'ok' && isSupportedPrediction(result.data.disease, result.data.confidence, selectedCrop);
    const status = confirmed ? 'ok' : 'low_confidence';
    const explanation = await explainDisease({
      status: confirmed ? 'confirmed' : selectedCrop ? 'unsupported' : 'uncertain',
      crop: confirmed ? detectedCrop(result.data.disease) || selectedCrop : selectedCrop,
      disease: confirmed ? result.data.disease : undefined,
      confidence: result.data.confidence,
      topPredictions: confirmed ? result.data.topPredictions : undefined,
    });
    res.json({
      status,
      ...(status === 'low_confidence' ? { message: 'The system could not reliably diagnose this image.' } : {}),
      data: result.data,
      explanation,
    });
  } catch (error) {
    if (error instanceof MlServiceError) {
      res.status(error.statusCode).json({ status: 'error', error: error.message, code: error.code });
      return;
    }
    throw error;
  }
});