import React, { useState, useEffect, useCallback } from 'react';
import { Task, AnalysisResult, History, DailyRecord, Goal, UserProgress, JiraConfig } from '../types';
import TaskInput from '../components/TaskInput';
import TaskList from '../components/TaskList';
import Report from '../components/Report';
import LanguageSwitcher from '../components/LanguageSwitcher';
import WeeklyHistory from '../components/WeeklyHistory';
import Modal from '../components/Modal';
import { getTaskAnalysis } from '../services/geminiService';
import { getTodayISOString } from '../utils/date';
import { BrainCircuitIcon, ExportIcon } from '../components/icons';
import { useTranslation } from '../i18n';
import useLocalStorage from '../hooks/useLocalStorage';
import { calculatePoints } from '../utils/gamification';
import { useRealtimeInsights } from '../hooks/useRealtimeInsights';
import ExportImportModal from '../components/ExportImportModal';
import { exportToCsv, exportToJson, mergeImportedHistory } from '../utils/exportImportService';
import { useToast } from '../components/Toast';
import { logWorkToJira } from '../services/jiraService';


const HomePage: React.FC = () => {
  const [tasks, setTasks] = useLocalStorage<Task[]>('taime-tasks', []);
  const [history, setHistory] = useLocalStorage<History>('taime-history', {});
  const [goal, setGoal] = useLocalStorage<Goal | null>('taime-goal', null);
  const [userProgress, setUserProgress] = useLocalStorage<UserProgress>('taime-user-progress', { points: 0, level: 1 });
  const [jiraConfig] = useLocalStorage<JiraConfig | null>('taime-jira-config', null);


  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useTranslation();
  const addToast = useToast();

  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isExportImportModalOpen, setIsExportImportModalOpen] = useState(false);
  const [historicalAnalysis, setHistoricalAnalysis] = useState<AnalysisResult | null>(null);
  const [isAnalyzingHistory, setIsAnalyzingHistory] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  
  const activeTask = tasks.find(t => t.id === activeTaskId) || null;
  useRealtimeInsights({ activeTask, isEnabled: goal?.realtimeInsightsEnabled ?? false });
  
  useEffect(() => {
    let interval: number | null = null;
    if (activeTaskId) {
      interval = window.setInterval(() => {
        setTasks(prevTasks =>
          prevTasks.map(task =>
            task.id === activeTaskId
              ? { ...task, elapsedSeconds: task.elapsedSeconds + 1 }
              : task
          )
        );
      }, 1000);
    }
    return () => {
      if (interval) {
        window.clearInterval(interval);
      }
    };
  }, [activeTaskId, setTasks]);

  const handleAddTask = (taskName: string, jiraIssueKey?: string) => {
    if (taskName.trim() === '') return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      name: taskName,
      description: '',
      elapsedSeconds: 0,
      syncedToCalendar: false,
      jiraIssueKey: jiraIssueKey || undefined,
      timeLoggedToJiraSeconds: 0,
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };

  const handleTaskClick = (taskId: string) => {
    setActiveTaskId(prevActiveTaskId => (prevActiveTaskId === taskId ? null : taskId));
  };
  
  const saveTasksToHistory = useCallback((tasksToSave: Task[]) => {
      if (tasksToSave.length === 0) return;

      const todayISO = getTodayISOString();
      const completionDate = new Date().toISOString();
      let totalPointsGained = 0;
      
      const tasksWithCompletionDate = tasksToSave.map(task => ({...task, completionDate}));

      setHistory(prevHistory => {
        const existingRecord = prevHistory[todayISO] || { date: todayISO, tasks: [], totalTime: 0 };
        
        tasksWithCompletionDate.forEach(task => {
            totalPointsGained += calculatePoints(task.elapsedSeconds);
        });
        
        const newTime = tasksWithCompletionDate.reduce((sum, t) => sum + t.elapsedSeconds, 0);
        const updatedTasks = [...existingRecord.tasks, ...tasksWithCompletionDate];

        const updatedRecord: DailyRecord = {
          date: todayISO,
          tasks: updatedTasks,
          totalTime: existingRecord.totalTime + newTime,
        };
        return { ...prevHistory, [todayISO]: updatedRecord };
      });

      if (totalPointsGained > 0) {
        setUserProgress(prev => ({
            ...prev,
            points: prev.points + totalPointsGained,
        }));
      }

  }, [setHistory, setUserProgress]);

  const handleResetDay = useCallback(() => {
    const tasksToSave = tasks.filter(t => t.elapsedSeconds > 0);
    saveTasksToHistory(tasksToSave);
    setActiveTaskId(null);
    setTasks([]);
    setAnalysisResult(null);
    setError(null);
  }, [tasks, setTasks, saveTasksToHistory]);

  const handleEditTask = (taskId: string, newName: string, newDescription?: string, newJiraIssueKey?: string) => {
    setTasks(prevTasks =>
      prevTasks.map(task =>
        task.id === taskId ? { ...task, name: newName, description: newDescription, jiraIssueKey: newJiraIssueKey } : task
      )
    );
  };

  const handleDeleteTask = (taskId: string) => {
    const taskToDelete = tasks.find(t => t.id === taskId);
    if (taskToDelete && taskToDelete.elapsedSeconds > 0) {
        saveTasksToHistory([taskToDelete]);
    }
    if (activeTaskId === taskId) {
        setActiveTaskId(null);
    }
    setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
  };

  const handleLogTimeToJira = useCallback(async (taskId: string) => {
      const task = tasks.find(t => t.id === taskId);
      if (!task || !task.jiraIssueKey || !jiraConfig) {
          addToast(t('jiraLogError'), 'error');
          return;
      }

      const timeToLogSeconds = task.elapsedSeconds - (task.timeLoggedToJiraSeconds || 0);
      if (timeToLogSeconds <= 0) {
          addToast("No new time to log.", 'info');
          return;
      }
      
      try {
          await logWorkToJira(jiraConfig, task.jiraIssueKey, timeToLogSeconds);
          addToast(t('jiraLogSuccess'), 'success');
          setTasks(prev => prev.map(p => 
              p.id === taskId ? { ...p, timeLoggedToJiraSeconds: p.elapsedSeconds } : p
          ));
      } catch (error) {
          console.error("Jira log failed:", error);
          addToast(t('jiraLogError'), 'error');
      }

  }, [tasks, jiraConfig, addToast, t, setTasks]);
  
  const aggregateTasksByName = (tasksToAggregate: Task[]): Task[] => {
    return tasksToAggregate.reduce<Task[]>((acc, task) => {
      const existingTask = acc.find(t => t.name === task.name && t.description === task.description && t.jiraIssueKey === task.jiraIssueKey);
      if (existingTask) {
        existingTask.elapsedSeconds += task.elapsedSeconds;
      } else {
        acc.push({ ...task });
      }
      return acc;
    }, []);
  };

  const handleAnalyze = useCallback(async () => {
    const todayISO = getTodayISOString();
    const historicalTasksToday = history[todayISO]?.tasks || [];
    const allTasksForToday = [...historicalTasksToday, ...tasks.filter(t => t.elapsedSeconds > 0)];

     if (allTasksForToday.length === 0) {
        setError(t('errorAddTasks'));
        return;
    }
    
    const aggregatedTasks = aggregateTasksByName(allTasksForToday);

    setIsAnalyzing(true);
    setError(null);
    setAnalysisResult(null);
    try {
      const result = await getTaskAnalysis(aggregatedTasks, language);
      setAnalysisResult(result);
    } catch (err) {
      console.error("Analysis failed:", err);
      setError(t('errorAnalysisFailed'));
    } finally {
      setIsAnalyzing(false);
    }
  }, [tasks, history, language, t]);

  const handleAnalyzePastDay = useCallback(async (dateISO: string) => {
    const tasksForDay = history[dateISO]?.tasks;
    if (!tasksForDay || tasksForDay.length === 0) return;

    const aggregatedTasks = aggregateTasksByName(tasksForDay);

    setSelectedDate(dateISO);
    setIsAnalyzingHistory(true);
    setIsHistoryModalOpen(true);
    setHistoricalAnalysis(null);

    try {
      const result = await getTaskAnalysis(aggregatedTasks, language);
      setHistoricalAnalysis(result);
    } catch (err) {
      console.error("Historical analysis failed:", err);
      setHistoricalAnalysis({ categories: [], insights: [t('errorAnalysisFailed')] });
    } finally {
      setIsAnalyzingHistory(false);
    }
  }, [history, language, t]);

  const handleExport = (format: 'json' | 'csv') => {
    if (format === 'json') {
      exportToJson(history);
    } else {
      exportToCsv(history);
    }
  };

  const handleImport = (fileContent: string) => {
    try {
        const importedData = JSON.parse(fileContent);
        const newHistory = mergeImportedHistory(history, importedData);
        setHistory(newHistory);
        addToast(t('importSuccess'), 'success');
        setIsExportImportModalOpen(false);
    } catch(e) {
        addToast(t('importError'), 'error');
        console.error("Import failed:", e);
    }
  };

  const todayISO = getTodayISOString();
  const historicalTasksToday = history[todayISO]?.tasks || [];
  const allTasksForTodayCount = historicalTasksToday.length + tasks.filter(t => t.elapsedSeconds > 0).length;

  return (
    <>
      <header className="flex justify-between items-center mb-8 gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white leading-tight">{t('manageTasks')}</h1>
          </div>
           <div className="flex items-center gap-2 sm:gap-4">
            <button
                onClick={() => setIsExportImportModalOpen(true)}
                className="p-2 text-gray-300 bg-slate-800 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-500 transition-colors"
                aria-label={t('exportImportButton')}
              >
                <ExportIcon className="h-5 w-5"/>
              </button>
            <LanguageSwitcher />
            <button
              onClick={handleResetDay}
              className="px-4 py-2 text-sm font-semibold text-slate-300 bg-slate-800 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-500 transition-colors"
            >
              {t('resetDay')}
            </button>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-slate-900/70 p-6 rounded-xl shadow-lg ring-1 ring-slate-800">
            <h2 className="text-xl font-semibold mb-4 text-cyan-400">{t('manageTasks')}</h2>
            <TaskInput onAddTask={handleAddTask} />
            <TaskList
              tasks={tasks}
              onTaskClick={handleTaskClick}
              activeTaskId={activeTaskId}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              onLogTimeToJira={handleLogTimeToJira}
            />
          </div>

          <div className="flex flex-col gap-8">
            <div className="bg-slate-900/70 p-6 rounded-xl shadow-lg ring-1 ring-slate-800">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-xl font-semibold text-cyan-400">{t('productivityAnalysis')}</h2>
                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || allTasksForTodayCount === 0}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-cyan-600 rounded-lg hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 focus:ring-cyan-500 transition-all duration-200"
                >
                  <BrainCircuitIcon className="h-5 w-5"/>
                  {isAnalyzing ? t('analyzingButton') : t('analyzeButton')}
                </button>
              </div>
              {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</p>}
              <Report analysisResult={analysisResult} isLoading={isAnalyzing} totalTasksTodayCount={allTasksForTodayCount} />
            </div>

            <div className="bg-slate-900/70 p-6 rounded-xl shadow-lg ring-1 ring-slate-800">
              <WeeklyHistory
                history={history}
                goal={goal}
                onAnalyzeDay={handleAnalyzePastDay}
                analyzingDate={isAnalyzingHistory ? selectedDate : null}
              />
            </div>
          </div>
        </main>

        <Modal isOpen={isHistoryModalOpen} onClose={() => setIsHistoryModalOpen(false)}>
        <div className="p-1">
          <h2 className="text-xl font-bold text-white mb-4">
            {t('analysisForDate', { date: selectedDate || '' })}
          </h2>
          <Report
            analysisResult={historicalAnalysis}
            isLoading={isAnalyzingHistory}
            totalTasksTodayCount={selectedDate ? (history[selectedDate]?.tasks.length || 0) : 0}
          />
        </div>
      </Modal>

      <ExportImportModal 
        isOpen={isExportImportModalOpen}
        onClose={() => setIsExportImportModalOpen(false)}
        onExport={handleExport}
        onImport={handleImport}
       />
    </>
  );
};

export default HomePage;