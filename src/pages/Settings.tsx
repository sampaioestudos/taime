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
    const config: JiraConfig = {
        domain: jiraDomain.trim(),
        email: jiraEmail.trim(),
        apiToken: jiraApiToken.trim(),
        projectKey: jiraProjectKey.trim().toUpperCase() || undefined,
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
    if (value > 168) { // 24 * 7
        value = 168;
    }
    setHours(value);
  }

  const handleClearData = () => {
    if (window.confirm(t('clearDataConfirm'))) {
        setHistory({});
        setTasks([]);
        setUserProgress({ points: 0, level: 1 });
        setGoal({ weeklyHours: 0, realtimeInsightsEnabled: false });
        setJiraConfig(null);
        if (isSignedIn) {
            signOut();
        }
        addToast(t('dataClearedSuccess'), 'success');
    }
  };

  const Card: React.FC<{children: React.ReactNode}> = ({ children }) => (
    <div className="bg-slate-900/70 p-6 rounded-xl shadow-lg ring-1 ring-slate-800">
        {children}
    </div>
  );

  const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
    <input {...props} className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors" />
  );
  
  const baseButtonClasses = "px-5 py-2 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors";
  const primaryButtonClasses = `${baseButtonClasses} bg-cyan-600 text-white hover:bg-cyan-500 focus:ring-cyan-500`;
  const secondaryButtonClasses = `${baseButtonClasses} bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500`;
  const destructiveButtonClasses = `${baseButtonClasses} bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500`;


  return (
    <div>
      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100 leading-tight">
          {t('settingsTitle')}
        </h1>
      </header>

      <main className="max-w-2xl space-y-12">
        {/* General Settings */}
        <form onSubmit={handleSaveGeneralSettings} className="space-y-8">
            <Card>
              <h2 className="text-xl font-semibold text-cyan-400">{t('weeklyGoalTitle')}</h2>
              <p className="text-slate-400 mt-1 mb-4">{t('weeklyGoalDescription')}</p>
              
              <div className="flex items-center gap-4">
                <input
                  type="number"
                  value={hours}
                  onChange={handleHoursChange}
                  min="0"
                  max="168"
                  className="w-24 bg-slate-800 text-slate-200 text-center border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                  aria-label={t('hoursPerWeek')}
                />
                <span className="text-slate-300">{t('hoursPerWeek')}</span>
              </div>
            </Card>
          
            <Card>
              <h2 className="text-xl font-semibold text-cyan-400">{t('realtimeInsightsTitle')}</h2>
              <p className="text-slate-400 mt-1 mb-4 max-w-md">{t('realtimeInsightsDescription')}</p>
              
              <label htmlFor="insights-toggle" className="flex items-center cursor-pointer">
                <div className="relative">
                    <input 
                        type="checkbox" 
                        id="insights-toggle" 
                        className="sr-only" 
                        checked={insightsEnabled}
                        onChange={() => setInsightsEnabled(!insightsEnabled)}
                    />
                    <div className={`block w-14 h-8 rounded-full transition-colors ${insightsEnabled ? 'bg-cyan-600' : 'bg-slate-700 border border-slate-600'}`}></div>
                    <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${insightsEnabled ? 'translate-x-6' : ''}`}></div>
                </div>
            </label>
            </Card>
             <button
                type="submit"
                className={primaryButtonClasses}
              >
                {t('saveSettings')}
              </button>
        </form>

        <hr className="border-slate-700/50"/>
        
        {/* Integrations */}
        <div className="space-y-8">
             <Card>
              <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                  <CalendarIcon className="w-6 h-6"/> {t('googleCalendarTitle')}
              </h2>
              <p className="text-slate-400 mt-1 mb-4">{t('googleCalendarDescription')}</p>
                {isSignedIn ? (
                    <div className="flex items-center justify-between">
                         <p className="text-sm text-slate-300">{t('connectedAs', {email: user?.email || ''})}</p>
                         <button onClick={signOut} className="text-sm font-semibold text-rose-500 hover:text-rose-400 transition-colors">
                             {t('disconnectGoogle')}
                         </button>
                    </div>
                ) : (
                    <button 
                        onClick={signIn}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 transition-colors bg-slate-700 text-slate-200 hover:bg-slate-600 focus:ring-slate-500"
                    >
                        <CalendarIcon className="w-5 h-5"/>
                        {t('connectGoogle')}
                    </button>
                )}
            </Card>

            <Card>
                <h2 className="text-xl font-semibold text-cyan-400 flex items-center gap-2">
                    <JiraIcon className="w-5 h-5"/>{t('jiraIntegrationTitle')}
                </h2>
                <p className="text-slate-400 mt-1 mb-4">{t('jiraIntegrationDescription')}</p>
                <form onSubmit={handleSaveJiraConfig} className="space-y-4">
                    <Input type="text" value={jiraDomain} onChange={e => setJiraDomain(e.target.value)} placeholder={t('jiraDomain')} required />
                    <Input type="email" value={jiraEmail} onChange={e => setJiraEmail(e.target.value)} placeholder={t('jiraEmail')} required />
                    <div>
                        <Input type="password" value={jiraApiToken} onChange={e => setJiraApiToken(e.target.value)} placeholder={t('jiraApiToken')} required />
                        <p className="text-xs text-slate-500 mt-1 px-1">{t('jiraApiTokenHelp')}</p>
                    </div>
                     <div>
                        <Input type="text" value={jiraProjectKey} onChange={e => setJiraProjectKey(e.target.value.toUpperCase())} placeholder={t('jiraProjectKey')} />
                        <p className="text-xs text-slate-500 mt-1 px-1">{t('jiraProjectKeyHelp')}</p>
                    </div>
                    <div className="flex items-center gap-4 pt-2">
                         <button
                            type="submit"
                            className={primaryButtonClasses}
                        >
                            {t('saveJiraConfig')}
                        </button>
                         <button
                            type="button"
                            onClick={handleTestJiraConnection}
                            disabled={isTestingJira}
                            className={`${secondaryButtonClasses} flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait`}
                        >
                            {isTestingJira ? t('jiraTesting') : t('jiraTestConnection')}
                        </button>
                        <div className="h-6 w-6">
                            {jiraTestStatus === 'success' && <CheckCircleIcon className="h-full w-full text-emerald-500 animate-fade-in" aria-label={t('jiraTestSuccess')}/>}
                            {jiraTestStatus === 'error' && <XIcon className="h-full w-full text-rose-500 animate-fade-in" aria-label={t('jiraTestError')}/>}
                        </div>
                    </div>
                </form>
            </Card>
        </div>

        <hr className="border-slate-700/50"/>

        {/* Data Management */}
        <Card>
            <h2 className="text-xl font-semibold text-rose-500">{t('dataManagementTitle')}</h2>
            <p className="text-slate-400 mt-1 mb-4">{t('clearDataDescription')}</p>
            <button
                onClick={handleClearData}
                className={destructiveButtonClasses}
            >
                {t('clearDataButton')}
            </button>
        </Card>
      </main>
    </div>
  );
};

export default SettingsPage;
