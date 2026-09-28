import { useEffect, useState } from 'react';
import { getReminderTime, msUntil } from '../services/reminder';
import { getState } from '../store/store';
import { dayKey } from '../utils/date';
import { dueReviews } from '../utils/srs';

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
        const body = [cards ? `${cards} kart` : '', reviews ? `${reviews} konu tekrarı` : ''].filter(Boolean).join(' ve ');
        try {
          new Notification('YKS çalışma zamanı ♡', { body: body ? `Bugün ${body} seni bekliyor.` : 'Küçük bir adım at: 10 soru yeter!', icon: 'icon-192.png' });
        } catch {
          /* bazı mobil tarayıcılar yalnız service worker bildirimi destekler */
        }
        schedule();
      }, msUntil(time));
    };
    schedule();
    return () => clearTimeout(timer);
  }, [time]);
}
