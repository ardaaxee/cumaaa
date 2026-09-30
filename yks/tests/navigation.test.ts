import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MascotNav } from '../src/components/MascotNav';
import { describe, expect, it } from 'vitest';
import { ROUTES } from '../src/App';
import { NAV_ALL, sectionOf } from '../src/components/Layout';

describe('navigation integrity', () => {
  it('mobil menü temel çalışma araçlarına doğrudan bağlantı verir', () => {
    const markup = renderToStaticMarkup(createElement(MascotNav));
    for (const path of ['/', '/dersler', '/testler', '/yanlislar', '/daha']) expect(markup).toContain('href="#' + path + '"');
    expect(markup).not.toContain('role="dialog"');
    expect(markup).not.toContain('walker');
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
