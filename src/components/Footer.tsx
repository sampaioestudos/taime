import React from 'react';
import { useTranslation } from '../i18n';

const Footer: React.FC = () => {
    const { t } = useTranslation();

    return (
        <footer className="w-full mt-12 pt-8 border-t border-slate-800 text-slate-500 text-sm">
            <div className="max-w-4xl mx-auto space-y-6 text-center">
                
                {/* Donation Section */}
                <div className="bg-slate-900/50 p-6 rounded-lg">
                    <h4 className="font-bold text-lg text-cyan-400 mb-2">{t('footerDonationTitle')}</h4>
                    <p className="text-slate-400">
                        {t('footerDonationText')}
                        {' '}
                        <a 
                            href="https://link.mercadopago.com.br/taimeonline"
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="font-semibold text-cyan-400 hover:underline"
                        >
                            {t('footerDonationLink')}
                        </a>
                    </p>
                </div>

                {/* Copyright and Links Section */}
                <div className="space-y-2 text-xs px-4">
                    <p>
                        <a 
                            href="https://github.com/sampaioestudos/taime" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-cyan-400 hover:underline"
                        >
                           {t('footerGithubLink')}
                        </a>
                    </p>
                    <p>
                        {t('footerCopyright')}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
