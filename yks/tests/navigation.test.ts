import { describe, expect, it } from 'vitest';
import { ROUTES } from '../src/App';
import { NAV_ALL, sectionOf } from '../src/components/Layout';

describe('navigation integrity', () => {
  it('menüdeki her yol gerçek bir route ile eşleşir', () => {
    const missing = NAV_ALL
      .map((item) => ({ path: item.path, section: sectionOf(item.path) }))
      .filter(({ section }) => {
        const key = section === '/' ? '' : section.replace(/^\//, '');
        return !(key in ROUTES);
      });

    expect(missing).toEqual([]);
  });

  it('kritik kullanıcı akışları route kayıtlarında bulunur', () => {
    for (const key of ['dersler', 'konu', 'testler', 'test', 'sonuc', 'plan', 'ogretmen', 'pandam', 'canli', 'ayarlar']) {
      expect(ROUTES[key], key + ' route eksik').toBeTruthy();
    }
  });
});
