import React, { useState, useEffect } from 'react';
import { useTranslation } from '../i18n';
import useLocalStorage from '../hooks/useLocalStorage';
import { Goal, JiraConfig, History, Task, UserProgress } from '../types';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { CalendarIcon, JiraIcon, CheckCircleIcon, XIcon } from '../components/icons';
import { useToast } from '../components/Toast';
import { testJiraConnection } from '../services/jiraService';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const addToast = useToast();

  // Goal Settings
  const [goal, setGoal] = useLocalStorage<Goal | null>('taime-goal', { weeklyHours: 0, realtimeInsightsEnabled: false });
  const [hours, setHours] = useState(goal?.weeklyHours || 0);
  const [insightsEnabled, setInsightsEnabled] = useState(goal?.realtimeInsightsEnabled || false);

  // Data Management state
  const [, setHistory] = useLocalStorage<History>('taime-history', {});
  const [, setTasks] = useLocalStorage<Task[]>('taime-tasks', []);
  const [, setUserProgress] = useLocalStorage<UserProgress>('taime-user-progress', { points: 0, level: 1 });

  // Jira Settings
  const [jiraConfig, setJiraConfig] = useLocalStorage<JiraConfig | null>('taime-jira-config', null);
  const [jiraDomain, setJiraDomain] = useState('');
  const [jiraEmail, setJiraEmail] = useState('');
  const [jiraApiToken, setJiraApiToken] = useState('');
  const [jiraProjectKey, setJiraProjectKey] = useState('');
  const [isTestingJira, setIsTestingJira] = useState(false);
  const [jiraTestStatus, setJiraTestStatus] = useState<'success' | 'error' | null>(null);

  // Google Auth
  const { isSignedIn, user, signIn, signOut } = useGoogleAuth();
  
  useEffect(() => {
      if (jiraConfig) {
          setJiraDomain(jiraConfig.domain);
          setJiraEmail(jiraConfig.email);
          setJiraApiToken(jiraConfig.apiToken);
          setJiraProjectKey(jiraConfig.projectKey || '');
      }
  }, [jiraConfig]);
  
  // Reset test status if credentials change
  useEffect(() => {
      setJiraTestStatus(null);
  }, [jiraDomain, jiraEmail, jiraApiToken, jiraProjectKey]);


  const handleSaveGeneralSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setGoal({ weeklyHours: Number(hours), realtimeInsightsEnabled: insightsEnabled });
    addToast(t('settingsSaved'), 'success');
  };
  
  const handleSaveJiraConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if(jiraDomain.trim() && jiraEmail.trim() && jiraApiToken.trim()) {
        const newConfig: JiraConfig = {
            domain: jiraDomain.trim(),
            email: jiraEmail.trim(),
            apiToken: jiraApiToken.trim(),
            projectKey: jiraProjectKey.trim().toUpperCase() || undefined,
        };
        setJiraConfig(newConfig);
        addToast(t('jiraConfigSaved'), 'success');
    } else {
        addToast(t('jiraConfigError'), 'error');
    }
  }

  const handleTestJiraConnection = async () => {
    const config = {
        domain: jiraDomain.trim(),
        email: jiraEmail.trim(),
        apiToken: jiraApiToken.trim(),
    };
    if (!config.domain || !config.email || !config.apiToken) {
        addToast(t('jiraConfigError'), 'error');
        return;
    }

    setIsTestingJira(true);
    setJiraTestStatus(null);
    try {
        const success = await testJiraConnection(config);
        setJiraTestStatus(success ? 'success' : 'error');
        addToast(success ? t('jiraTestSuccess') : t('jiraTestError'), success ? 'success' : 'error');
    } catch (error) {
        setJiraTestStatus('error');
        addToast(t('jiraTestError'), 'error');
    } finally {
        setIsTestingJira(false);
    }
};

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 0) {
        value = 0;
    }
    if (value > 60) {
        value = 60;
    }
    setHours(value);
  }

  const handleClearData = () => {
    if (window.confirm(t('clearDataConfirm'))) {
        setHistory({});
        setTasks([]);
        setUserProgress({ points: 0, level: 1 });
        addToast(t('dataClearedSuccess'), 'success');
    }
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">
          {t('settingsTitle')}
        </h1>
      </header>

      <main className="max-w-2xl space-y-12">
        {/* General Settings */}
        <form onSubmit={handleSaveGeneralSettings} className="space-y-8">
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg ring-1 ring-white/10">
              <h2 className="text-xl font-semibold text-cyan-400">{t('weeklyGoalTitle')}</h2>
              <p className="text-gray-400 mt-1 mb-4">{t('weeklyGoalDescription')}</p>
              
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={hours}
                  onChange={handleHoursChange}
                  min="0"
                  max="60"
                  className="w-24 bg-gray-700 text-gray-200 text-center border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label={t('hoursPerWeek')}
                />
                <span className="text-gray-300">{t('hoursPerWeek')}</span>
              </div>
            </div>
          
            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg ring-1 ring-white/10">
              <h2 className="text-xl font-semibold text-cyan-400">{t('realtimeInsightsTitle')}</h2>
              <p className="text-gray-400 mt-1 mb-4 max-w-md">{t('realtimeInsightsDescription')}</p>
              
              <label htmlFor="insights-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id="insights-toggle" 
                        className="sr-only" 
                        checked={insightsEnabled}
                        onChange={() => setInsightsEnabled(!insightsEnabled)}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${insightsEnabled ? 'bg-cyan-600' : 'bg-gray-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${insightsEnabled ? 'translate-x-6' : ''}`}></div>
                </div>
            </label>
            </div>
             <button
                type="submit"
                className="px-5 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-colors"
              >
                {t('saveSettings')}
              </button>
        </form>

        <hr className="border-gray-700"/>
        
        {/* Integrations */}
        <div className="space-y-8">
             <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg ring-1 ring-white/10">
              <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6"/> {t('googleCalendarTitle')}
              </h2>
              <p className="text-gray-400 mt-1 mb-4">{t('googleCalendarDescription')}</p>
                {isSignedIn ? (
                    <div className="flex items-center justify-between">
                         <p className="text-sm text-gray-300">{t('connectedAs', {email: user?.profileObj?.email || ''})}</p>
                         <button onClick={signOut} className="text-sm font-semibold text-red-400 hover:text-red-300">
                             {t('disconnectGoogle')}
                         </button>
                    </div>
                ) : (
                    <button 
                        onClick={signIn}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gray-700 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-colors"
                    >
                        <CalendarIcon className="w-5 h-5"/>
                        {t('connectGoogle')}
                    </button>
                )}
            </div>

            <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg ring-1 ring-white/10">
                <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                    <JiraIcon className="w-5 h-5"/>{t('jiraIntegrationTitle')}
                </h2>
                <p className="text-gray-400 mt-1 mb-4">{t('jiraIntegrationDescription')}</p>
                <form onSubmit={handleSaveJiraConfig} className="space-y-4">
                    <input type="text" value={jiraDomain} onChange={e => setJiraDomain(e.target.value)} placeholder={t('jiraDomain')} className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    <input type="email" value={jiraEmail} onChange={e => setJiraEmail(e.target.value)} placeholder={t('jiraEmail')} className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                    <div>
                        <input type="password" value={jiraApiToken} onChange={e => setJiraApiToken(e.target.value)} placeholder={t('jiraApiToken')} className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" required />
                        <p className="text-xs text-gray-500 mt-1">{t('jiraApiTokenHelp')}</p>
                    </div>
                    <div>
                        <input type="text" value={jiraProjectKey} onChange={e => setJiraProjectKey(e.target.value.toUpperCase())} placeholder={t('jiraProjectKey')} className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
                        <p className="text-xs text-gray-500 mt-1">{t('jiraProjectKeyHelp')}</p>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                         <button
                            type="submit"
                            className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-md hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 transition-colors"
                        >
                            {t('saveJiraConfig')}
                        </button>
                         <button
                            type="button"
                            onClick={handleTestJiraConnection}
                            disabled={isTestingJira}
                            className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-gray-600 rounded-md hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-gray-500 transition-colors disabled:opacity-50 disabled:cursor-wait"
                        >
                            {isTestingJira ? t('jiraTesting') : t('jiraTestConnection')}
                        </button>
                        <div className="h-6 w-6">
                            {jiraTestStatus === 'success' && <CheckCircleIcon className="h-full w-full text-green-500 animate-fade-in" aria-label={t('jiraTestSuccess')}/>}
                            {jiraTestStatus === 'error' && <XIcon className="h-full w-full text-red-500 animate-fade-in" aria-label={t('jiraTestError')}/>}
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <hr className="border-gray-700"/>

        {/* Data Management */}
        <div className="bg-gray-800/50 p-6 rounded-xl shadow-lg ring-1 ring-white/10">
            <h2 className="text-xl font-semibold text-red-400">{t('dataManagementTitle')}</h2>
            <p className="text-gray-400 mt-1 mb-4">{t('clearDataDescription')}</p>
            <button
                onClick={handleClearData}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-md hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-red-500 transition-colors"
            >
                {t('clearDataButton')}
            </button>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;