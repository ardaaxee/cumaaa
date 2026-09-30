import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { installChunkRecovery } from './utils/chunkRecovery';

installChunkRecovery();

const standalone =
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
document.documentElement.classList.toggle('app-standalone', standalone);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const splash = document.getElementById('boot-splash');
    splash?.classList.add('hide');
    window.setTimeout(() => splash?.remove(), 360);
  });
});

// Çevrimdışı destek: yalnız üretim derlemesinde ve üst düzey pencerede (gömülü önizlemelerde değil).
// HTML her zaman önce ağdan alındığı için yeni sürümler gecikmeden görünür.
if ('serviceWorker' in navigator) {
  const embedded = window.top !== window.self;
  if (import.meta.env.PROD && !embedded) {
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    let knownVersion: string | null = null;

    const fetchVersion = async () => {
      try {
        const response = await fetch('./app-version.json?t=' + Date.now(), { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as { version?: string };
        if (!data.version) return;
        if (knownVersion && data.version !== knownVersion) {
          const registration = await navigator.serviceWorker.getRegistration();
          await registration?.update();
          const next = new URL(window.location.href);
          next.searchParams.set('v', data.version);
          window.location.replace(next.toString());
          return;
        }
        knownVersion = data.version;
      } catch {
        // Çevrimdışıyken mevcut önbellek kullanılmaya devam eder.
      }
    };

    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('./sw.js', { updateViaCache: 'none' })
        .then(async (registration) => {
          await registration.update();
          await fetchVersion();
        })
        .catch(() => undefined);
    });

    window.addEventListener('focus', () => void fetchVersion());
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') void fetchVersion();
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => keys.forEach((k) => k.startsWith('iyiki-yks-') && caches.delete(k)));
    }
  }
}
