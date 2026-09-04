import { motion } from 'framer-motion';
import { Microscope } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useEffect, useState } from 'react';
import { detectDisease } from '../services/api';
import type { DiseasePrediction } from '../types';

const supportedCrops = [
  { value: 'Apple', key: 'cropApple' }, { value: 'Blueberry', key: 'cropBlueberry' }, { value: 'Cherry (including sour)', key: 'cropCherry' },
  { value: 'Corn (maize)', key: 'cropCorn' }, { value: 'Grape', key: 'cropGrape' }, { value: 'Orange', key: 'cropOrange' },
  { value: 'Peach', key: 'cropPeach' }, { value: 'Pepper, bell', key: 'cropPepperBell' }, { value: 'Potato', key: 'cropPotato' },
  { value: 'Raspberry', key: 'cropRaspberry' }, { value: 'Soybean', key: 'cropSoybean' }, { value: 'Squash', key: 'cropSquash' },
  { value: 'Strawberry', key: 'cropStrawberry' }, { value: 'Tomato', key: 'cropTomato' }, { value: 'Cotton', key: 'cropCotton' },
  { value: 'Wheat', key: 'cropWheat' }, { value: 'Rice', key: 'cropRice' }, { value: 'Chilli', key: 'cropChilli' }, { value: 'Okra', key: 'cropOkra' },
];

export default function DiseaseDetection() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [crop, setCrop] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<DiseasePrediction | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [lowConfidence, setLowConfidence] = useState(false);
  const [fallbackObservation, setFallbackObservation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  function selectFile(next: File | undefined) {
    if (!next) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(next.type) || next.size > 5 * 1024 * 1024) { setError(t('pages.invalidImage')); return; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(next); setPreview(URL.createObjectURL(next)); setResult(null); setExplanation(null); setLowConfidence(false); setFallbackObservation(null); setError(null);
  }
  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault(); if (!file) { setError(t('pages.imageRequired')); return; }
    setLoading(true); setError(null);
    try { const response = await detectDisease(file, crop); setResult(response.status === 'fallback_observation' ? null : response.data); setFallbackObservation(response.status === 'fallback_observation' ? response.data.observation : null); setExplanation(response.explanation || null); setLowConfidence(response.status === 'low_confidence'); } catch (err) { setError(err instanceof Error ? err.message : t('pages.detectionUnavailable')); } finally { setLoading(false); }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-farm-50 text-farm-600">
          <Microscope size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('pages.diseaseTitle')}
          </h1>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 sm:p-8 shadow-sm">
        <p className="text-gray-600 mb-6">
          {t('pages.diseaseDesc')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => selectFile(e.target.files?.[0])} className="block w-full rounded-lg border border-gray-300 p-3 text-sm" />
          <label className="block text-sm font-medium text-gray-700">{t('pages.cropOptional')}
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2"><option value="">{t('pages.cropUnknown')}</option>{supportedCrops.map((item) => <option key={item.value} value={item.value}>{t(`pages.${item.key}`)}</option>)}</select>
          </label>
          {preview && <img src={preview} alt={t('pages.selectedPlant')} className="max-h-72 w-full rounded-lg object-contain bg-gray-50" />}
            <div className="flex flex-col sm:flex-row gap-3"><button type="submit" disabled={loading || !file} className="rounded-lg bg-farm-600 px-4 py-3 sm:py-2 font-semibold text-white disabled:opacity-60">{loading ? t('pages.analyzing') : t('pages.analyzeImage')}</button>{file && <button type="button" onClick={() => { setFile(null); setResult(null); if (preview) URL.revokeObjectURL(preview); setPreview(null); }} className="rounded-lg border border-gray-300 px-4 py-3 sm:py-2">{t('pages.remove')}</button>}</div>
          {loading && <p className="text-sm text-gray-600">{t('pages.analyzingMessage')}</p>}
        </form>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {fallbackObservation && <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-950"><p className="font-semibold">{t('pages.generalAiObservation')} — {t('pages.notVerifiedDiagnosis')}</p><p className="mt-2 text-sm leading-6">{fallbackObservation}</p><p className="mt-3 text-sm leading-6">{t('pages.inconclusive')}: {t('pages.imageCouldNotBeIdentifiedReliably')}</p><p className="mt-2 text-sm leading-6">{t('pages.tryAnotherClearPhoto')}</p><p className="mt-4 text-sm font-medium">{t('pages.consultAgricultureOfficer')}</p></div>}
        {result && (lowConfidence ? <div className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-5 text-blue-900"><p className="font-semibold">{t('pages.uncertainTitle')}</p><p className="mt-2 text-sm leading-6">{t('pages.uncertainImage')}</p>{explanation && <p className="mt-3 whitespace-pre-line text-sm leading-6">{explanation}</p>}</div> : <div className="mt-6 rounded-lg bg-farm-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-farm-700">{t('pages.modelPrediction')}</p><h2 className="mt-1 text-2xl font-bold text-gray-900">{result.disease}</h2><p className="text-gray-600">{t('pages.confidence')}: {result.confidence}%</p><h3 className="mt-4 font-semibold text-gray-800">{t('pages.topPredictions')}</h3><ul className="mt-2 list-disc pl-5 text-gray-600">{result.topPredictions.map((prediction) => <li key={prediction.label}>{prediction.label} ({prediction.confidence}%)</li>)}</ul>{explanation && <p className="mt-4 whitespace-pre-line text-sm text-gray-700">{explanation}</p>}<p className="mt-4 text-sm text-gray-600">{t('pages.treatmentUnverified')}</p></div>)}
      </div>
    </motion.div>
  );
}
