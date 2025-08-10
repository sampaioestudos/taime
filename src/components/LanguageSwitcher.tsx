import React from 'react';
import { useTranslation } from '../i18n';

const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const languages = [
    { code: 'en', label: 'EN' },
    { code: 'pt-BR', label: 'PT' },
  ] as const;

  return (
    <div className="flex items-center bg-gray-800 rounded-md p-1">
      {languages.map(lang => (
        <button
          key={lang.code}
          onClick={() => setLanguage(lang.code)}
          className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
            language === lang.code
              ? 'bg-cyan-600 text-white'
              : 'bg-transparent text-gray-400 hover:bg-gray-700'
          }`}
        >
          {lang.label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;