import React from 'react';
import { useTranslation } from '../i18n';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="fixed bottom-0 left-16 sm:left-64 right-0 z-30 p-4 border-t border-gray-700/50 bg-gray-900/80 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-4 text-xs text-gray-400">
                <div className="text-center lg:text-left">
                    <p className="font-semibold text-gray-300">{t('footerDonationTitle')}</p>
                    <p>
                        {t('footerDonationText')}{' '}
                        <a href="https://github.com/sponsors" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                            {t('footerDonationLink')}
                        </a>
                    </p>
                </div>
                <div className="text-center lg:text-right text-gray-500">
                    <p>{t('footerCopyright')}</p>
                    <a href="https://github.com/google/generative-ai-docs/tree/main/demos/palm-firebase-proxy" target="_blank" rel="noopener noreferrer" className="hover:text-cyan-400 hover:underline">
                        {t('footerGithubLink')}
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
