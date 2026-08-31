import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Leaf, Search, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import type { WeedRecord, WeedListResponse, CropsResponse } from '../types';

export default function WeedManagement() {
  const { t, language } = useLanguage();
  const [weeds, setWeeds] = useState<WeedRecord[]>([]);
  const [crops, setCrops] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState<string>('');
  const [selectedWeed, setSelectedWeed] = useState<WeedRecord | null>(null);

  const getWeedName = (weed: WeedRecord): string => {
    if (language === 'ur') return weed.nameUr;
    if (language === 'roman-urdu') return weed.nameRomanUrdu;
    return weed.nameEn;
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [weedsRes, cropsRes] = await Promise.all([
        api.get<WeedListResponse>('/weeds'),
        api.get<CropsResponse>('/weeds/crops'),
      ]);
      setWeeds(weedsRes.data.data);
      setCrops(cropsRes.data.data);
    } catch (err: any) {
      setError(err.message || t('weeds.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim().length < 2) {
      // Load all weeds if search is too short
      try {
        const res = await api.get<WeedListResponse>('/weeds', {
          params: selectedCrop ? { crop: selectedCrop } : undefined,
        });
        setWeeds(res.data.data);
      } catch (err: any) {
        setError(err.message || t('weeds.error'));
      }
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await api.get<WeedListResponse>('/weeds/search', {
        params: { q: searchQuery.trim() },
      });
      setWeeds(res.data.data);
    } catch (err: any) {
      setError(err.message || t('weeds.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleCropFilter = async (crop: string) => {
    setSelectedCrop(crop);
    setSearchQuery('');
    setSelectedWeed(null);
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<WeedListResponse>('/weeds', {
        params: crop ? { crop } : undefined,
      });
      setWeeds(res.data.data);
    } catch (err: any) {
      setError(err.message || t('weeds.error'));
    } finally {
      setLoading(false);
    }
  };

  // Detail View
  if (selectedWeed) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-4xl mx-auto"
      >
        <button
          onClick={() => setSelectedWeed(null)}
          className="flex items-center gap-2 text-sm text-farm-600 hover:text-farm-800 mb-4 font-medium"
        >
          <ArrowLeft size={16} />
          {t('weeds.backToList')}
        </button>

        <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-farm-600 to-farm-700 p-6 text-white">
            <h1 className="text-2xl font-bold">{getWeedName(selectedWeed)}</h1>
            <p className="text-farm-100 italic mt-1">{selectedWeed.scientificName}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedWeed.crops.map((crop) => (
                <span
                  key={crop}
                  className="rounded-full bg-white/20 px-3 py-1 text-xs font-medium capitalize"
                >
                  {crop}
                </span>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="p-6 space-y-5">
            <DetailSection title={t('weeds.identification')} content={selectedWeed.identification} />
            <DetailSection title={t('weeds.symptomsOrImpact')} content={selectedWeed.symptomsOrImpact} />
            <DetailSection title={t('weeds.yieldImpact')} content={selectedWeed.yieldImpact} />
            <DetailSection title={t('weeds.pestHosting')} content={selectedWeed.pestHosting} />
            <DetailSection title={t('weeds.controlPeriod')} content={selectedWeed.controlPeriod} />
            <DetailSection title={t('weeds.culturalControl')} content={selectedWeed.culturalControl} />
            <DetailSection title={t('weeds.mechanicalControl')} content={selectedWeed.mechanicalControl} />
            <DetailSection title={t('weeds.chemicalControl')} content={selectedWeed.chemicalControl} />
            <DetailSection title={t('weeds.prevention')} content={selectedWeed.prevention} />

            {/* Chemical Disclaimer */}
            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
              <AlertTriangle size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">{t('weeds.chemicalDisclaimer')}</p>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // List View
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-5xl mx-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-farm-50 text-farm-600">
          <Leaf size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('pages.weedTitle')}
          </h1>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex w-full sm:flex-1 sm:min-w-[250px] gap-2">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder={t('weeds.searchPlaceholder')}
              className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-farm-400"
            />
          </div>
          <button onClick={handleSearch} className="btn-primary !py-2.5 !px-4 !text-sm">
            <Search size={16} />
          </button>
        </div>
      </div>

      {/* Crop Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => handleCropFilter('')}
          className={`rounded-full px-4 py-2 text-xs font-medium transition-colors ${
            !selectedCrop
              ? 'bg-farm-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {t('weeds.allCrops')}
        </button>
        {crops.map((crop) => (
          <button
            key={crop}
            onClick={() => handleCropFilter(crop)}
            className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-colors ${
              selectedCrop === crop
                ? 'bg-farm-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {crop}
          </button>
        ))}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-sm text-farm-600 py-12">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-farm-300 border-t-farm-600" />
          {t('weeds.loading')}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button onClick={loadInitialData} className="btn-secondary mt-3 !text-sm">
            {t('common.retry')}
          </button>
        </div>
      )}

      {/* Weed Cards Grid */}
      {!loading && !error && (
        <AnimatePresence>
          {weeds.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-10 text-center">
              <Leaf size={40} className="mx-auto text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">{t('weeds.noResults')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {weeds.map((weed, i) => (
                <motion.div
                  key={weed.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  onClick={() => setSelectedWeed(weed)}
                  className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm cursor-pointer hover:shadow-md hover:border-farm-200 transition-all"
                >
                  <h3 className="font-semibold text-gray-900 text-sm mb-1">
                    {getWeedName(weed)}
                  </h3>
                  <p className="text-xs text-gray-500 italic mb-2">{weed.scientificName}</p>
                  <p className="text-xs text-gray-600 line-clamp-2 mb-3">
                    {weed.identification}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {weed.crops.map((crop) => (
                      <span
                        key={crop}
                        className="rounded-full bg-farm-50 px-2 py-0.5 text-[10px] font-medium text-farm-700 capitalize"
                      >
                        {crop}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </motion.div>
  );
}

function DetailSection({ title, content }: { title: string; content: string }) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
      <p className="text-sm text-gray-600 leading-relaxed">{content}</p>
    </div>
  );
}
