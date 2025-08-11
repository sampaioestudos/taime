import React from 'react';
import { useTranslation } from '../i18n';
import { LogoIcon } from './icons';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="w-full bg-slate-950 text-gray-400 text-xs ring-1 ring-white/10 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 px-4 sm:px-6 lg:px-8 py-8">
                {/* About Section */}
                <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                        <LogoIcon className="h-6 w-6 text-cyan-400" />
                        <span className="font-bold text-lg text-white">t<span className="italic">ai</span>me</span>
                    </div>
                    <p className="text-gray-500">{t('appSlogan')}</p>
                    <p>&copy; {new Date().getFullYear()} taime. {t('footerCopyright')}</p>
                </div>

                {/* Support Section */}
                <div className="flex flex-col gap-2">
                    <h4 className="font-bold text-sm text-white tracking-wider uppercase">{t('footerDonationTitle')}</h4>
                    <p className="text-gray-500">{t('footerDonationText')}</p>
                    <a 
                        href="https://ko-fi.com/joaomanaia" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        {t('footerDonationLink')} &rarr;
                    </a>
                </div>

                {/* Links Section */}
                <div className="flex flex-col gap-2">
                     <h4 className="font-bold text-sm text-white tracking-wider uppercase">Project</h4>
                     <a 
                        href="https://github.com/JoaoManaia/taime" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        {t('footerGithubLink')}
                    </a>
                    <a 
                        href="https://github.com/JoaoManaia/taime/blob/main/LICENSE" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        License (GPL-3.0)
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;