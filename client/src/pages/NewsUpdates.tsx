import { motion } from 'framer-motion';
import { Newspaper } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect, useCallback } from 'react';
import { getNews } from '../services/api';
import type { NewsUpdateEntry } from '../types';
import { formatDate } from '../utils/helpers';

const provinces = ['punjab', 'sindh', 'kpk', 'balochistan', 'gilgit-baltistan'] as const;

export default function NewsUpdates() {
  const { t } = useLanguage();
  const [province, setProvince] = useState('punjab');
  const [entries, setEntries] = useState<NewsUpdateEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async (p: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await getNews(p);
      setEntries(result.data);
    } catch {
      setError(t('pages.newsLoadError'));
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchNews(province);
  }, [province, fetchNews]);

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

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-farm-50 text-farm-600">
          <Newspaper size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">{t('pages.newsTitle')}</h1>
      </div>

      {/* Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-8">
        <p className="mb-6 text-gray-600">{t('pages.newsDesc')}</p>

        {/* Province selector */}
        <label className="text-sm font-medium text-gray-700">
          {t('pages.selectProvince')}
          <select
            value={province}
            onChange={(e) => setProvince(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            {provinces.map((item) => (
              <option key={item} value={item}>
                {t(`map.provinces.${item}`)}
              </option>
            ))}
          </select>
        </label>

        {/* Loading */}
        {loading && (
          <p className="mt-6 text-center text-sm text-gray-500">{t('common.loading')}</p>
        )}

        {/* Error */}
        {error && (
          <p className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
        )}

        {/* Results */}
        {!loading && !error && (
          <>
            {entries.length === 0 ? (
              <p className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
                {t('pages.newsEmpty')}
              </p>
            ) : (
              <div className="mt-6 space-y-4">
                {entries.map((entry) => (
                  <div
                    key={`${entry.createdAt}-${entry.title}`}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    {entry.imageUrl && (
                      <img
                        src={entry.imageUrl}
                        alt={entry.title}
                        className="mb-3 h-40 w-full rounded-md object-cover"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                    )}
                    <div className="flex items-start justify-between gap-3">
                      <h2 className="text-base font-semibold text-gray-900 leading-snug">
                        {entry.title}
                      </h2>
                      <span
                        className={`shrink-0 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          entry.category === 'scheme'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {entry.category === 'scheme'
                          ? t('pages.newsCategoryScheme')
                          : t('pages.newsCategoryNews')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                      {entry.description}
                    </p>
                    <p className="mt-3 text-xs text-gray-400">
                      {formatRelativeTime(entry.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
