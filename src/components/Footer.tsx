import React from 'react';
import { useTranslation } from '../i18n';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="w-full p-4 glassmorphism !bg-slate-900/80 !rounded-none !rounded-t-xl text-xs text-gray-400 z-10 mt-auto">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
                {/* Column 1: Copyright and Links */}
                <div className="flex flex-col items-center md:items-start">
                    <p>&copy; {new Date().getFullYear()} taime</p>
                    <p className="mt-1">{t('footerCopyright')}</p>
                    <div className="mt-2 space-x-4">
                        <a href="/privacy" className="hover:text-cyan-400 transition-colors">{t('footerPrivacy')}</a>
                        <a href="/terms" className="hover:text-cyan-400 transition-colors">{t('footerTerms')}</a>
                    </div>
                </div>

                {/* Column 2: Support */}
                <div className="flex flex-col items-center">
                    <h4 className="font-bold text-gray-300">{t('footerSupportTitle')}</h4>
                    <p className="mt-1">{t('footerSupportText')}</p>
                    {/* Replace with actual donation link */}
                    <a 
                      href="https://github.com/sponsors" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="mt-2 px-3 py-1 bg-pink-600/80 text-white rounded-md hover:bg-pink-500/80 transition-colors font-semibold"
                    >
                      Support Now
                    </a>
                </div>

                {/* Column 3: GitHub Link */}
                <div className="flex flex-col items-center md:items-end">
                     <h4 className="font-bold text-gray-300">Open Source</h4>
                     <a 
                        href="https://github.com/your-repo/taime" // Replace with actual repo link
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="mt-1 hover:text-cyan-400 transition-colors"
                     >
                        {t('footerGithubLink')}
                    </a>
                </div>
            </div>
             {/* AdSense placeholder comment */}
             {/* <div className="ad-container footer-banner-ad text-center mt-4">Ad Placeholder</div> */}
        </footer>
    );
};

export default Footer;
