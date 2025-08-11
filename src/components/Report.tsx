

import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { AnalysisResult } from '../types';
import { formatTime } from '../utils/time';
import { LightBulbIcon, BrainCircuitIcon } from './icons';
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
        <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg flex flex-col justify-center items-center min-h-[300px]">
            <h3 className="text-lg font-semibold text-white">{t('reportEmptyTitle')}</h3>
            {totalTasksTodayCount > 0 ? (
                <p className="text-gray-400 mt-2 max-w-sm">{t('reportEmptyBodyWithTasks')}</p>
            ) : (
                <p className="text-gray-400 mt-2 max-w-sm">{t('reportEmptyBodyWithoutTasks')}</p>
            )}
        </div>
    );
};

const NoDataState: React.FC = () => {
    const { t } = useTranslation();
    return (
        <div className="text-center p-8 border-2 border-dashed border-gray-700 rounded-lg flex flex-col justify-center items-center min-h-[300px]">
            <BrainCircuitIcon className="h-10 w-10 text-cyan-500 mb-4"/>
            <h3 className="text-lg font-semibold text-white">{t('reportNoDataGeneratedTitle')}</h3>
            <p className="text-gray-400 mt-2 max-w-sm">{t('reportNoDataGeneratedBody')}</p>
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

  if (analysisResult.categories.length === 0 && analysisResult.insights.length === 0) {
      return <NoDataState />;
  }
  
  const chartData = analysisResult.categories.map(cat => ({
    name: cat.categoryName,
    value: cat.totalTime,
  }));

  const totalTime = chartData.reduce((sum, entry) => sum + entry.value, 0);
  
  return (
    <div className="space-y-8 animate-fade-in">
      {analysisResult.categories.length > 0 && (
        <div>
            <h3 className="text-lg font-semibold text-white mb-2">{t('reportChartTitle')}</h3>
            <div className="h-80 w-full bg-gray-800 rounded-lg p-2 sm:p-4 flex flex-col">
            <ResponsiveContainer width="100%" height="70%">
                <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={45}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                >
                    {chartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip formatter={(value: number) => [formatTime(value), t('reportChartTooltipLabel')]} wrapperClassName="!bg-gray-700 !border-gray-600 rounded-md" />
                </PieChart>
            </ResponsiveContainer>
            <div className="flex-grow flex flex-wrap justify-center items-center content-center gap-x-4 gap-y-2 mt-2 px-2">
                {chartData.map((entry, index) => (
                <div key={`legend-${index}`} className="flex items-center text-xs text-gray-300">
                    <span className="w-3 h-3 rounded-sm mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                    {entry.name} ({totalTime > 0 ? ((entry.value / totalTime) * 100).toFixed(0) : 0}%)
                </div>
                ))}
            </div>
            </div>
        </div>
      )}
      
      {analysisResult.insights.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <LightBulbIcon className="h-6 w-6 text-yellow-400"/>
                {t('reportInsightsTitle')}
            </h3>
            <ul className="space-y-2">
            {analysisResult.insights.map((insight, index) => (
                <li key={index} className="bg-gray-800 p-3 rounded-md text-gray-300 border-l-4 border-cyan-500">
                {insight}
                </li>
            ))}
            </ul>
        </div>
      )}

       {analysisResult.categories.length > 0 && (
        <div>
            <h3 className="text-lg font-semibold text-white mb-4">{t('reportCategoriesTitle')}</h3>
            <div className="space-y-4">
            {analysisResult.categories.map((category, index) => (
                <div key={index} className="bg-gray-800 p-4 rounded-lg">
                    <div className="flex justify-between items-baseline mb-2">
                        <h4 className="font-semibold text-cyan-400">{category.categoryName}</h4>
                        <span className="text-sm font-mono text-gray-400">{formatTime(category.totalTime)}</span>
                    </div>
                    <ul className="list-disc list-inside text-gray-300">
                        {category.tasks.map((task, taskIndex) => (
                            <li key={taskIndex}>{task}</li>
                        ))}
                    </ul>
                </div>
            ))}
            </div>
        </div>
       )}
    </div>
  );
};

export default Report;
