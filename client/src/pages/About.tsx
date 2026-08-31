import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export default function About() {
  const { t } = useLanguage();

  const featuresList = [
    t('about.featuresList1'),
    t('about.featuresList2'),
    t('about.featuresList3'),
    t('about.featuresList4'),
    t('about.featuresList5'),
    t('about.featuresList6'),
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="max-w-3xl mx-auto space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-farm-50 text-farm-600">
          <Info size={24} />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          {t('about.title')}
        </h1>
      </div>

      {/* Description */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-gray-600">{t('about.description')}</p>
      </div>

      {/* How Smart Farming Helps You */}
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Info size={20} className="text-farm-600" />
          <h2 className="text-lg font-semibold text-gray-900">
            {t('about.techTitle')}
          </h2>
        </div>
        <ul className="space-y-3">
          {featuresList.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <span className="text-farm-600 mt-0.5">•</span>
              <span className="text-gray-700">{feature}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
}
