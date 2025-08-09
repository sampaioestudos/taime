import React, { useState, useEffect } from 'react';
import { PlusIcon, JiraIcon } from './icons';
import { useTranslation } from '../i18n';
import useLocalStorage from '../hooks/useLocalStorage';
import { JiraConfig, JiraIssue } from '../types';
import { searchJiraIssues } from '../services/jiraService';

interface TaskInputProps {
  onAddTask: (taskName: string, jiraIssueKey?: string) => void;
}

// Debounce hook
const useDebounce = (value: string, delay: number) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);
        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);
    return debouncedValue;
};


const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [jiraConfig] = useLocalStorage<JiraConfig | null>('taime-jira-config', null);

  const [isSearchingJira, setIsSearchingJira] = useState(false);
  const [jiraIssues, setJiraIssues] = useState<JiraIssue[]>([]);
  const [showJiraResults, setShowJiraResults] = useState(false);
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    const search = async () => {
        if (debouncedSearchTerm.length > 2 && jiraConfig) {
            setIsSearchingJira(true);
            setJiraIssues([]);
            try {
                const results = await searchJiraIssues(jiraConfig, debouncedSearchTerm);
                setJiraIssues(results);
            } catch (error) {
                console.error("Jira search failed:", error);
                setJiraIssues([]);
            } finally {
                setIsSearchingJira(false);
            }
        } else {
            setJiraIssues([]);
        }
    };
    search();
  }, [debouncedSearchTerm, jiraConfig]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onAddTask(searchTerm.trim());
      setSearchTerm('');
      setJiraIssues([]);
    }
  };
  
  const handleSelectIssue = (issue: JiraIssue) => {
    onAddTask(issue.summary, issue.key);
    setSearchTerm('');
    setJiraIssues([]);
    setShowJiraResults(false);
  };

  const handleFocus = () => {
    if (jiraIssues.length > 0) {
      setShowJiraResults(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding results to allow click event to register
    setTimeout(() => {
      setShowJiraResults(false);
    }, 200);
  };
  
  useEffect(() => {
      if (jiraIssues.length > 0) {
          setShowJiraResults(true);
      } else {
          setShowJiraResults(false);
      }
  }, [jiraIssues]);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={t('addTaskPlaceholder')}
          className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg pl-4 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
          autoComplete="off"
        />
        {isSearchingJira && <div className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin rounded-full h-5 w-5 border-b-2 border-slate-400"></div>}
        
        {showJiraResults && jiraIssues.length > 0 && (
            <div className="absolute z-10 w-full mt-2 bg-slate-800 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                <ul className="divide-y divide-slate-700">
                    {jiraIssues.map(issue => (
                        <li key={issue.key}>
                           <button
                                type="button"
                                onClick={() => handleSelectIssue(issue)}
                                className="w-full text-left flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors"
                           >
                               <JiraIcon className="w-4 h-4 text-sky-400 shrink-0"/>
                               <div className="flex-1 truncate">
                                   <span className="font-mono text-xs text-sky-400">{issue.key}</span>
                                   <p className="text-sm text-slate-200 truncate">{issue.summary}</p>
                               </div>
                           </button>
                        </li>
                    ))}
                </ul>
            </div>
        )}
      </div>
      
      <button
        type="submit"
        className="bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-500 transition-colors flex items-center justify-center sm:self-start gap-2 disabled:bg-slate-700 disabled:cursor-not-allowed"
        disabled={!searchTerm.trim()}
      >
        <PlusIcon className="h-5 w-5"/>
        <span>{t('addTaskButton')}</span>
      </button>
    </form>
  );
};

export default TaskInput;