import { useCallback, useEffect, useState } from 'react';
import { recoverFromChunkError } from '../utils/chunkRecovery';
import { classifyLoadError, type LoadErrorKind } from '../utils/loadErrors';

export interface Loaded<T> {
  data: T | undefined;
  failed: boolean;
  /** Hatanın türü (çevrimdışı, zaman aşımı, eksik paket…); ekranda doğru mesaj için. */
  errorKind: LoadErrorKind | null;
  retry: () => void;
}

/**
 * İçerik yükleyicisi: yükleme bitene kadar data undefined kalır; hata olursa
 * sonsuz "yükleniyor" yerine failed=true döner ve retry ile yeniden denenir.
 * Güncelleme sonrası eksik parça hatasında sayfa bir kez kendini yeniler.
 */
export function useLoad<T>(load: () => Promise<T>, deps: unknown[]): Loaded<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [failed, setFailed] = useState(false);
  const [errorKind, setErrorKind] = useState<LoadErrorKind | null>(null);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let alive = true;
    setFailed(false);
    setErrorKind(null);
    setData(undefined);
    load()
      .then((d) => alive && setData(d))
      .catch(async (e) => {
        const err = await classifyLoadError(e);
        if (!alive) return;
        setErrorKind(err.kind);
        if (recoverFromChunkError(err)) return;
        setFailed(true);
      });
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, round]);

  const retry = useCallback(() => setRound((r) => r + 1), []);
  return { data, failed, errorKind, retry };
}
