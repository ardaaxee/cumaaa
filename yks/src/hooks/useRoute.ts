import { useSyncExternalStore } from 'react';
import { parseRoute, type Route } from '../utils/route';
export type { Route } from '../utils/route';

/**
 * Hash tabanlı yönlendirme: statik barındırmada ve çevrimdışı çalışır.
 * Örnek: #/konu/aytmat-turev?sekme=test
 */

let current = parseRoute(typeof location !== 'undefined' ? location.hash : '');

function subscribe(cb: () => void) {
  const handler = () => {
    current = parseRoute(location.hash);
    cb();
  };
  window.addEventListener('hashchange', handler);
  return () => window.removeEventListener('hashchange', handler);
}

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

export function navigate(to: string, opts: { replace?: boolean } = {}): void {
  const hash = to.startsWith('#') ? to : `#${to.startsWith('/') ? to : `/${to}`}`;
  if (opts.replace) {
    history.replaceState(null, '', hash);
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else if (location.hash === hash) {
    window.dispatchEvent(new HashChangeEvent('hashchange'));
  } else {
    location.hash = hash;
  }
}

export function href(path: string, query?: Record<string, string | undefined>): string {
  const q = query
    ? new URLSearchParams(Object.entries(query).filter((e): e is [string, string] => !!e[1])).toString()
    : '';
  return `#${path}${q ? `?${q}` : ''}`;
}
