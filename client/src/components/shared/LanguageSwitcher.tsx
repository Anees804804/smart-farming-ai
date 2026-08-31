import { useLanguage } from '../../context/LanguageContext';
import { SUPPORTED_LANGUAGES } from '../../utils/constants';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex gap-1 rounded-lg bg-gray-100 p-1">
      {SUPPORTED_LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
            language === lang.code
              ? 'bg-white text-farm-700 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {lang.shortLabel}
        </button>
      ))}
    </div>
  );
}
