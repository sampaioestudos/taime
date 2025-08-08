import { useEffect, useRef } from 'react';
import { Task } from '../types';
import { getRealtimeInsight } from '../services/geminiService';
import { useTranslation } from '../i18n';
import { useToast } from '../components/Toast';

const INSIGHT_INTERVAL = 25 * 60; // 25 minutes in seconds

interface UseRealtimeInsightsProps {
  activeTask: Task | null;
  isEnabled: boolean;
}

export const useRealtimeInsights = ({ activeTask, isEnabled }: UseRealtimeInsightsProps) => {
  const { t, language } = useTranslation();
  const addToast = useToast();
  const lastInsightTime = useRef<number>(0);
  const hasRequestedPermission = useRef<boolean>(false);

  useEffect(() => {
    // Reset when task becomes inactive or feature is disabled
    if (!activeTask || !isEnabled) {
      lastInsightTime.current = 0;
      return;
    }

    // Request permission once when the feature is first used
    if (isEnabled && !hasRequestedPermission.current) {
        if ('Notification' in window && Notification.permission !== 'granted') {
            Notification.requestPermission();
        }
        hasRequestedPermission.current = true;
    }

    const { elapsedSeconds, name } = activeTask;
    
    // Check if it's time for a new insight
    if (elapsedSeconds > 0 && elapsedSeconds - lastInsightTime.current >= INSIGHT_INTERVAL) {
      lastInsightTime.current = elapsedSeconds;

      getRealtimeInsight(name, elapsedSeconds, language).then(insight => {
        if (insight) {
          // Show in-app toast
          addToast(insight, 'info');

          // Show system notification if permission is granted
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(t('notificationTitle'), {
              body: insight,
              icon: '/icon-192x192.png',
              badge: '/icon-192x192.png',
            });
          }
        }
      }).catch(err => console.error("Could not fetch real-time insight:", err));
    }

  }, [activeTask?.elapsedSeconds, activeTask, isEnabled, language, t, addToast]);
};