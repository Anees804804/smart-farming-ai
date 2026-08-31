import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Microscope,
  Sprout,
  Leaf,
  MessageCircle,
  Cloud,
  Map,
  Cpu,
  Languages,
  Layers,
  MapPin,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import StatCard from '../components/shared/StatCard';
import FeatureCard from '../components/shared/FeatureCard';
import WeatherCard from '../components/shared/WeatherCard';

const stats = [
  { icon: <Cpu size={20} />, valueKey: '6', labelKey: 'dashboard.statFeatures' },
  { icon: <Languages size={20} />, valueKey: '3', labelKey: 'dashboard.statLanguages' },
  { icon: <Layers size={20} />, valueKey: '5', labelKey: 'dashboard.statModules' },
  { icon: <MapPin size={20} />, valueKey: '1', labelKey: 'dashboard.statFocus' },
];

const features = [
  { icon: <Microscope size={24} />, titleKey: 'features.diseaseTitle', descKey: 'features.diseaseDesc', path: '/disease' },
  { icon: <Sprout size={24} />, titleKey: 'features.mandiTitle', descKey: 'features.mandiDesc', path: '/mandi-prices' },
  { icon: <Leaf size={24} />, titleKey: 'features.weedTitle', descKey: 'features.weedDesc', path: '/weeds' },
  { icon: <MessageCircle size={24} />, titleKey: 'features.assistantTitle', descKey: 'features.assistantDesc', path: '/assistant' },
  { icon: <Cloud size={24} />, titleKey: 'features.weatherTitle', descKey: 'features.weatherDesc', path: '/' },
  { icon: <Map size={24} />, titleKey: 'features.mapTitle', descKey: 'features.mapDesc', path: '/map' },
];

export default function Dashboard() {
  const { t } = useLanguage();

  return (
    <div className="max-w-6xl mx-auto space-y-10">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl bg-gradient-to-br from-farm-600 to-farm-800 p-6 sm:p-8 lg:p-12 text-white shadow-lg"
      >
        <h1 className="text-3xl lg:text-4xl font-bold leading-tight">
          {t('dashboard.heroTitle')}
        </h1>
        <p className="mt-3 text-lg text-farm-100 max-w-2xl">
          {t('dashboard.heroSubtitle')}
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link to="/disease" className="btn-primary bg-white !text-farm-700 hover:!bg-farm-50">
            {t('dashboard.ctaDisease')}
          </Link>
          <Link to="/mandi-prices" className="btn-secondary !border-white/30 !text-white !bg-transparent hover:!bg-white/10">
            {t('dashboard.ctaCrop')}
          </Link>
        </div>
      </motion.section>

      {/* Statistics */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('dashboard.statsTitle')}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatCard
              key={stat.labelKey}
              icon={stat.icon}
              value={stat.valueKey}
              label={t(stat.labelKey)}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Feature Cards */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          {t('dashboard.featuresTitle')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <FeatureCard
              key={feature.titleKey}
              icon={feature.icon}
              title={t(feature.titleKey)}
              description={t(feature.descKey)}
              path={feature.path}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Weather Card */}
      <WeatherCard />
    </div>
  );
}
