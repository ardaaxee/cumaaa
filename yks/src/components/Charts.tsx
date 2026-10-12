import { useState } from 'react';

/**
 * Tek serili, bağımlılıksız SVG grafikler. Her grafikte üzerine gelince/odaklanınca
 * değer ipucu ve erişilebilir tablo görünümü bulunur.
 */

export interface Point {
  label: string;
  /** İpucu ve tabloda gösterilecek uzun etiket. */
  fullLabel?: string;
  value: number;
}

const W = 600;
const PAD = { top: 16, right: 8, bottom: 26, left: 34 };

function niceMax(max: number): number {
  if (max <= 0) return 1;
  const pow = 10 ** Math.floor(Math.log10(max));
  const n = max / pow;
  const step = n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10;
  return step * pow;
}

function ticks(max: number): number[] {
  return [0, max / 2, max];
}

function fmt(n: number): string {
  return n.toLocaleString('tr-TR', { maximumFractionDigits: 2 });
}

function TableView({ points, unit, caption }: { points: Point[]; unit: string; caption: string }) {
  return (
    <details className="table-view">
      <summary>Tablo olarak göster</summary>
      <div className="table-scroll">
        <table className="data-table">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              <th scope="col">Tarih / ad</th>
              <th scope="col">{unit}</th>
            </tr>
          </thead>
          <tbody>
            {points.map((p, i) => (
              <tr key={i}>
                <td>{p.fullLabel ?? p.label}</td>
                <td>{fmt(p.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}

export function BarChart({ points, unit, title, height = 180 }: { points: Point[]; unit: string; title: string; height?: number }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...points.map((p) => p.value), 0));
  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const slot = innerW / Math.max(1, points.length);
  const barW = Math.max(3, Math.min(28, slot - 4));
  const labelEvery = points.length > 14 ? Math.ceil(points.length / 7) : 1;
  const y = (v: number) => PAD.top + innerH - (v / max) * innerH;
  const activePoint = active != null ? points[active] : null;

  return (
    <figure className="chart-wrap" style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`${title}. Ayrıntı için tablo görünümünü açın.`}>
        {ticks(max).map((t) => (
          <g key={t}>
            <line className="grid-line" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="axis-text" x={PAD.left - 6} y={y(t) + 4} textAnchor="end">
              {fmt(t)}
            </text>
          </g>
        ))}
        {points.map((p, i) => {
          const cx = PAD.left + slot * i + slot / 2;
          const h = (p.value / max) * innerH;
          const top = PAD.top + innerH - h;
          const r = Math.min(4, barW / 2, h);
          return (
            <g key={i}>
              {h > 0 && (
                <path
                  className={`bar${active === i ? ' active' : ''}`}
                  d={`M${cx - barW / 2},${PAD.top + innerH} V${top + r} Q${cx - barW / 2},${top} ${cx - barW / 2 + r},${top} H${cx + barW / 2 - r} Q${cx + barW / 2},${top} ${cx + barW / 2},${top + r} V${PAD.top + innerH} Z`}
                />
              )}
              <rect
                className="bar-hit"
                x={cx - slot / 2}
                y={PAD.top}
                width={slot}
                height={innerH}
                tabIndex={0}
                aria-label={`${p.fullLabel ?? p.label}: ${fmt(p.value)} ${unit}`}
                onMouseEnter={() => setActive(i)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(null)}
              />
              {i % labelEvery === 0 && (
                <text className="axis-text" x={cx} y={height - 8} textAnchor="middle">
                  {p.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      {activePoint && active != null && (
        <div
          className="chart-tip"
          style={{ left: `${((PAD.left + slot * active + slot / 2) / W) * 100}%`, top: `${(y(activePoint.value) / height) * 100}%` }}
        >
          {activePoint.fullLabel ?? activePoint.label}: <b>{fmt(activePoint.value)}</b> {unit}
        </div>
      )}
      <TableView points={points} unit={unit} caption={title} />
    </figure>
  );
}

export function LineChart({
  points,
  unit,
  title,
  height = 180,
  maxValue,
}: {
  points: Point[];
  unit: string;
  title: string;
  height?: number;
  maxValue?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const values = points.map((p) => p.value);
  const max = maxValue ?? niceMax(Math.max(...values, 0));
  const min = Math.min(0, ...values);
  const innerW = W - PAD.left - PAD.right;
  const innerH = height - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (points.length === 1 ? innerW / 2 : (innerW * i) / (points.length - 1));
  const y = (v: number) => PAD.top + innerH - ((v - min) / (max - min || 1)) * innerH;
  const d = points.map((p, i) => `${i ? 'L' : 'M'}${x(i)},${y(p.value)}`).join(' ');
  const last = points.length - 1;
  const activePoint = active != null ? points[active] : null;

  return (
    <figure className="chart-wrap" style={{ margin: 0 }}>
      <svg className="chart" viewBox={`0 0 ${W} ${height}`} role="img" aria-label={`${title}. Ayrıntı için tablo görünümünü açın.`}>
        {[min, (min + max) / 2, max].map((t) => (
          <g key={t}>
            <line className="grid-line" x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} />
            <text className="axis-text" x={PAD.left - 6} y={y(t) + 4} textAnchor="end">
              {fmt(t)}
            </text>
          </g>
        ))}
        <path className="line" d={d} />
        {points.map((p, i) => (
          <g key={i}>
            <circle className="dot" cx={x(i)} cy={y(p.value)} r={active === i ? 6 : 4.5} />
            <circle
              cx={x(i)}
              cy={y(p.value)}
              r={16}
              fill="transparent"
              tabIndex={0}
              aria-label={`${p.fullLabel ?? p.label}: ${fmt(p.value)} ${unit}`}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(i)}
              onBlur={() => setActive(null)}
            />
            {(points.length <= 6 || i === 0 || i === last) && (
              <text className="axis-text" x={x(i)} y={height - 8} textAnchor={i === 0 && points.length > 1 ? 'start' : i === last && points.length > 1 ? 'end' : 'middle'}>
                {p.label}
              </text>
            )}
          </g>
        ))}
        {last >= 0 && (
          <text className="value-text" x={x(last)} y={y(points[last].value) - 10} textAnchor={points.length > 1 ? 'end' : 'middle'}>
            {fmt(points[last].value)}
          </text>
        )}
      </svg>
      {activePoint && active != null && (
        <div className="chart-tip" style={{ left: `${(x(active) / W) * 100}%`, top: `${(y(activePoint.value) / height) * 100}%` }}>
          {activePoint.fullLabel ?? activePoint.label}: <b>{fmt(activePoint.value)}</b> {unit}
        </div>
      )}
      <TableView points={points} unit={unit} caption={title} />
    </figure>
  );
}
