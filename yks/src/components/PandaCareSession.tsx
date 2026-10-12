import { useEffect, useState } from 'react';
export interface CareSession { kind: 'bambu' | 'su' | 'bath' | 'sleep'; startedAt: number; durationMs: number; committed: boolean }
export function PandaCareSession({ session, onCancel }: { session: CareSession; onCancel: () => void }) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => { setNow(Date.now()); const id = window.setInterval(() => setNow(Date.now()), 200); return () => window.clearInterval(id); }, [session.startedAt]);
  const progress = Math.min(100, Math.max(0, (now - session.startedAt) / session.durationMs * 100));
  const title = { bambu: 'Yemek zamanı', su: 'Su zamanı', bath: 'Banyo zamanı', sleep: 'Dinlenme zamanı' }[session.kind];
  const resource = session.kind === 'bambu' ? 'bambu' : 'damla';
  const text = session.kind === 'bambu' || session.kind === 'su' ? session.committed ? `1 ${resource} kullanıldı` : `Hazırlanıyor · 1 ${resource} kullanılacak` : 'Tamamlanınca ihtiyaç yenilenir';
  return <section className="panda-care-session" aria-label="Devam eden bakım"><div><b>{title}</b><small role="status">{text}</small><progress aria-label="Bakım ilerlemesi" value={progress} max={100} /></div><button type="button" onClick={onCancel}>Durdur</button></section>;
}
