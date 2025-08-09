import React from 'react';
import Sidebar from './Sidebar';
import { Page } from '../App';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProgress } from '../types';
import { ToastContainer } from './Toast';
import { useTranslation } from '../i18n';

const Footer: React.FC = () => {
    const { t } = useTranslation();
    return (
        <footer className="mt-12 text-center text-xs text-slate-500 space-y-4 py-8 border-t border-slate-800">
             <div>
                <h4 className="font-bold text-sm text-slate-400 mb-2">{t('footerSupportTitle')}</h4>
                <p>
                    {t('footerSupportText_part1')}
                    <strong className="text-slate-300">{t('footerSupportText_bold')}</strong>
                    {t('footerSupportText_part2')}
                    <a href="https://www.buymeacoffee.com/edward" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">{t('footerSupportLinkText')}</a>
                    {t('footerSupportText_part3')}
                </p>
            </div>
            <div>
                <p>
                    {t('footerCreditsText_part1')}
                    <strong className="text-slate-300">{t('footerCreditsText_bold')}</strong>
                    {t('footerCreditsText_part2')}
                    <span className="font-mono text-cyan-400">edward@taime.com.br</span>.
                </p>
            </div>
        </footer>
    );
}


const Layout: React.FC<{ children: React.ReactNode; activePage: Page; onNavigate: (page: Page) => void; }> = ({ children, activePage, onNavigate }) => {
    const [userProgress] = useLocalStorage<UserProgress>('taime-user-progress', { points: 0, level: 1 });

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar activePage={activePage} onNavigate={onNavigate} userProgress={userProgress} />
            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <div className="flex-grow max-w-7xl mx-auto w-full">
                    {children}
                </div>
                <Footer />
            </main>
            <ToastContainer />
        </div>
    );
};

export default Layout;
