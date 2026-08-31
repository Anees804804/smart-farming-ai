import { Sprout } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

export default function Header() {
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="sticky top-0 z-20 flex items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-sm px-6 py-3 lg:px-8">
      <div className="flex items-center gap-3 lg:hidden">
        {/* Space for mobile menu button */}
        <div className="w-10" />
        <div className="flex items-center gap-2">
          <Sprout size={20} className="text-farm-600" />
          <span className="text-sm font-bold text-farm-800">
            {t('app.name')}
          </span>
        </div>
      </div>
      <div className="hidden lg:flex items-center gap-2">
        <span className="text-lg font-bold text-farm-800">
          {t('app.name')}
        </span>
      </div>
      <div className="flex items-center gap-4">
        {/* Compact language switcher – visible on < lg screens only */}
        <div className="flex gap-0.5 rounded-lg bg-gray-100 p-0.5 lg:hidden">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`rounded-md px-2 py-1 text-[10px] font-semibold leading-tight transition-colors ${
                language === lang.code
                  ? 'bg-white text-farm-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {lang.shortLabel}
            </button>
          ))}
        </div>
        <span className="text-xs text-gray-500 bg-farm-50 px-2 py-1 rounded-full font-medium">
          Phase 2
        </span>
      </div>
    </header>
  );
}
