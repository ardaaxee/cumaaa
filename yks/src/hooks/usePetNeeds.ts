import { useEffect, useMemo, useState } from 'react';
import { useAppState } from '../store/store';
import { petNeeds, type PetNeeds } from '../utils/petCare';

const TICK_MS = 60_000;

/** Pandanın anlık yemek/su durumu; zamanla azaldığı için dakikada bir yenilenir. */
export function usePetNeeds(): PetNeeds {
  const state = useAppState();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), TICK_MS);
    return () => clearInterval(id);
  }, []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => petNeeds(state), [state, tick]);
}
