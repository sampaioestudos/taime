import React from 'react';
import { PlusIcon } from './icons';
import { useTranslation } from '../i18n';
import { JiraIssue } from '../types';

interface TaskInputProps {
  taskName: string;
  onTaskNameChange: (name: string) => void;
  onAddTask: () => void;
  isSearching: boolean;
  jiraIssues: JiraIssue[];
  onSelectIssue: (issue: JiraIssue) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ 
  taskName, 
  onTaskNameChange, 
  onAddTask,
  isSearching,
  jiraIssues,
  onSelectIssue
}) => {
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      onAddTask();
    }
  };

  return (
    <div className="relative mb-6">
      <form onSubmit={handleSubmit} className="flex items-start gap-2">
        <div className="relative flex-grow">
          <input
            type="text"
            value={taskName}
            onChange={(e) => onTaskNameChange(e.target.value)}
            placeholder={t('jiraSearchPlaceholder')}
            className="w-full bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
            required
            autoComplete="off"
          />
          {(isSearching || jiraIssues.length > 0) && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
              {isSearching ? (
                <div className="px-4 py-2 text-gray-400">{t('searchingIssues')}</div>
              ) : (
                <ul>
                  {jiraIssues.map(issue => (
                    <li 
                      key={issue.key} 
                      onClick={() => onSelectIssue(issue)}
                      className="px-4 py-2 hover:bg-cyan-700 cursor-pointer text-gray-200"
                    >
                      <span className="font-bold text-blue-400">{issue.key}</span>: {issue.summary}
                    </li>
                  ))}
                </ul>
              )}
               {jiraIssues.length === 0 && !isSearching && (
                 <div className="px-4 py-2 text-gray-400">{t('noIssuesFound')}</div>
               )}
            </div>
          )}
        </div>
        <button
          type="submit"
          className="bg-cyan-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-colors flex items-center justify-center gap-2 shrink-0"
        >
          <PlusIcon className="h-5 w-5"/>
          <span>{t('addTaskButton')}</span>
        </button>
      </form>
    </div>
  );
};

export default TaskInput;