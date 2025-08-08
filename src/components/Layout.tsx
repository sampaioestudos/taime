import React from 'react';
import Sidebar from './Sidebar';
import { Page } from '../App';
import useLocalStorage from '../hooks/useLocalStorage';
import { UserProgress } from '../types';
import { ToastContainer } from './Toast';

interface LayoutProps {
    children: React.ReactNode;
    activePage: Page;
    onNavigate: (page: Page) => void;
}

const Layout: React.FC<LayoutProps> = ({ children, activePage, onNavigate }) => {
    const [userProgress] = useLocalStorage<UserProgress>('taime-user-progress', { points: 0, level: 1 });

    return (
        <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
            <Sidebar activePage={activePage} onNavigate={onNavigate} userProgress={userProgress} />
            <div className="flex-1 flex flex-col overflow-hidden">
                <main className="flex-grow p-4 sm:p-6 lg:p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
                <footer className="shrink-0 text-center text-xs text-gray-500 py-4 px-4 border-t border-t-gray-800">
                  <div className="max-w-xl mx-auto space-y-2">
                    <p className="font-semibold text-sm text-gray-400 mb-1">💾 Quer ajudar?</p>
                    <p>Doe qualquer valor no link abaixo – pode ser o preço de um cafezinho ou de um latte turbinado!</p>
                    <a 
                      href="https://link.mercadopago.com.br/taimeonline" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="inline-block bg-cyan-600 text-white font-semibold px-4 py-1.5 rounded-md text-xs hover:bg-cyan-500 transition-colors"
                    >
                        Doação via Mercado Pago
                    </a>
                    <p className="pt-4 text-gray-600">© 2025 - Feito por Edward Sampaio com carinho para o meu time da TOTVS.</p>
                  </div>
              </footer>
            </div>
             <ToastContainer />
        </div>
    );
};

export default Layout;