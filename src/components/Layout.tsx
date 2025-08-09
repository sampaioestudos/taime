import React from 'react';
import Sidebar from './Sidebar';
import { Page } from '../App';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProgress } from '../types';
import { ToastContainer } from './Toast';
import { useTranslation } from '../i18n';

interface LayoutProps {
    children: React.ReactNode;
    activePage: Page;
    onNavigate: (page: Page) => void;
}

const Footer: React.FC = () => {
    const { t } = useTranslation();
    const donationLink = "https://link.mercadopago.com.br/taimeonline";
    
    return (
        <footer className="shrink-0 text-xs text-slate-500 py-6 px-4 border-t border-t-slate-800 bg-slate-950">
          <div className="max-w-4xl mx-auto space-y-4 text-center">
            <h3 className="font-semibold text-base sm:text-lg text-slate-200">{t('footerSupportTitle')}</h3>
             <p className="text-sm text-slate-400 leading-relaxed">
                {t('footerSupportText_part1')}
                <strong>{t('footerSupportText_bold')}</strong>
                {t('footerSupportText_part2')}
                <a href={donationLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-400 hover:text-cyan-300 underline">
                    {t('footerSupportLinkText')}
                </a>
                {t('footerSupportText_part3')}
             </p>
        
            <div className="pt-2">
                <hr className="border-slate-700/50 max-w-md mx-auto" />
            </div>
            
            <p className="italic text-slate-500 text-xs leading-relaxed">
                {t('footerCreditsText_part1')}
                <strong>{t('footerCreditsText_bold')}</strong>
                {t('footerCreditsText_part2')}
                <a href={donationLink} target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                    {donationLink}
                </a>.
            </p>
          </div>
      </footer>
    );
};


const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
    const [userProgress] = useLocalStorage<UserProgress>('taime-user-progress', { points: 0, level: 1 });

    return (
        <div className="flex h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar activePage={activePage} onNavigate={onNavigate} userProgress={userProgress} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
                <Footer />
            </div>
             <ToastContainer />
        </div>
    );
};

export default Layout;
