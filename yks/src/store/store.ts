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

export const startupReport = initial.report;
export const startupError = initial.error;
export const startupRecovered = initial.recovered;

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
}

export function replaceState(next: AppState): void {
  state = next;
  flush();
  listeners.forEach((l) => l());
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
