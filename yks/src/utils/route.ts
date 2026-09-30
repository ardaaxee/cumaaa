export interface Route {
  path: string;
  segments: string[];
  query: URLSearchParams;
}

/** Shared links may contain literal percent signs or question marks in query values. */
export function parseRoute(hash: string): Route {
  const raw = hash.replace(/^#/, '') || '/';
  const separator = raw.indexOf('?');
  const pathPart = separator < 0 ? raw : raw.slice(0, separator);
  const path = pathPart.startsWith('/') ? pathPart : `/${pathPart}`;
  return {
    path,
    segments: path.split('/').filter(Boolean).map((part) => {
      try { return decodeURIComponent(part); } catch { return part; }
    }),
    query: new URLSearchParams(separator < 0 ? '' : raw.slice(separator + 1)),
  };
}
