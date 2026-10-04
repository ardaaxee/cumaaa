import { useMemo, useState } from 'react';
import { MockWeeklySummary } from '../components/MockWeeklySummary';
import { PageHeader } from '../components/Layout';
import { Segmented, Stat, toast } from '../components/ui';
import { useAppState } from '../store/store';
import { addDays, formatDay, formatMinutes, weekDays, type DayKey } from '../utils/date';
import { formatNet } from '../utils/net';
import { thisWeekStart, weekReport, weekVerdict, type WeekReport } from '../utils/weekly';

function delta(cur: number, prev: number): string {
  if (prev === 0 && cur === 0) return '';
  const d = cur - prev;
  return d === 0 ? 'geçen haftayla aynı' : `${d > 0 ? '▲' : '▼'} ${Math.abs(d)} (geçen hafta ${prev})`;
}

/** Karnenin paylaşılabilir görselini çizer (1080×1350). */
function drawCard(r: WeekReport, name: string): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = 1080;
  c.height = 1350;
  const x = c.getContext('2d')!;
  const g = x.createLinearGradient(0, 0, 1080, 1350);
  g.addColorStop(0, '#efe6fb');
  g.addColorStop(1, '#fffdf8');
  x.fillStyle = g;
  x.fillRect(0, 0, 1080, 1350);
  x.fillStyle = '#5b3fa0';
  x.font = '800 64px system-ui, sans-serif';
  x.fillText('Haftalık karne ♡', 80, 150);
  x.fillStyle = '#55492f';
  x.font = '500 38px system-ui, sans-serif';
  x.fillText(`${name} · ${formatDay(r.from, { day: 'numeric', month: 'long' })} – ${formatDay(r.to, { day: 'numeric', month: 'long' })}`, 80, 215);
  const v = weekVerdict(r);
  x.font = '120px system-ui, "Apple Color Emoji", "Noto Color Emoji", sans-serif';
  x.fillText(v.emoji, 80, 380);
  x.fillStyle = '#2c2418';
  x.font = '700 40px system-ui, sans-serif';
  wrap(x, v.text, 260, 330, 740, 50);
  const boxes: [string, string, string][] = [
    ['Çözülen soru', String(r.questions), '#e3effd'],
    ['Doğruluk', r.accuracy != null ? `%${r.accuracy}` : '—', '#e5f5ec'],
    ['Çalışma', formatMinutes(r.minutes), '#fdeedd'],
    ['Aktif gün', `${r.activeDays.length}/7`, '#fde6ec'],
    ['Biten konu', String(r.completedTopics), '#fff3cf'],
    ['Test', String(r.tests), '#efe6fb'],
  ];
  boxes.forEach(([label, value, color], i) => {
    const bx = 80 + (i % 2) * 470;
    const by = 470 + Math.floor(i / 2) * 230;
    x.fillStyle = color;
    roundRect(x, bx, by, 440, 200, 36);
    x.fillStyle = '#7c6f52';
    x.font = '600 32px system-ui, sans-serif';
    x.fillText(label, bx + 36, by + 70);
    x.fillStyle = '#2c2418';
    x.font = '800 72px system-ui, sans-serif';
    x.fillText(value, bx + 36, by + 160);
  });
  x.fillStyle = '#55492f';
  x.font = '500 34px system-ui, sans-serif';
  if (r.bestSubject) x.fillText(`💪 En iyi ders: ${r.bestSubject}`, 80, 1210);
  x.fillStyle = '#a58bd8';
  x.font = '600 28px system-ui, sans-serif';
  x.fillText('İyi ki • YKS Çalışma Odası', 80, 1290);
  return c;
}

function roundRect(x: CanvasRenderingContext2D, px: number, py: number, w: number, h: number, r: number) {
  x.beginPath();
  x.moveTo(px + r, py);
  x.arcTo(px + w, py, px + w, py + h, r);
  x.arcTo(px + w, py + h, px, py + h, r);
  x.arcTo(px, py + h, px, py, r);
  x.arcTo(px, py, px + w, py, r);
  x.closePath();
  x.fill();
}

function wrap(x: CanvasRenderingContext2D, text: string, px: number, py: number, maxW: number, lh: number) {
  let line = '';
  let y = py;
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (x.measureText(test).width > maxW && line) {
      x.fillText(line, px, y);
      line = word;
      y += lh;
    } else line = test;
  }
  x.fillText(line, px, y);
}

export default function ReportPage() {
  const state = useAppState();
  const [which, setWhich] = useState<'bu' | 'gecen'>('bu');
  const start: DayKey = which === 'bu' ? thisWeekStart() : addDays(thisWeekStart(), -7);
  const r = useMemo(() => weekReport(state, start), [state, start]);
  const prev = useMemo(() => weekReport(state, addDays(start, -7)), [state, start]);
  const v = weekVerdict(r);

  const share = async () => {
    const canvas = drawCard(r, state.profile.name || 'Ben');
    const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, 'image/png'));
    if (!blob) return toast('Görsel oluşturulamadı.');
    const file = new File([blob], 'haftalik-karne.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'Haftalık karnem ♡' }).catch(() => undefined);
      return;
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'haftalik-karne.png';
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };

  return (
    <>
      <PageHeader
        title="Haftalık karne"
        sub={`${formatDay(r.from, { day: 'numeric', month: 'long' })} – ${formatDay(r.to, { day: 'numeric', month: 'long' })}`}
        actions={
          <button type="button" className="btn primary" onClick={() => void share()}>
            Paylaş
          </button>
        }
      />
      <Segmented label="Hafta" value={which} onChange={setWhich} options={[{ value: 'bu', label: 'Bu hafta' }, { value: 'gecen', label: 'Geçen hafta' }]} />

      <section className="card hero section" aria-label="Haftanın özeti">
        <div className="row nowrap" style={{ gap: 14 }}>
          <div style={{ fontSize: '2.8rem' }} aria-hidden="true">
            {v.emoji}
          </div>
          <div className="grow">
            <b>{v.text}</b>
            <div className="week-dots mt-8" aria-label={`${r.activeDays.length} aktif gün`}>
              {weekDays(r.from).map((d) => (
                <span key={d} className={`week-dot${r.activeDays.includes(d) ? ' on' : ''}`} title={formatDay(d, { weekday: 'long' })}>
                  {formatDay(d, { weekday: 'narrow' })}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-4 section" aria-label="Haftalık sayılar">
        <Stat tint="sky" label="Çözülen soru" value={r.questions} sub={delta(r.questions, prev.questions)} />
        <Stat tint="mint" label="Doğruluk" value={r.accuracy != null ? `%${r.accuracy}` : '—'} sub={prev.accuracy != null ? `geçen hafta %${prev.accuracy}` : ''} />
        <Stat tint="peach" label="Çalışma süresi" value={formatMinutes(r.minutes)} sub={delta(r.minutes, prev.minutes)} />
        <Stat tint="rose" label="Aktif gün" value={`${r.activeDays.length}/7`} />
        <Stat tint="lilac" label="Biten konu" value={r.completedTopics} />
        <Stat tint="sky" label="Test" value={r.tests} />
        <Stat tint="mint" label="Deneme ort. net" value={r.mockAvgNet != null ? formatNet(r.mockAvgNet) : '—'} />
        <Stat tint="peach" label="En iyi ders" value={r.bestSubject ?? '—'} sub={r.bestSubject ? 'en yüksek doğruluk' : 'en az 5 soru gerekir'} />
      </section>

      <MockWeeklySummary state={state} from={start} />
      {r.weakTopic && (
        <div className="notice section">
          Bu hafta en çok zorlandığın konu: <b>{r.weakTopic}</b>. Gelecek hafta ona 20 dakika ayırmak iyi olur.
        </div>
      )}
    </>
  );
}
