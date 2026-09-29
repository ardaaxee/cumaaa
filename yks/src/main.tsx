import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import { installChunkRecovery } from './utils/chunkRecovery';

installChunkRecovery();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Çevrimdışı destek: yalnız üretim derlemesinde ve üst düzey pencerede (gömülü önizlemelerde değil).
// HTML her zaman önce ağdan alındığı için yeni sürümler gecikmeden görünür.
if ('serviceWorker' in navigator) {
  const embedded = window.top !== window.self;
  if (import.meta.env.PROD && !embedded) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => undefined);
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((regs) => regs.forEach((r) => r.unregister()));
    if (typeof caches !== 'undefined') {
      caches.keys().then((keys) => keys.forEach((k) => k.startsWith('iyiki-yks-') && caches.delete(k)));
    }
  }
}
