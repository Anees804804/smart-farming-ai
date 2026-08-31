import { useState } from 'react';
import { Cloud, MapPin, Search, Thermometer, Droplets, Wind, CloudRain, Lightbulb } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import type { WeatherResponse } from '../../types';

export default function WeatherCard() {
  const { t } = useLanguage();
  const [weather, setWeather] = useState<WeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [city, setCity] = useState('');

  const fetchByLocation = async () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const res = await api.get<{ data: WeatherResponse }>('/weather/current', {
            params: { lat: pos.coords.latitude, lon: pos.coords.longitude },
          });
          setWeather(res.data.data);
        } catch (err: any) {
          setError(err.message || t('weather.unavailable'));
        } finally {
          setLoading(false);
        }
      },
      () => {
        setError('Location access denied. Please try city search instead.');
        setLoading(false);
      }
    );
  };

  const fetchByCity = async () => {
    if (!city.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<{ data: WeatherResponse }>('/weather/city', {
        params: { city: city.trim() },
      });
      setWeather(res.data.data);
    } catch (err: any) {
      setError(err.message || t('weather.unavailable'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="rounded-xl border border-gray-200 bg-gradient-to-br from-sky-50 to-blue-50 p-6 shadow-sm"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-100 text-sky-600">
            <Cloud size={20} />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {t('dashboard.weatherTitle')}
          </h3>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={fetchByLocation}
          disabled={loading}
          className="btn-secondary !py-2 !px-3 !text-xs"
        >
          <MapPin size={14} />
          {t('weather.useLocation')}
        </button>
        <div className="flex gap-2 flex-1 min-w-[200px]">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchByCity()}
            placeholder={t('weather.citySearch')}
            className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <button
            onClick={fetchByCity}
            disabled={loading || !city.trim()}
            className="btn-primary !py-2 !px-3 !text-xs !bg-sky-600 hover:!bg-sky-700"
          >
            <Search size={14} />
          </button>
        </div>
      </div>

      {/* Loading */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 text-sm text-sky-600 py-4"
          >
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-sky-300 border-t-sky-600" />
            {t('dashboard.weatherLoading')}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && !loading && (
        <div className="flex items-center gap-3 rounded-lg bg-white/60 p-4 border border-sky-100">
          <Cloud size={24} className="text-gray-400 flex-shrink-0" />
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      )}

      {/* Weather Data */}
      {weather && !loading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3"
        >
          <div className="flex items-center gap-2 text-sm text-sky-700 font-medium">
            <MapPin size={14} />
            {weather.location}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg bg-white/80 p-3 border border-sky-100 text-center">
              <Thermometer size={18} className="mx-auto text-red-400 mb-1" />
              <p className="text-lg font-bold text-gray-900">{weather.temperature}°C</p>
              <p className="text-xs text-gray-500">{t('weather.temperature')}</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 border border-sky-100 text-center">
              <Droplets size={18} className="mx-auto text-blue-400 mb-1" />
              <p className="text-lg font-bold text-gray-900">{weather.humidity}%</p>
              <p className="text-xs text-gray-500">{t('weather.humidity')}</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 border border-sky-100 text-center">
              <Wind size={18} className="mx-auto text-teal-400 mb-1" />
              <p className="text-lg font-bold text-gray-900">{weather.windSpeed} m/s</p>
              <p className="text-xs text-gray-500">{t('weather.wind')}</p>
            </div>
            <div className="rounded-lg bg-white/80 p-3 border border-sky-100 text-center">
              <CloudRain size={18} className="mx-auto text-sky-400 mb-1" />
              <p className="text-lg font-bold text-gray-900">{weather.rainfall} mm</p>
              <p className="text-xs text-gray-500">{t('weather.rainfall')}</p>
            </div>
          </div>

          {/* Farming Advice */}
          <div className="rounded-lg bg-amber-50 p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={16} className="text-amber-600" />
              <span className="text-sm font-semibold text-amber-800">
                {t('weather.farmingAdvice')}
              </span>
            </div>
            <p className="text-sm text-amber-700">{weather.farmingAdvice}</p>
            <p className="text-xs text-amber-500 mt-2 italic">
              {t('weather.disclaimer')}
            </p>
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {!weather && !loading && !error && (
        <div className="flex items-center gap-3 rounded-lg bg-white/60 p-4 border border-sky-100">
          <Cloud size={32} className="text-sky-300" />
          <p className="text-sm text-gray-500">
            {t('dashboard.weatherPlaceholder')}
          </p>
        </div>
      )}
    </motion.div>
  );
}
