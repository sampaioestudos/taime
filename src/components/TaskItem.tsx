import React, { useState } from 'react';
import { Task } from '../types';
import { formatTime } from '../utils/time';
import { PlayIcon, PauseIcon, EditIcon, TrashIcon, JiraIcon, CalendarIcon, CheckCircleIcon } from './icons';
import { useTranslation } from '../i18n';

interface TaskItemProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
  isActive: boolean;
  onEditTask: (taskId:string, newName: string, newDescription?: string, newJiraIssueKey?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onLogTimeToJira: (taskId: string) => void;
  onSyncToCalendar: (taskId: string) => void;
  isSyncing: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskClick, isActive, onEditTask, onDeleteTask, onLogTimeToJira, onSyncToCalendar, isSyncing }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.name);
  const [editedDescription, setEditedDescription] = useState(task.description || '');
  const [editedJiraKey, setEditedJiraKey] = useState(task.jiraIssueKey || '');


  const baseClasses = "flex items-center justify-between p-3 rounded-lg transition-all duration-200";
  const inactiveClasses = "bg-gray-700/60 hover:bg-gray-600/70";
  const activeClasses = "bg-cyan-600/80 ring-2 ring-cyan-400 shadow-lg";

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedName(task.name);
    setEditedDescription(task.description || '');
    setEditedJiraKey(task.jiraIssueKey || '');
    setIsEditing(true);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(task.id);
  };
  
  const handleLogJiraClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLogTimeToJira(task.id);
  }

  const handleSyncClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      onSyncToCalendar(task.id);
  };

  const handleSave = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editedName.trim()) {
      onEditTask(task.id, editedName.trim(), editedDescription.trim(), editedJiraKey.trim().toUpperCase());
    }
    setIsEditing(false);
  };

  const handleCancel = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(false);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { // Allow Shift+Enter in textarea
      e.preventDefault();
      handleSave(e);
    } else if (e.key === 'Escape') {
      handleCancel(e as any);
    }
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className={`${baseClasses} ${inactiveClasses} ring-2 ring-cyan-500 flex-col gap-2`}>
        <input
          type="text"
          value={editedName}
          onChange={(e) => setEditedName(e.target.value)}
          placeholder={t('taskNamePlaceholder')}
          className="flex-grow bg-gray-600 text-gray-100 border-none rounded-md px-3 py-1.5 focus:outline-none w-full text-base"
          autoFocus
        />
        <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder={t('taskDescriptionPlaceholder')}
            className="flex-grow bg-gray-600 text-gray-100 border-none rounded-md px-3 py-1.5 focus:outline-none w-full text-sm resize-y"
            rows={2}
        />
        <input
          type="text"
          value={editedJiraKey}
          onChange={(e) => setEditedJiraKey(e.target.value.toUpperCase())}
          placeholder={t('jiraIssueKeyPlaceholder')}
          className="flex-grow bg-gray-600 text-gray-100 border-none rounded-md px-3 py-1.5 focus:outline-none w-full text-sm"
           onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-2 self-end mt-1">
          <button
            type="submit"
            className="px-3 py-1 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-500"
          >
            {t('saveButton')}
          </button>
        </div>
      </form>
    );
  }

  const timeToLog = task.elapsedSeconds - (task.timeLoggedToJiraSeconds || 0);

  return (
    <div
      onClick={() => onTaskClick(task.id)}
      className={`${baseClasses} ${isActive ? activeClasses : inactiveClasses} group cursor-pointer`}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.name}. Time: ${formatTime(task.elapsedSeconds)}. Status: ${isActive ? 'Active' : 'Paused'}`}
    >
      <div className="flex flex-col gap-1 truncate flex-grow">
         <div className="flex items-center gap-2">
            <span className="font-medium text-gray-100 truncate">{task.name}</span>
            {task.jiraIssueKey && <span className="text-xs bg-blue-900/80 text-blue-300 font-mono px-1.5 py-0.5 rounded">{task.jiraIssueKey}</span>}
         </div>
         {task.description && <p className="text-sm text-gray-400 truncate">{task.description}</p>}
      </div>
     
      <div className="flex items-center gap-3 shrink-0">
         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {task.jiraIssueKey && timeToLog > 0 && (
                <button onClick={handleLogJiraClick} className="p-1 text-blue-400 hover:text-white" aria-label={t('jiraLogWork')}>
                    <JiraIcon className="h-4 w-4" />
                </button>
            )}
            {task.syncedToCalendar ? (
              <span className="p-1 text-green-400 flex items-center gap-1 text-xs" aria-label={t('synced')}>
                  <CheckCircleIcon className="h-4 w-4" />
              </span>
            ) : (
              task.elapsedSeconds > 0 && (
                    <button onClick={handleSyncClick} disabled={isSyncing} className="p-1 text-purple-400 hover:text-white disabled:cursor-wait disabled:opacity-50" aria-label={isSyncing ? t('syncing') : t('syncToCalendar')}>
                        {isSyncing ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <CalendarIcon className="h-4 w-4" />}
                    </button>
              )
            )}
           <button onClick={handleEditClick} className="p-1 text-gray-400 hover:text-white" aria-label={t('editTask')}>
             <EditIcon className="h-4 w-4" />
           </button>
           <button onClick={handleDeleteClick} className="p-1 text-red-400 hover:text-red-300" aria-label={t('deleteTask')}>
             <TrashIcon className="h-4 w-4" />
           </button>
         </div>

        <span className={`font-mono text-base sm:text-lg ${isActive ? 'text-white' : 'text-cyan-400'}`}>
          {formatTime(task.elapsedSeconds)}
        </span>
        <div className={`flex items-center justify-center h-8 w-8 rounded-full ${isActive ? 'bg-white/20' : 'bg-gray-600'}`}>
          {isActive ? <PauseIcon className="h-5 w-5 text-white" /> : <PlayIcon className="h-5 w-5 text-cyan-400" />}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;
