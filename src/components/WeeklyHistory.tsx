import React from 'react';
import { History, Goal } from '../types';
import { useTranslation } from '../i18n';
import { getWeekDays } from '../utils/date';
import { formatTime } from '../utils/time';
import { HistoryIcon, BrainCircuitIcon } from './icons';

interface WeeklyHistoryProps {
  history: History;
  goal: Goal | null;
  onAnalyzeDay: (date: string) => void;
  analyzingDate: string | null;
}

const MiniSpinner: React.FC = () => (
    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
);

const WeeklyHistory: React.FC<WeeklyHistoryProps> = ({ history, goal, onAnalyzeDay, analyzingDate }) => {
  const { t } = useTranslation();
  const weekDays = getWeekDays();

  const dailyTotals = weekDays.map(day => history[day.dateISO]?.totalTime || 0);
  const totalTimeInWeek = dailyTotals.reduce((sum, time) => sum + time, 0);

  const goalSeconds = (goal?.weeklyHours || 0) * 3600;
  const goalProgressPercentage = goalSeconds > 0 ? Math.min((totalTimeInWeek / goalSeconds) * 100, 100) : 0;
  
  const maxTimeInDay = Math.max(...dailyTotals, 1); // For individual day bars

  return (
    <div>
       <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
        <HistoryIcon className="h-6 w-6 text-cyan-400" />
        {t('weeklyHistory')}
      </h3>
       {goal && goal.weeklyHours > 0 && (
        <div className="mb-6">
          <div className="flex justify-between items-baseline mb-1">
             <h4 className="text-sm font-semibold text-gray-200">{t('goalProgress')}</h4>
             <span className="text-xs font-mono text-gray-400">{formatTime(totalTimeInWeek)} / {formatTime(goalSeconds)}</span>
          </div>
          <div className="w-full bg-gray-700/80 rounded-full h-2.5">
            <div
              className="bg-green-500 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${goalProgressPercentage}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="divide-y divide-gray-700/50">
        {weekDays.map(({ dateISO, dayKey }, index) => {
          const dailyTotal = dailyTotals[index];
          const percentage = (dailyTotal / maxTimeInDay) * 100;
          const isAnalyzingThisDay = analyzingDate === dateISO;

          return (
            <div key={dateISO} className="py-3">
              <div className="flex items-center justify-between gap-4 mb-2">
                <span className="font-semibold text-gray-300 w-10">{t(dayKey)}</span>
                <div className="flex-grow">
                     <div className="w-full bg-gray-700/80 rounded-full h-2">
                        <div
                        className="bg-cyan-500 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
                <div className="flex items-center gap-2 w-32 justify-end">
                  <span className="font-mono text-gray-400 text-sm">
                    {dailyTotal > 0 ? formatTime(dailyTotal) : t('noTimeTracked')}
                  </span>
                  <div className="w-8 h-8 flex items-center justify-center">
                    {dailyTotal > 0 && (
                       <button
                        onClick={() => onAnalyzeDay(dateISO)}
                        disabled={isAnalyzingThisDay}
                        className="p-1.5 text-cyan-400 hover:bg-cyan-400/20 rounded-full disabled:cursor-wait"
                        aria-label={t('analyzeDay')}
                      >
                        {isAnalyzingThisDay ? <MiniSpinner/> : <BrainCircuitIcon className="h-5 w-5" />}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyHistory;