export interface Task {
  id: string;
  name: string;
  description?: string;
  elapsedSeconds: number;
  completionDate?: string; // ISO string
  syncedToCalendar?: boolean;
  jiraIssueKey?: string;
  timeLoggedToJiraSeconds?: number;
}

export interface Category {
  categoryName: string;
  tasks: string[];
  totalTime: number; // in seconds
}

export interface AnalysisResult {
  categories: Category[];
  insights: string[];
}

export interface DailyRecord {
  date: string; // YYYY-MM-DD
  tasks: Task[];
  totalTime: number;
}

export type History = Record<string, DailyRecord>;

export interface Goal {
    weeklyHours: number;
    realtimeInsightsEnabled: boolean;
}

export interface UserProgress {
    points: number;
    level: number;
}

export interface JiraConfig {
    domain: string;
    email: string;
    apiToken: string;
}

declare global {
  interface Window {
    gapi: any;
  }
}