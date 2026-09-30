import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/global.css';
import './styles/release.css';
import { installChunkRecovery } from './utils/chunkRecovery';
import { setupPwa } from './services/pwa';

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

// Preview pages never unregister other applications on the same origin.
if (import.meta.env.PROD) setupPwa();
