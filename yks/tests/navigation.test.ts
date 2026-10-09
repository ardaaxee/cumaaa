import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MENU_MAIN, MENU_MORE, MascotNav } from '../src/components/MascotNav';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../src/App';
import { NAV_ALL, sectionOf } from '../src/components/Layout';

describe('navigation integrity', () => {
  it('alt gezinme: tavşan TYT, tilki AYT, kedi denemeler, ayı defter, panda menü', () => {
    const markup = renderToStaticMarkup(createElement(MascotNav));
    expect(markup).toContain('href="#/testler?sinav=TYT"');
    expect(markup).toContain('href="#/testler?sinav=AYT"');
    expect(markup).toContain('href="#/denemeler"');
    expect(markup).toContain('href="#/defterim"');
    expect(markup).toContain('data-testid="dock-panda"');
    // Menü kapalıyken yürüyen panda görünmez.
    expect(markup).not.toContain('walker');
  });

  it('panda menüsünün ilk seviyesi sade; diğerleri "Diğer" altında ve hepsi gerçek route', () => {
    expect(MENU_MAIN.map((m) => m.path)).toEqual(['/', '/dersler', '/calis', '/testler', '/plan', '/tekrar', '/ogretmen']);
    for (const p of ['/yanlislar', '/defterim', '/denemeler', '/kartlar', '/formuller', '/gelisim', '/karne', '/rozetler', '/kaynaklar', '/cikmis', '/kaydedilenler', '/pandam', '/ayarlar']) {
      expect(MENU_MORE.map((m) => m.path)).toContain(p);
    }
    for (const m of [...MENU_MAIN, ...MENU_MORE]) {
      const key = m.path === '/' ? '' : m.path.slice(1);
      expect(key in ROUTES, m.path).toBe(true);
    }
  });
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
    for (const key of ['dersler', 'konu', 'testler', 'test', 'sonuc', 'plan', 'ogretmen', 'pandam', 'canli', 'ayarlar', 'kullanim', 'pekistir']) {
      expect(ROUTES[key], key + ' route eksik').toBeTruthy();
    }
  });
});
