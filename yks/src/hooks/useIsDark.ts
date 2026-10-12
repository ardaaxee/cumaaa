import { useSelector } from '../store/store';

/** Etkin tema koyu mu? ("system" seçiliyken işletim sistemi tercihine bakar.) */
export function useIsDark(): boolean {
  const theme = useSelector((s) => s.settings.theme);
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}
