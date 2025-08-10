import React, { useState } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import SettingsPage from './pages/Settings';

export type Page = 'home' | 'settings' | 'achievements';

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('home');

    const renderPage = () => {
        switch (currentPage) {
            case 'home':
                return <HomePage />;
            case 'settings':
                return <SettingsPage />;
            // case 'achievements':
            //     return <AchievementsPage />;
            default:
                return <HomePage />;
        }
    };

    return (
        <Layout activePage={currentPage} onNavigate={setCurrentPage}>
            {renderPage()}
        </Layout>
    );
};

export default App;
