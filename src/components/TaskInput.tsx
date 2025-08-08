import React, { useState } from 'react';
import { PlusIcon } from './icons';
import { useTranslation } from '../i18n';

interface TaskInputProps {
  onAddTask: (taskName: string, jiraIssueKey?: string) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [taskName, setTaskName] = useState('');
  const [jiraIssueKey, setJiraIssueKey] = useState('');
  const { t } = useTranslation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taskName.trim()) {
      onAddTask(taskName.trim(), jiraIssueKey.trim());
      setTaskName('');
      setJiraIssueKey('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2 mb-6">
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={taskName}
          onChange={(e) => setTaskName(e.target.value)}
          placeholder={t('addTaskPlaceholder')}
          className="flex-grow bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
          required
        />
        <input
          type="text"
          value={jiraIssueKey}
          onChange={(e) => setJiraIssueKey(e.target.value.toUpperCase())}
          placeholder={t('jiraIssueKeyPlaceholder')}
          className="sm:w-40 bg-gray-700 text-gray-200 border border-gray-600 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
        />
      </div>
      
      <button
        type="submit"
        className="bg-cyan-600 text-white font-semibold px-4 py-2 rounded-md hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-cyan-500 transition-colors flex items-center justify-center sm:self-start gap-2"
      >
        <PlusIcon className="h-5 w-5"/>
        <span>{t('addTaskButton')}</span>
      </button>
    </form>
  );
};

export default TaskInput;
