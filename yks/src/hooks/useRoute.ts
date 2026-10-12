import { useSyncExternalStore } from 'react';

/**
 * Hash tabanlı yönlendirme: statik barındırmada ve çevrimdışı çalışır.
 * Örnek: #/konu/aytmat-turev?sekme=test
 */

export interface Route {
  path: string;
  segments: string[];
  query: URLSearchParams;
}

function parse(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/';
  const [pathPart, queryPart = ''] = raw.split('?');
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  return {
    path,
    segments: path.split('/').filter(Boolean).map(decodeURIComponent),
    query: new URLSearchParams(queryPart),
  };
}

let current = parse(typeof location !== 'undefined' ? location.hash : '');

function subscribe(cb: () => void) {
  const handler = () => {
    current = parse(location.hash);
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
