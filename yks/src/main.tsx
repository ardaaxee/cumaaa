import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// Not: Service worker şu an devre dışı — barındırma ortamında (ör. önizleme/artifact)
// eski bir sürümün önbellekte takılı kalıp güncellemeleri gizlemesi riskini önlemek için
// kayıtlı olabilecek eski service worker'lar burada temizlenir. Çevrimdışı destek daha
// sağlam bir önbellek geçersiz kılma stratejisiyle ileride yeniden eklenebilir.
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((regs) => {
    regs.forEach((r) => r.unregister());
  });
  if (typeof caches !== 'undefined') {
    caches.keys().then((keys) => keys.forEach((k) => k.startsWith('iyiki-yks-') && caches.delete(k)));
  }
}
