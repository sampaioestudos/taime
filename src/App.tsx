import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/Home';
import SettingsPage from './pages/Settings';
import { useTranslation } from './i18n';

export type Page = 'home' | 'settings' | 'achievements';

const getPageFromQuery = (): Page => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') as Page;
    if (page === 'settings' || page === 'achievements') {
        return page;
    }
    return 'home';
};

const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>(getPageFromQuery());
    const { t, language } = useTranslation();

    useEffect(() => {
        const handlePopState = () => {
            setCurrentPage(getPageFromQuery());
        };
        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    useEffect(() => {
        let title = '';
        let description = '';

        switch(currentPage) {
            case 'settings':
                title = t('settingsPageTitle');
                description = t('settingsPageDescription');
                break;
            case 'home':
            default:
                title = t('homePageTitle');
                description = t('homePageDescription');
                break;
        }
        
        document.title = title;
        const descriptionTag = document.querySelector('meta[name="description"]');
        if (descriptionTag) descriptionTag.setAttribute('content', description);
        
        const ogTitleTag = document.querySelector('meta[property="og:title"]');
        if (ogTitleTag) ogTitleTag.setAttribute('content', title);
        
        const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
        if (ogDescriptionTag) ogDescriptionTag.setAttribute('content', description);

        const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
        if (twitterTitleTag) twitterTitleTag.setAttribute('content', title);
        
        const twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
        if (twitterDescriptionTag) twitterDescriptionTag.setAttribute('content', description);

    }, [currentPage, t, language]);

    const handleNavigate = (page: Page) => {
        setCurrentPage(page);
        const url = new URL(window.location.href);
        if (page === 'home') {
            url.searchParams.delete('page');
        } else {
            url.searchParams.set('page', page);
        }
        window.history.pushState({}, '', url);
    };

    return (
        <Layout activePage={currentPage} onNavigate={handleNavigate}>
            {/* The HomePage is always mounted but hidden to keep the timer running. */}
            <div style={{ display: currentPage === 'home' ? 'block' : 'none' }}>
                <HomePage />
            </div>

            {currentPage === 'settings' && <SettingsPage />}
            
            {/* 
            When 'achievements' page is implemented, it can be added here:
            {currentPage === 'achievements' && <AchievementsPage />} 
            */}
        </Layout>
    );
};

export default App;