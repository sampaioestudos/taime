

import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { useTranslation } from '../i18n';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  activeTaskId: string | null;
  onEditTask: (taskId: string, newName: string, newDescription?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onLogTimeToJira: (taskId: string) => void;
  onSyncToCalendar: (taskId: string) => void;
  isSignedIn: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, activeTaskId, onEditTask, onDeleteTask, onLogTimeToJira, onSyncToCalendar, isSignedIn }) => {
  const { t } = useTranslation();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-gray-800 rounded-lg">
        <p className="text-gray-400">{t('noTasks')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <TaskItem
          key={task.id}
          task={task}
          onTaskClick={onTaskClick}
          isActive={task.id === activeTaskId}
          onEditTask={onEditTask}
          onDeleteTask={onDeleteTask}
          onLogTimeToJira={onLogTimeToJira}
          onSyncToCalendar={onSyncToCalendar}
          isSignedIn={isSignedIn}
        />
      ))}
    </div>
  );
};

export default TaskList;