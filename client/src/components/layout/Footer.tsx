import { useLanguage } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="border-t border-gray-200 bg-white px-6 py-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-3 text-center">
        <p className="text-sm text-gray-600">
          {t('footer.description')}
        </p>
        <p className="text-xs text-gray-400 italic">
          {t('footer.disclaimer')}
        </p>
        <p className="text-xs text-gray-400">
          {t('footer.copyright')}
        </p>
      </div>
    </footer>
  );
}
