import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { AnalysisResult } from '../types';
import { formatTime } from '../utils/time';
import { LightBulbIcon } from './icons';
import { useTranslation } from '../i18n';

interface ReportProps {
  analysisResult: AnalysisResult | null;
  isLoading: boolean;
  totalTasksTodayCount: number;
}

const COLORS = ['#06b6d4', '#34d399', '#f59e0b', '#8b5cf6', '#ec4899', '#6366f1'];

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-full py-10 min-h-[300px]">
    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-400"></div>
  </div>
);

const EmptyState: React.FC<{ totalTasksTodayCount: number }> = ({ totalTasksTodayCount }) => {
    const { t } = useTranslation();
    return (
        <div className="text-center p-8 border-2 border-dashed border-slate-700 rounded-lg flex flex-col justify-center items-center min-h-[300px]">
            <h3 className="text-lg font-semibold text-slate-100">{t('reportEmptyTitle')}</h3>
            {totalTasksTodayCount > 0 ? (
                <p className="text-slate-400 mt-2 max-w-sm">{t('reportEmptyBodyWithTasks')}</p>
            ) : (
                <p className="text-slate-400 mt-2 max-w-sm">{t('reportEmptyBodyWithoutTasks')}</p>
            )}
        </div>
    );
};


const Report: React.FC<ReportProps> = ({ analysisResult, isLoading, totalTasksTodayCount }) => {
  const { t } = useTranslation();
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!analysisResult) {
    return <EmptyState totalTasksTodayCount={totalTasksTodayCount} />;
  }
  
  const chartData = (analysisResult.categories || [])
    .map(cat => ({
        name: cat.categoryName,
        value: cat.totalTime,
    }))
    .sort((a, b) => a.value - b.value);
  
  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">{t('reportChartTitle')}</h3>
        <div className="h-auto w-full bg-slate-900/70 rounded-lg p-2 sm:p-4">
           <ResponsiveContainer width="100%" height={chartData.length * 40 + 20}>
              <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <XAxis type="number" stroke="#94a3b8" tick={{ fontSize: 12 }} tickFormatter={(value) => formatTime(value).slice(0,5)} axisLine={false} tickLine={false} />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="#cbd5e1" 
                  width={100} 
                  tick={{ fontSize: 12, style: { textTransform: 'capitalize' } }} 
                  axisLine={false} 
                  tickLine={false}
                  interval={0}
                />
                <Tooltip 
                  formatter={(value: number) => [formatTime(value), t('reportChartTooltipLabel')]} 
                  wrapperClassName="!bg-slate-700 !border-slate-600 rounded-lg"
                  cursor={{ fill: 'rgba(14, 165, 233, 0.1)' }}
                  labelStyle={{ color: '#cbd5e1' }}
                  contentStyle={{ background: 'transparent', border: 'none' }}
                />
                <Bar dataKey="value" barSize={20} radius={[0, 4, 4, 0]}>
                  {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
            <LightBulbIcon className="h-6 w-6 text-amber-400"/>
            {t('reportInsightsTitle')}
        </h3>
        <ul className="space-y-2">
          {analysisResult.insights.map((insight, index) => (
            <li key={index} className="bg-slate-800/50 p-3 rounded-md text-slate-300 border-l-4 border-cyan-500">
              {insight}
            </li>
          ))}
        </ul>
      </div>

       <div>
        <h3 className="text-lg font-semibold text-slate-100 mb-4">{t('reportCategoriesTitle')}</h3>
        <div className="space-y-4">
          {analysisResult.categories.map((category, index) => (
            <div key={index} className="bg-slate-800/50 p-4 rounded-lg">
                <div className="flex justify-between items-baseline mb-2">
                    <h4 className="font-semibold text-cyan-400">{category.categoryName}</h4>
                    <span className="text-sm font-mono text-slate-400">{formatTime(category.totalTime)}</span>
                </div>
                <ul className="list-disc list-inside text-slate-300 space-y-1">
                    {category.tasks.map((task, taskIndex) => (
                        <li key={taskIndex}>{task}</li>
                    ))}
                </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Report;