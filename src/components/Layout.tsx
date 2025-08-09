
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
                <footer className="shrink-0 text-xs text-gray-500 py-6 px-4 border-t border-t-gray-800 bg-gray-900">
                  <div className="max-w-4xl mx-auto space-y-4 text-center">
                    <h3 className="font-semibold text-base sm:text-lg text-gray-200">Apoie o taime ☕</h3>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Se o <strong>taime</strong> está te ajudando a domar os prazos e turbinar sua produtividade, que tal um "cafezinho"? Sua doação ajuda a manter os servidores no ar e a API do Gemini funcionando! Clique{' '}
                      <a href="https://link.mercadopago.com.br/taimeonline" target="_blank" rel="noopener noreferrer" className="font-semibold text-cyan-400 hover:text-cyan-300 underline">
                        aqui
                      </a>
                      {' '}para apoiar!
                    </p>
                
                    <div className="pt-2">
                        <hr className="border-gray-700/50 max-w-md mx-auto" />
                    </div>
                    
                    <p className="italic text-gray-500 text-xs leading-relaxed">
                      2025 - Licenciado sob GNU GPL v3 - Desenvolvido com 💜 por Edward para simplificar o gerenciamento de tempo do Dev Team. Agradecemos aos usuários e doadores que mantêm o <strong>taime</strong> vivo! Doe um ☕ via Pix:{' '}
                      <a href="https://link.mercadopago.com.br/taimeonline" target="_blank" rel="noopener noreferrer" className="text-cyan-500 hover:underline">
                        link.mercadopago.com.br/taimeonline
                      </a>.
                    </p>
                  </div>
              </footer>
            </div>
             <ToastContainer />
        </div>
    );
};

export default Layout;