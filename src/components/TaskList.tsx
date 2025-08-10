import React from 'react';
import { Task } from '../types';
import TaskItem from './TaskItem';
import { useTranslation } from '../i18n';

interface TaskListProps {
  tasks: Task[];
  onTaskClick: (taskId: string) => void;
  activeTaskId: string | null;
  onEditTask: (taskId: string, newName: string, newDescription?: string, newJiraIssueKey?: string) => void;
  onDeleteTask: (taskId: string) => void;
  onLogTimeToJira: (taskId: string) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onTaskClick, activeTaskId, onEditTask, onDeleteTask, onLogTimeToJira }) => {
  const { t } = useTranslation();

  if (tasks.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-slate-900/70 rounded-lg">
        <p className="text-slate-400">{t('noTasks')}</p>
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
        />
      ))}
    </div>
  );
};

export default TaskList;
