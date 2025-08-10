import React from 'react';
import { useTranslation } from '../i18n';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const pixKey = "a38267e7-38e5-474c-813c-0e713511746d"; // Example PIX key

    return (
        <footer className="w-full mt-12 pt-8 border-t border-slate-800 text-slate-500 text-xs">
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="bg-slate-900/50 p-4 rounded-lg">
                    <h4 className="font-bold text-sm text-slate-300 mb-1">{t('footerSupportTitle')}</h4>
                    <p>
                        {t('footerSupportText_part1')}
                        <b className="text-slate-400">{t('footerSupportText_bold')}</b>
                        {t('footerSupportText_part2')}
                        <a href="https://www.buymeacoffee.com/edwardborges" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{t('footerSupportLinkText')}</a>
                        {t('footerSupportText_part3')}
                    </p>
                </div>
                 <div className="text-center">
                    <p>
                        {t('footerCreditsText_part1')}
                        <b className="text-slate-400">{t('footerCreditsText_bold')}</b>
                        {t('footerCreditsText_part2')}
                        <span className="font-mono bg-slate-800 text-slate-400 px-1.5 py-1 rounded-md">{pixKey}</span>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
