import { useMemo } from 'react';
import type { AppState } from '../store/schema';
import { addDays, dayKey, formatDay, parseDay, startOfWeek } from '../utils/date';
import { dailySeries } from '../utils/stats';

const WEEKS = 16;
const LEVELS = [1, 15, 40, 80];
const DAY_LABELS = ['Pzt', '', 'Çar', '', 'Cum', '', 'Paz'];

/** Son 16 haftanın çalışma yoğunluğu (soru + çalışma dakikası/5), gerçek kayıtlardan. */
export function StudyCalendar({ state }: { state: AppState }) {
  const today = dayKey();
  const { weeks, activeDays, max } = useMemo(() => {
    const first = addDays(startOfWeek(today), -7 * (WEEKS - 1));
    const span = Math.round((parseDay(today).getTime() - parseDay(first).getTime()) / 86_400_000) + 1;
    const series = dailySeries(state, span, today);
    const byDay = new Map(series.map((p) => [p.day, p]));
    const cols = Array.from({ length: WEEKS }, (_, w) =>
      Array.from({ length: 7 }, (_, d) => {
        const day = addDays(first, w * 7 + d);
        const p = byDay.get(day);
        const score = p ? p.questions + Math.round(p.minutes / 5) : 0;
        return { day, future: day > today, score, q: p?.questions ?? 0, m: p?.minutes ?? 0 };
      }),
    );
    const all = cols.flat();
    return { weeks: cols, activeDays: all.filter((c) => c.score > 0).length, max: Math.max(0, ...all.map((c) => c.score)) };
  }, [state, today]);

  const level = (score: number) => (score <= 0 ? 0 : LEVELS.filter((t) => score >= t).length);

  return (
    <div>
      <div className="cal" role="img" aria-label={`Son ${WEEKS} haftada ${activeDays} aktif gün`}>
        <div className="cal-days" aria-hidden="true">
          {DAY_LABELS.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
        {weeks.map((col, i) => (
          <div key={i} className="cal-col">
            {col.map((c) => (
              <span
                key={c.day}
                className={`cal-cell l${c.future ? 'x' : level(c.score)}${c.day === today ? ' today' : ''}`}
                title={c.future ? '' : `${formatDay(c.day, { day: 'numeric', month: 'long' })}: ${c.q} soru, ${c.m} dk`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="row between mt-8">
        <span className="tiny muted">
          {activeDays} aktif gün{max > 0 ? '' : ' · soru çözdükçe kareler renklenir'}
        </span>
        <span className="cal-legend tiny muted" aria-hidden="true">
          Az <i className="cal-cell l0" /> <i className="cal-cell l1" /> <i className="cal-cell l2" /> <i className="cal-cell l3" /> <i className="cal-cell l4" /> Çok
        </span>
      </div>
    </div>
  );
}
