import { motion } from 'framer-motion';
import { BadgeIndianRupee, HandCoins, MapPinned, Send, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState } from 'react';
import { getMandiPrices, getFarmerRates, submitFarmerRate } from '../services/api';
import { formatDate } from '../utils/helpers';
import type { FarmerRateEntry, MandiPricesResponse } from '../types';

const provinces = ['punjab', 'sindh', 'kpk', 'balochistan', 'gilgit-baltistan'] as const;
const crops = ['wheat', 'rice', 'cotton', 'maize', 'mango', 'sugarcane', 'chickpea', 'potato', 'tomato', 'onion', 'green chilli', 'okra'] as const;

export default function MandiPrices() {
  const { t } = useLanguage();
  const [province, setProvince] = useState('punjab');
  const [crop, setCrop] = useState('wheat');
  const [result, setResult] = useState<MandiPricesResponse['data'] | null>(null);
  const [farmerRates, setFarmerRates] = useState<FarmerRateEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [ratePhone, setRatePhone] = useState('');
  const [rateProvince, setRateProvince] = useState('punjab');
  const [rateCrop, setRateCrop] = useState('wheat');
  const [rateValue, setRateValue] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'created' | 'duplicate' | 'error'>('idle');
  const [submitError, setSubmitError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true); setError(null); setResult(null); setFarmerRates(null);
    const [pricesResult, ratesResult] = await Promise.allSettled([
      getMandiPrices(province, crop),
      getFarmerRates(province, crop),
    ]);
    if (pricesResult.status === 'fulfilled') { setResult(pricesResult.value.data); }
    else { setError(pricesResult.reason instanceof Error ? pricesResult.reason.message : t('pages.mandiUnavailable')); }
    // Farmer-reported rates failing should never block or alarm; treat as empty list
    setFarmerRates(ratesResult.status === 'fulfilled' ? ratesResult.value.data : []);
    setLoading(false);
  }

  function formatRelativeTime(iso: string): string {
    const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (minutes < 1) return t('pages.timeJustNow');
    if (minutes < 60) return t('pages.timeMinutesAgo').replace('{count}', String(minutes));
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return t('pages.timeHoursAgo').replace('{count}', String(hours));
    const days = Math.floor(hours / 24);
    if (days === 1) return t('pages.timeYesterday');
    if (days < 7) return t('pages.timeDaysAgo').replace('{count}', String(days));
    return formatDate(iso);
  }

  async function handleRateSubmit(event: React.FormEvent) {
    event.preventDefault();
    const rate = Number(rateValue);
    if (!ratePhone.trim() || !Number.isFinite(rate) || rate <= 0) {
      setSubmitStatus('error');
      setSubmitError(t('pages.rateSubmitFailed'));
      return;
    }
    setSubmitting(true); setSubmitStatus('idle'); setSubmitError(null);
    try {
      const result = await submitFarmerRate({
        phone: ratePhone.trim(),
        province: rateProvince,
        crop: rateCrop,
        rate,
      });
      setSubmitStatus(result.status);
      if (result.status === 'created') { setRatePhone(''); setRateValue(''); }
    } catch (err) {
      setSubmitStatus('error');
      setSubmitError(err instanceof Error ? err.message : t('pages.rateSubmitFailed'));
    } finally { setSubmitting(false); }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-farm-50 text-farm-600"><BadgeIndianRupee size={24} /></div>
        <h1 className="text-2xl font-bold text-gray-900">{t('pages.mandiTitle')}</h1>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="mb-6 text-gray-600">{t('pages.mandiDesc')}</p>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">{t('pages.selectProvince')}
            <select value={province} onChange={(e) => setProvince(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2">{provinces.map((item) => <option key={item} value={item}>{t(`map.provinces.${item}`)}</option>)}</select>
          </label>
          <label className="text-sm font-medium text-gray-700">{t('pages.selectCrop')}
            <select value={crop} onChange={(e) => setCrop(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2">{crops.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          </label>
          <button disabled={loading} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-farm-600 px-4 py-3 font-semibold text-white disabled:opacity-60 sm:col-span-2"><MapPinned size={18} />{loading ? t('pages.checkingPrices') : t('pages.checkPrices')}</button>
        </form>
        {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {result && (result.data.length ? <div className="mt-6 rounded-lg bg-farm-50 p-5"><p className="text-xs font-semibold uppercase tracking-wide text-farm-700">{t('pages.latestAvailable')}</p><h2 className="mt-1 text-2xl font-bold text-gray-900">{result.crop}</h2><div className="mt-4 space-y-3">{result.data.map((price) => <div key={price.market} className="rounded-lg border border-farm-100 bg-white p-4"><p className="text-xl font-bold text-gray-900">Rs. {price.price.toLocaleString()} / {price.unit}</p><p className="mt-1 text-sm text-gray-700">{t('pages.market')}: {price.market}</p><p className="text-sm text-gray-700">{t('pages.province')}: {price.province}</p><p className="text-sm text-gray-700">{t('pages.updated')}: {price.updatedAt}</p><p className="mt-2 text-xs text-gray-500">{price.source} · {t('pages.latestAvailable')}</p></div>)}</div></div> : <p className="mt-6 rounded-lg border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-900">{t('pages.noPriceData')}</p>)}
        {farmerRates && (
          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-5">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-gray-500" />
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600">{t('pages.farmerReportedTitle')}</p>
            </div>
            <p className="mt-1 text-xs text-gray-500">{t('pages.farmerReportedNote')}</p>
            {farmerRates.length ? (
              <div className="mt-4 space-y-3">
                {farmerRates.map((entry, index) => (
                  <div key={`${entry.createdAt}-${index}`} className="flex items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white p-4">
                    <div>
                      <p className="text-lg font-bold text-gray-900">Rs. {entry.rate.toLocaleString()} / {t('pages.perMaund')}</p>
                      <p className="text-sm capitalize text-gray-600">{entry.crop}</p>
                    </div>
                    <p className="shrink-0 text-sm text-gray-500">{formatRelativeTime(entry.createdAt)}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">{t('pages.noFarmerRates')}</p>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-farm-50 text-farm-600"><HandCoins size={20} /></div>
          <h2 className="text-lg font-bold text-gray-900">{t('pages.farmerRatesTitle')}</h2>
        </div>
        <p className="mt-2 text-gray-600">{t('pages.farmerRatesDesc')}</p>
        <form onSubmit={handleRateSubmit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="text-sm font-medium text-gray-700">{t('pages.phoneLabel')}
            <input type="tel" required value={ratePhone} onChange={(e) => setRatePhone(e.target.value)} placeholder="03XXXXXXXXX" className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">{t('pages.rateLabel')}
            <input type="number" required min="1" step="any" value={rateValue} onChange={(e) => setRateValue(e.target.value)} placeholder="2600" className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2" />
          </label>
          <label className="text-sm font-medium text-gray-700">{t('pages.selectProvince')}
            <select value={rateProvince} onChange={(e) => setRateProvince(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2">{provinces.map((item) => <option key={item} value={item}>{t(`map.provinces.${item}`)}</option>)}</select>
          </label>
          <label className="text-sm font-medium text-gray-700">{t('pages.selectCrop')}
            <select value={rateCrop} onChange={(e) => setRateCrop(e.target.value)} className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2">{crops.map((item) => <option key={item} value={item}>{item}</option>)}</select>
          </label>
          <button disabled={submitting} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-farm-600 px-4 py-3 font-semibold text-white disabled:opacity-60 sm:col-span-2"><Send size={18} />{submitting ? t('pages.submittingRate') : t('pages.submitRate')}</button>
        </form>
        {submitStatus === 'created' && <p className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">{t('pages.rateSubmitted')}</p>}
        {submitStatus === 'duplicate' && <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{t('pages.rateAlreadySubmitted')}</p>}
        {submitStatus === 'error' && submitError && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
      </div>
    </motion.div>
  );
}
