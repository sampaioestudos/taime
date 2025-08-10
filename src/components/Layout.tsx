import React from 'react';
import Sidebar from './Sidebar';
import { Page } from '../App';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProgress } from '../types';
import { ToastContainer } from './Toast';
import Footer from './Footer';

interface LayoutProps {
    children: React.ReactNode;
    activePage: Page;
    onNavigate: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
    const [userProgress] = useLocalStorage<UserProgress>('taime-user-progress', { points: 0, level: 1 });

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
            <Sidebar activePage={activePage} onNavigate={onNavigate} userProgress={userProgress} />
            <main className="flex-1 flex flex-col p-4 sm:p-6 lg:p-8 overflow-y-auto relative">
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
