import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PlusIcon } from './icons';
import { useTranslation } from '../i18n';
import useLocalStorage from '../hooks/useLocalStorage';
import { JiraConfig, JiraIssue } from '../types';
import { searchJiraIssues } from '../services/jiraService';

interface TaskInputProps {
  onAddTask: (taskName: string, jiraIssueKey?: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [taskName, setTaskName] = useState('');
  const [selectedJiraKey, setSelectedJiraKey] = useState<string | undefined>(undefined);
  const { t } = useTranslation();
  const [jiraConfig] = useLocalStorage<JiraConfig | null>('taime-jira-config', null);

  const [searchResults, setSearchResults] = useState<JiraIssue[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSearch = useCallback((query: string) => {
    if (!jiraConfig || !query) {
      setSearchResults([]);
      return;
    }
    if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
    }
    searchTimeout.current = window.setTimeout(async () => {
        setIsSearching(true);
        try {
            const results = await searchJiraIssues(jiraConfig, query);
            setSearchResults(results);
            setShowResults(true);
        } catch (error) {
            console.error("Jira search failed:", error);
            setSearchResults([]);
        } finally {
            setIsSearching(false);
        }
    }, 500); // 500ms debounce
  }, [jiraConfig]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setTaskName(newName);
    setSelectedJiraKey(undefined); // Clear selected key if user types again
    if (newName.length > 2 && jiraConfig) {
      handleSearch(newName);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  const handleSelectIssue = (issue: JiraIssue) => {
    setTaskName(issue.summary);
    setSelectedJiraKey(issue.key);
    setSearchResults([]);
    setShowResults(false);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      onAddTask(taskName.trim(), selectedJiraKey);
      setTaskName('');
      setSelectedJiraKey(undefined);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 mb-6">
      <div className="relative" ref={containerRef}>
        <input
          type="text"
          value={taskName}
          onChange={handleInputChange}
          onFocus={() => searchResults.length > 0 && setShowResults(true)}
          placeholder={jiraConfig ? t('addTaskPlaceholder') : t('taskNamePlaceholder')}
          className="w-full bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
          required
          autoComplete="off"
        />
        {showResults && (isSearching || searchResults.length > 0) && (
            <div className="absolute z-10 w-full mt-1 bg-slate-700 border border-slate-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                    <div className="px-4 py-2 text-slate-400">{t('jiraSearching')}</div>
                ) : (
                    <ul className="divide-y divide-slate-600">
                        {searchResults.map(issue => (
                            <li key={issue.key} onClick={() => handleSelectIssue(issue)} className="px-4 py-2 hover:bg-cyan-600 cursor-pointer transition-colors">
                                <div className="font-bold text-slate-100">{issue.key}</div>
                                <div className="text-sm text-slate-300 truncate">{issue.summary}</div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        )}
      </div>
      
      <button
        type="submit"
        className="bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-500 transition-colors flex items-center justify-center sm:self-start gap-2"
      >
        <PlusIcon className="h-5 w-5"/>
        <span>{t('addTaskButton')}</span>
      </button>
    </form>
  );
};

export default TaskInput;
