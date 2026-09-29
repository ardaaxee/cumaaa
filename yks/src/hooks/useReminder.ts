import { useEffect, useState } from 'react';
import { getReminderTime, msUntil } from '../services/reminder';
import { getState } from '../store/store';
import { dayKey } from '../utils/date';
import { dueReviews } from '../utils/srs';
import { dashboard } from '../utils/stats';

/** Uygulama açıkken, seçilen saatte tarayıcı bildirimi gösterir. */
export function useReminder(): void {
  const [time, setTime] = useState(getReminderTime);
  useEffect(() => {
    const on = () => setTime(getReminderTime());
    window.addEventListener('iyiki:reminder', on);
    return () => window.removeEventListener('iyiki:reminder', on);
  }, []);
  useEffect(() => {
    if (!time || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    let timer = 0;
    const schedule = () => {
      timer = window.setTimeout(() => {
        const s = getState();
        const today = dayKey();
        const cards = Object.values(s.cards).filter((c) => c.dueDay <= today).length;
        const reviews = dueReviews(s.reviews, today).length;
        const pending = s.tasks.filter((t) => t.date === today && !t.done).length;
        const d = dashboard(s, today);
        const left = Math.max(0, s.profile.dailyQuestionGoal - d.todayQuestions);
        const parts = [
          pending ? pending + ' görev' : '',
          reviews ? reviews + ' konu tekrarı' : '',
          cards ? cards + ' kart' : '',
          left ? left + ' soru hedefi' : '',
        ].filter(Boolean);
        const body = parts.length ? 'Bugün ' + parts.slice(0, 3).join(' · ') + ' bekliyor.' : 'Bugünkü hedeflerini tamamladın. Kısa bir tekrar yeter ♡';
        const options: NotificationOptions = { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'yks-calisma' };
        navigator.serviceWorker?.getRegistration?.()
          .then((reg) => (reg ? reg.showNotification('YKS çalışma zamanı ♡', options) : new Notification('YKS çalışma zamanı ♡', options)))
          .catch(() => {
            try { new Notification('YKS çalışma zamanı ♡', options); } catch { /* desteklenmiyor */ }
          });
        schedule();
      }, msUntil(time));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [time]);
}
