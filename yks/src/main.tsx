import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { PageErrorBoundary } from './components/ErrorBoundary';
import { App } from './App';
import './styles/global.css';
import { installChunkRecovery } from './utils/chunkRecovery';
import { isStaleBuild } from './utils/loadErrors';

installChunkRecovery();

const standalone =
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;
document.documentElement.classList.toggle('app-standalone', standalone);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PageErrorBoundary resetKey="application-root"><App /></PageErrorBoundary>
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
    navigator.serviceWorker.addEventListener('controllerchange', async () => {
      if (refreshing) return;
      // Sayfa zaten en yeni sürümle açıldıysa (ör. az önce yenilendiyse) ikinci kez yenileme.
      if (!(await isStaleBuild())) return;
      refreshing = true;
      offerUpdate();
    });

    let knownVersion: string | null = null;
    let checkingVersion = false;
    function offerUpdate(version?:string) {
      if (document.getElementById('available-app-update')) return;
      const banner=document.createElement('div');
      banner.id='available-app-update'; banner.className='app-update-notice'; banner.setAttribute('role','status');
      const message=document.createElement('span'); message.textContent='Yeni sürüm hazır. Çalışmanı tamamlayınca güncelleyebilirsin.';
      const button=document.createElement('button'); button.type='button';button.className='btn primary';button.textContent='Güncelle';
      button.onclick=()=>{const next=new URL(window.location.href);next.searchParams.set('v',version ?? Date.now().toString());window.location.replace(next.toString());};
      const later=document.createElement('button');later.type='button';later.className='btn';later.textContent='Daha sonra';later.onclick=()=>banner.remove();
      banner.append(message,button,later);document.body.appendChild(banner);
    }

    const fetchVersion = async () => {
      if (checkingVersion || !navigator.onLine) return;
      checkingVersion=true;
      const controller=new AbortController();
      const timeout=window.setTimeout(()=>controller.abort(),8000);
      try {
        const response = await fetch('./app-version.json?t=' + Date.now(), { cache: 'no-store', signal: controller.signal });
        if (!response.ok) return;
        const data = (await response.json()) as { version?: string };
        if (!data.version) return;
        if (knownVersion && data.version !== knownVersion) {
          const registration = await navigator.serviceWorker.getRegistration();
          await registration?.update();
          offerUpdate(data.version);
          return;
        }
        knownVersion = data.version;
      } catch {
        // Çevrimdışıyken mevcut önbellek kullanılmaya devam eder.
      } finally { window.clearTimeout(timeout);checkingVersion=false; }
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
    navigator.serviceWorker.getRegistrations().then((regs) => regs.filter(r=>r.scope===new URL('./',window.location.href).href).forEach((r) => r.unregister()));
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => keys.forEach((k) => k.startsWith('iyiki-yks-') && caches.delete(k)));
    }
  }
}
