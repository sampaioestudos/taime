import React, { useState } from 'react';
import { Task } from '../types';
import { formatTime } from '../utils/time';
import { PlayIcon, PauseIcon, EditIcon, TrashIcon, JiraIcon, CalendarIcon, CheckCircleIcon } from './icons';
import { useTranslation } from '../i18n';

interface TaskItemProps {
  task: Task;
  onTaskClick: (taskId: string) => void;
  isActive: boolean;
  onEditTask: (taskId:string, newName: string, newDescription?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onLogTimeToJira: (taskId: string) => void;
  onSyncToCalendar: (taskId: string) => void;
  isSignedIn: boolean;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onTaskClick, isActive, onEditTask, onDeleteTask, onLogTimeToJira, onSyncToCalendar, isSignedIn }) => {
  const { t } = useTranslation();
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(task.name);
  const [editedDescription, setEditedDescription] = useState(task.description || '');


  const baseClasses = "flex items-center justify-between p-3 rounded-lg transition-all duration-300";
  const inactiveClasses = "bg-slate-800 hover:bg-slate-700/70";
  const activeClasses = "bg-cyan-500/20 ring-2 ring-cyan-500 shadow-lg";

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setEditedName(task.name);
    setEditedDescription(task.description || '');
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

  const handleSyncCalendarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSyncToCalendar(task.id);
  }

  const handleSave = (e: React.MouseEvent | React.FormEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editedName.trim()) {
      onEditTask(task.id, editedName.trim(), editedDescription.trim());
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
          className="flex-grow bg-slate-700 text-slate-100 border-none rounded-md px-3 py-1.5 focus:outline-none w-full text-base"
          autoFocus
          onKeyDown={handleKeyDown}
        />
        <textarea
            value={editedDescription}
            onChange={(e) => setEditedDescription(e.target.value)}
            placeholder={t('taskDescriptionPlaceholder')}
            className="flex-grow bg-slate-700 text-slate-100 border-none rounded-md px-3 py-1.5 focus:outline-none w-full text-sm resize-y"
            rows={2}
            onKeyDown={handleKeyDown}
        />
        <div className="flex items-center gap-2 self-end mt-1">
          <button
            type="submit"
            className="px-3 py-1 text-sm font-semibold text-white bg-cyan-600 rounded-md hover:bg-cyan-500 transition-colors"
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
      className={`${baseClasses} group cursor-pointer ${isActive ? activeClasses : inactiveClasses}`}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.name}. Time: ${formatTime(task.elapsedSeconds)}. Status: ${isActive ? 'Active' : 'Paused'}`}
    >
      <div className="flex flex-col gap-1 truncate flex-grow">
         <div className="flex items-center gap-2">
            <span className="font-medium text-slate-100 truncate">{task.name}</span>
            {task.jiraIssueKey && <span className="text-xs bg-sky-900/80 text-sky-300 font-mono px-1.5 py-0.5 rounded">{task.jiraIssueKey}</span>}
         </div>
         {task.description && <p className="text-sm text-slate-400 truncate">{task.description}</p>}
      </div>
     
      <div className="flex items-center gap-3 shrink-0">
         <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            {task.jiraIssueKey && timeToLog > 0 && (
                <button onClick={handleLogJiraClick} className="p-1 text-sky-400 hover:text-white" aria-label={t('jiraLogWork')}>
                    <JiraIcon className="h-4 w-4" />
                </button>
            )}
            {isSignedIn && task.elapsedSeconds > 0 && (
                task.syncedToCalendar ? (
                    <span className="p-1 text-emerald-400" aria-label={t('synced')}><CheckCircleIcon className="h-4 w-4"/></span>
                ) : (
                <button onClick={handleSyncCalendarClick} className="p-1 text-violet-400 hover:text-white" aria-label={t('syncToCalendar')}>
                    <CalendarIcon className="h-4 w-4" />
                </button>
                )
            )}
           <button onClick={handleEditClick} className="p-1 text-slate-400 hover:text-white" aria-label={t('editTask')}>
             <EditIcon className="h-4 w-4" />
           </button>
           <button onClick={handleDeleteClick} className="p-1 text-rose-500 hover:text-rose-400" aria-label={t('deleteTask')}>
             <TrashIcon className="h-4 w-4" />
           </button>
         </div>

        <span className={`font-mono text-base sm:text-lg ${isActive ? 'text-white' : 'text-cyan-400'}`}>
          {formatTime(task.elapsedSeconds)}
        </span>
        <div className={`flex items-center justify-center h-8 w-8 rounded-full transition-colors ${isActive ? 'bg-white/20' : 'bg-slate-700'}`}>
          {isActive ? <PauseIcon className="h-5 w-5 text-white" /> : <PlayIcon className="h-5 w-5 text-cyan-400" />}
        </div>
      </div>
    </div>
  );
};

export default TaskItem;