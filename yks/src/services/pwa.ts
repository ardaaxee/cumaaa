import { useSyncExternalStore } from 'react';
import { persistNow } from '../store/store';

let snapshot = { offlineReady: false, updateReady: false };
const listeners = new Set<() => void>();
let registration: ServiceWorkerRegistration | undefined;
let updating = false;

function publish(patch: Partial<typeof snapshot>) {
  snapshot = { ...snapshot, ...patch };
  listeners.forEach((listener) => listener());
}

export function usePwaStatus() {
  return useSyncExternalStore((listener) => { listeners.add(listener); return () => listeners.delete(listener); }, () => snapshot, () => snapshot);
}

export async function checkForUpdates(): Promise<void> {
  await registration?.update();
  if (registration?.waiting) publish({ updateReady: true });
}

export function applyUpdate(): boolean {
  if (!registration?.waiting || !persistNow()) return false;
  updating = true;
  registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  return true;
}

/** New versions wait until the user chooses to update; first installation never reloads the page. */
export function setupPwa(): void {
  if (!('serviceWorker' in navigator) || window.top !== window.self) return;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    publish({ offlineReady: true, updateReady: !!registration?.waiting });
    if (updating) location.reload();
  });
  const install = async () => {
    try {
      registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });
      publish({ offlineReady: !!registration.active, updateReady: !!registration.waiting });
      registration.addEventListener('updatefound', () => {
        const worker = registration?.installing;
        worker?.addEventListener('statechange', () => {
          if (worker.state === 'installed') publish({ updateReady: !!registration?.waiting });
          if (worker.state === 'activated') publish({ offlineReady: true, updateReady: !!registration?.waiting });
        });
      });
      await checkForUpdates();
    } catch { /* The app continues to work when installation is unavailable. */ }
  };
  if (document.readyState === 'complete') void install();
  else window.addEventListener('load', () => void install(), { once: true });
  window.addEventListener('focus', () => void checkForUpdates().catch(() => undefined));
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkForUpdates().catch(() => undefined);
  });
}
