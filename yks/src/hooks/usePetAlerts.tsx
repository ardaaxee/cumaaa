import { useEffect, useState } from 'react';
import { toast } from '../components/ui';
import { getState } from '../store/store';
import { needsMessage, petNeeds } from '../utils/petCare';

const ENABLED_KEY = 'iyikiYks.pandaBildirim';
const LAST_KEY = 'iyikiYks.pandaBildirimSon';
const SESSION_KEY = 'iyikiYks.pandaUyarildi';
const CHECK_MS = 10 * 60_000;
const NOTIFY_GAP_MS = 4 * 3_600_000;

function read(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function write(storage: Storage | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    /* yok say */
  }
}

export function petAlertsEnabled(): boolean {
  return read(globalThis.localStorage, ENABLED_KEY) !== '0';
}

async function showNotification(title: string, body: string): Promise<void> {
  const options: NotificationOptions = { body, icon: 'icon-192.png', badge: 'icon-192.png', tag: 'panda-ihtiyac' };
  // Telefonlarda bildirim yalnız service worker üzerinden gösterilebilir.
  const reg = await navigator.serviceWorker?.getRegistration?.().catch(() => undefined);
  if (reg) return reg.showNotification(title, options);
  new Notification(title, options);
}

/**
 * Panda acıkınca ya da susayınca haber verir:
 * - uygulama her açıldığında (oturumda bir kez) ekranda kısa bir uyarı,
 * - bildirim izni verildiyse, uygulama açıkken ya da arka plandayken en fazla 4 saatte bir tarayıcı bildirimi.
 */
export function usePetAlerts(): void {
  useEffect(() => {
    const check = () => {
      const s = getState();
      if (!s.profile.onboarded) return;
      const msg = needsMessage(s.settings.pet.name, petNeeds(s));
      if (!msg) return;
      if (document.visibilityState === 'visible' && !read(globalThis.sessionStorage, SESSION_KEY)) {
        write(globalThis.sessionStorage, SESSION_KEY, '1');
        toast(msg, 5000);
      }
      if (!petAlertsEnabled() || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
      const last = Number(read(globalThis.localStorage, LAST_KEY) || 0);
      if (Date.now() - last < NOTIFY_GAP_MS) return;
      write(globalThis.localStorage, LAST_KEY, String(Date.now()));
      void showNotification(`${s.settings.pet.name} seni bekliyor 🐼`, msg).catch(() => undefined);
    };
    const first = window.setTimeout(check, 4000);
    const id = window.setInterval(check, CHECK_MS);
    const onVis = () => document.visibilityState === 'visible' && check();
    document.addEventListener('visibilitychange', onVis);
    return () => {
      clearTimeout(first);
      clearInterval(id);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);
}

/** Panda sayfasındaki bildirim ayarı. */
export function PetNotifyToggle() {
  const supported = typeof Notification !== 'undefined';
  const [enabled, setEnabled] = useState(petAlertsEnabled);
  const [perm, setPerm] = useState(supported ? Notification.permission : 'denied');

  const toggle = async (on: boolean) => {
    write(globalThis.localStorage, ENABLED_KEY, on ? '1' : '0');
    setEnabled(on);
    if (on && supported && Notification.permission === 'default') {
      const p = await Notification.requestPermission();
      setPerm(p);
      if (p === 'granted') toast('Tamam! Panda acıkınca haber vereceğim 🐼');
    }
  };

  return (
    <div className="mt-12">
      <label className="row nowrap" style={{ gap: 8 }}>
        <input type="checkbox" checked={enabled} onChange={(e) => void toggle(e.target.checked)} />
        <span className="small">Panda acıkınca ya da susayınca bildirim gönder</span>
      </label>
      {!supported ? (
        <div className="tiny muted mt-8">Bu tarayıcı bildirim desteklemiyor; uyarılar uygulama açılınca ekranda görünür.</div>
      ) : perm === 'denied' ? (
        <div className="tiny muted mt-8">Bildirim izni kapalı. Tarayıcı ayarlarından bu siteye bildirim izni verirsen açılır.</div>
      ) : perm === 'default' && enabled ? (
        <button type="button" className="btn small mt-8" onClick={() => void toggle(true)}>
          Bildirim iznini ver
        </button>
      ) : (
        <div className="tiny muted mt-8">Telefonda en iyi sonuç için siteyi ana ekrana ekle. Bildirim, uygulama açıkken ya da arka planda çalışırken gelir.</div>
      )}
    </div>
  );
}
