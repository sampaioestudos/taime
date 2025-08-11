import React from 'react';
import { useTranslation } from '../i18n';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="w-full bg-slate-950 text-gray-500 text-xs p-5 border-t border-white/10">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
                
                {/* Section 1: Year, Made with Love, and Copyright */}
                <div className="space-y-2 flex flex-col justify-center items-center md:items-start">
                    <p>{t('footerYear')}</p>
                    <p>{t('footerMadeWith')}</p>
                    <p>{t('footerCopyright')}</p>
                </div>
                
                {/* Section 2: GitHub Link */}
                <div className="flex items-center justify-center">
                    <a 
                        href="https://github.com/sampaioestudos/taime" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                    >
                        {t('footerGithubLink')}
                    </a>
                </div>
                
                {/* Section 3: Donation Message */}
                <div className="space-y-2">
                    <p className="font-semibold text-gray-300">{t('footerDonationTitle')}</p>
                    <p>
                        {t('footerDonationText')}
                        <a 
                            href="https://link.mercadopago.com.br/taimeonline" 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-cyan-400 hover:text-cyan-300 transition-colors block mt-2 font-semibold"
                        >
                            {t('footerDonationLink')}
                        </a>
                    </p>
                </div>
                
            </div>
        </footer>
    );
};

export default Footer;