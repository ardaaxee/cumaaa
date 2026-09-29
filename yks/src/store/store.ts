import { useSyncExternalStore } from 'react';
import type { AppState } from './schema';
import { loadState, saveState, STORAGE_KEY } from './storage';

/**
 * Tek kaynaklı uygulama deposu. Güncellemeler saf fonksiyonlarla yapılır;
 * değişiklikler kısa bir gecikmeyle localStorage'a yazılır.
 */

const initial = loadState();
let state: AppState = initial.state;
const listeners = new Set<() => void>();
let saveTimer: ReturnType<typeof setTimeout> | null = null;
let storageFailed = false;
const STORE_SYNC_EVENT = 'iyiki:state-sync';
const storeInstanceId =
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `store-${Math.random().toString(36).slice(2)}`;

function broadcastState(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent(STORE_SYNC_EVENT, {
      detail: { source: storeInstanceId, state },
    }),
  );
}

export const startupReport = initial.report;
export const startupError = initial.error;

function flush() {
  saveTimer = null;
  const ok = saveState(state);
  if (!ok && !storageFailed) {
    storageFailed = true;
    window.dispatchEvent(new CustomEvent('iyiki:storage-error'));
  }
  if (ok) storageFailed = false;
}

function schedulePersist() {
  if (saveTimer) clearTimeout(saveTimer);
  saveTimer = setTimeout(flush, 250);
}

export function getState(): AppState {
  return state;
}

export function update(fn: (s: AppState) => AppState): void {
  const next = fn(state);
  if (next === state) return;
  state = next;
  schedulePersist();
  listeners.forEach((l) => l());
  broadcastState();
}

export function replaceState(next: AppState): void {
  state = next;
  flush();
  listeners.forEach((l) => l());
  broadcastState();
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useAppState(): AppState {
  return useSyncExternalStore(subscribe, getState, getState);
}

export function useSelector<T>(selector: (s: AppState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

if (typeof window !== 'undefined') {
  // Vite'ın lazy chunk grafiğinde store modülü birden fazla chunk tarafından
  // örneklenirse bile aynı sekmedeki tüm örnekler tek state'i paylaşsın.
  // Bu özellikle TestSetup -> TestRunner geçişinde aktif testin kaybolmasını önler.
  window.addEventListener(STORE_SYNC_EVENT, (event) => {
    const detail = (event as CustomEvent<{ source?: string; state?: AppState }>).detail;
    if (!detail?.state || detail.source === storeInstanceId) return;
    state = detail.state;
    listeners.forEach((listener) => listener());
  });

  window.addEventListener('pagehide', () => {
    if (saveTimer) {
      clearTimeout(saveTimer);
      flush();
    }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && saveTimer) {
      clearTimeout(saveTimer);
      flush();
    }
  });
  // Başka sekmede yapılan değişiklikleri al.
  window.addEventListener('storage', (e) => {
    if (e.key !== STORAGE_KEY || !e.newValue) return;
    const loaded = loadState();
    if (!loaded.error) {
      state = loaded.state;
      listeners.forEach((l) => l());
    }
  });
}
