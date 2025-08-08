import Papa from 'papaparse';
import { History, DailyRecord } from '../types';

const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement('a');
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
};

export const exportToJson = (history: History) => {
    const jsonString = JSON.stringify(history, null, 2);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(jsonString, `taime-history-${date}.json`, 'application/json');
};

export const exportToCsv = (history: History) => {
    const flattenedData = Object.values(history).flatMap(dailyRecord => 
        dailyRecord.tasks.map(task => ({
            date: dailyRecord.date,
            task_name: task.name,
            task_description: task.description || '',
            elapsed_seconds: task.elapsedSeconds,
            completion_date: task.completionDate || '',
            status: task.syncedToCalendar ? 'Synced' : 'Not Synced'
        }))
    );

    if (flattenedData.length === 0) {
        alert('No history to export.');
        return;
    }

    const csvString = Papa.unparse(flattenedData);
    const date = new Date().toISOString().split('T')[0];
    downloadFile(csvString, `taime-history-${date}.csv`, 'text/csv;charset=utf-8;');
};

export const mergeImportedHistory = (existingHistory: History, importedHistory: any): History => {
    const newHistory = { ...existingHistory };

    for (const date in importedHistory) {
        if (Object.prototype.hasOwnProperty.call(importedHistory, date)) {
            const importedRecord: DailyRecord = importedHistory[date];
            
            // Basic validation
            if (!importedRecord.date || !Array.isArray(importedRecord.tasks)) {
                console.warn(`Skipping invalid record for date: ${date}`);
                continue;
            }

            const existingRecord = newHistory[date] || { date: date, tasks: [], totalTime: 0 };
            const existingTaskIds = new Set(existingRecord.tasks.map(t => t.id));

            const newTasks = importedRecord.tasks.filter(task => !existingTaskIds.has(task.id));
            
            if (newTasks.length > 0) {
                existingRecord.tasks.push(...newTasks);
                existingRecord.totalTime = existingRecord.tasks.reduce((sum, t) => sum + t.elapsedSeconds, 0);
                newHistory[date] = existingRecord;
            }
        }
    }

    return newHistory;
};