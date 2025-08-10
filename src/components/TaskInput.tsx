import React from 'react';
import { PlusIcon } from './icons';
import { useTranslation } from '../i18n';
import { JiraIssue } from '../types';

interface TaskInputProps {
  taskName: string;
  jiraIssueKey: string;
  onTaskNameChange: (value: string) => void;
  onJiraIssueKeyChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  jiraIssues: JiraIssue[];
  isJiraSearching: boolean;
  onJiraIssueSelect: (issue: JiraIssue) => void;
  isJiraConfigured: boolean;
}

const JiraSearchResults: React.FC<{
    issues: JiraIssue[], 
    isLoading: boolean, 
    onSelect: (issue: JiraIssue) => void,
    t: (key: any) => string
}> = ({ issues, isLoading, onSelect, t }) => {
    if (isLoading) {
        return <div className="absolute top-full mt-2 w-full bg-slate-800 rounded-lg p-3 text-slate-400 text-sm shadow-lg z-10">{t('jiraSearching')}</div>;
    }

    if (issues.length === 0) {
        return null;
    }

    return (
        <ul className="absolute top-full mt-2 w-full bg-slate-800 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto ring-1 ring-slate-700">
            {issues.map(issue => (
                <li key={issue.key}>
                    <button
                        type="button"
                        onClick={() => onSelect(issue)}
                        className="w-full text-left flex items-center gap-3 p-3 hover:bg-slate-700 transition-colors"
                    >
                        <img src={issue.issuetype.iconUrl} alt={issue.issuetype.name} className="h-4 w-4" />
                        <span className="font-mono text-xs text-slate-400">{issue.key}</span>
                        <span className="flex-1 truncate text-sm text-slate-200">{issue.summary}</span>
                         <span className="text-xs text-slate-500 shrink-0">{issue.status.name}</span>
                    </button>
                </li>
            ))}
        </ul>
    );
};

const TaskInput: React.FC<TaskInputProps> = ({ 
    taskName, jiraIssueKey, onTaskNameChange, onJiraIssueKeyChange, 
    onSubmit, jiraIssues, isJiraSearching, onJiraIssueSelect, isJiraConfigured
}) => {
  const { t } = useTranslation();

  const showSearchResults = isJiraConfigured && (isJiraSearching || jiraIssues.length > 0);
  
  const inputClasses = "bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors";

  return (
    <div className="relative">
        <form onSubmit={onSubmit} className="flex flex-col gap-2 mb-6">
        <div className="flex flex-col sm:flex-row gap-2">
            <input
            type="text"
            value={taskName}
            onChange={(e) => onTaskNameChange(e.target.value)}
            placeholder={t('addTaskPlaceholder')}
            className={`flex-grow ${inputClasses}`}
            required
            autoComplete="off"
            />
            <input
            type="text"
            value={jiraIssueKey}
            onChange={(e) => onJiraIssueKeyChange(e.target.value.toUpperCase())}
            placeholder={t('jiraIssueKeyPlaceholder')}
            className={`sm:w-40 ${inputClasses}`}
            />
        </div>
        
        <button
            type="submit"
            className="bg-cyan-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-500 transition-colors flex items-center justify-center sm:self-start gap-2"
        >
            <PlusIcon className="h-5 w-5"/>
            <span>{t('addTaskButton')}</span>
        </button>
        </form>
        {showSearchResults && (
             <JiraSearchResults issues={jiraIssues} isLoading={isJiraSearching} onSelect={onJiraIssueSelect} t={t} />
        )}
    </div>
  );
};

export default TaskInput;
