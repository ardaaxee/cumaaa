import { describe, expect, it } from 'vitest';
import { TEMPLATE_GROUPS, snapAngle } from '../src/utils/notebookTemplates';

describe('defter araçları', () => {
  it('cetvel 15° açılara kilitler, uzunluğu korur', () => {
    const s = { x: 0, y: 0 };
    const e = snapAngle(s, { x: 100, y: 7 });
    expect(e.y).toBeCloseTo(0, 6);
    expect(e.x).toBeCloseTo(Math.hypot(100, 7), 6);
    const d = snapAngle(s, { x: 50, y: 52 });
    expect(Math.abs(d.x - d.y)).toBeLessThan(1e-6); // 45°
  });
  it('istenen ders şablonları mevcut', () => {
    const keys = TEMPLATE_GROUPS.flatMap((g) => g.items.map((i) => i.key));
    for (const k of ['konum-zaman', 'hiz-zaman', 'ivme-zaman', 'koordinat', 'fonksiyon', 'sayi-dogrusu', 'ucgen', 'aci', 'denklem', 'cizim-alani']) expect(keys).toContain(k);
  });
});
