import { describe, expect, it } from 'vitest';
import { buildPdf } from '../src/utils/pdf';

const fakeJpeg = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3, 4, 0xff, 0xd9]);

describe('PDF üretimi', () => {
  it('geçerli başlık, sayfa sayısı, xref ve trailer üretir', () => {
    const bytes = buildPdf([{ jpeg: fakeJpeg, width: 900, height: 1273 }, { jpeg: fakeJpeg, width: 900, height: 400 }], 'Fizik notları');
    const text = new TextDecoder('latin1').decode(bytes);
    expect(text.startsWith('%PDF-1.4')).toBe(true);
    expect(text).toContain('/Type /Pages /Count 2');
    expect(text).toContain('/Filter /DCTDecode');
    expect(text.trimEnd().endsWith('%%EOF')).toBe(true);
    // startxref gerçekten xref tablosunu göstermeli
    const startxref = Number(text.match(/startxref\n(\d+)/)![1]);
    expect(text.slice(startxref, startxref + 4)).toBe('xref');
    // her nesne ofseti doğru nesneyi göstermeli
    const offsets = [...text.matchAll(/^(\d{10}) 00000 n $/gm)].map((m) => Number(m[1]));
    offsets.forEach((off, i) => expect(text.slice(off, off + `${i + 1} 0 obj`.length)).toBe(`${i + 1} 0 obj`));
  });
});
