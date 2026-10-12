/**
 * Bağımlılıksız, gerçek PDF üretimi: her sayfaya bir JPEG görüntü yerleştirir.
 * Defter sayfası (kareli zemin + çizim + yazı + çıkartma) önce tek bir tuvalde birleştirilir,
 * A4 oranında dilimlenir ve her dilim bir PDF sayfası olur — ekrandaki görünümün aynısı.
 */
export interface PdfImagePage {
  /** JPEG baytları */
  jpeg: Uint8Array;
  /** Görüntünün piksel boyutu */
  width: number;
  height: number;
}

/** A4 (pt) */
export const A4 = { w: 595.28, h: 841.89 };

const enc = new TextEncoder();

/** Görüntüleri sırayla birer A4 sayfaya (kenar boşluğu olmadan, en-boy oranı korunarak) yerleştirir. */
export function buildPdf(pages: PdfImagePage[], title = 'Defter'): Uint8Array {
  const chunks: Uint8Array[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (part: string | Uint8Array) => {
    const bytes = typeof part === 'string' ? enc.encode(part) : part;
    chunks.push(bytes);
    length += bytes.length;
  };
  const obj = (n: number, body: () => void) => {
    offsets[n] = length;
    push(`${n} 0 obj\n`);
    body();
    push('\nendobj\n');
  };

  // Nesne numaraları: 1 katalog, 2 sayfa ağacı, 3 bilgi; her sayfa için (sayfa, içerik, görüntü) üçlüsü.
  const pageObj = (i: number) => 4 + i * 3;
  push('%PDF-1.4\n%âãÏÓ\n');
  obj(1, () => push('<< /Type /Catalog /Pages 2 0 R >>'));
  obj(2, () => push(`<< /Type /Pages /Count ${pages.length} /Kids [${pages.map((_, i) => `${pageObj(i)} 0 R`).join(' ')}] >>`));
  const safeTitle = title.replace(/[()\\]/g, '').replace(/[^\x20-\x7e]/g, '?').slice(0, 80);
  obj(3, () => push(`<< /Title (${safeTitle}) /Producer (Iyi ki YKS) >>`));

  pages.forEach((p, i) => {
    const n = pageObj(i);
    const scale = Math.min(A4.w / p.width, A4.h / p.height);
    const dw = +(p.width * scale).toFixed(2);
    const dh = +(p.height * scale).toFixed(2);
    const content = `q\n${dw} 0 0 ${dh} 0 ${(A4.h - dh).toFixed(2)} cm\n/Im${i} Do\nQ\n`;
    obj(n, () =>
      push(
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4.w} ${A4.h}] /Resources << /XObject << /Im${i} ${n + 2} 0 R >> >> /Contents ${n + 1} 0 R >>`,
      ),
    );
    obj(n + 1, () => {
      push(`<< /Length ${enc.encode(content).length} >>\nstream\n`);
      push(content);
      push('endstream');
    });
    obj(n + 2, () => {
      push(`<< /Type /XObject /Subtype /Image /Width ${p.width} /Height ${p.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${p.jpeg.length} >>\nstream\n`);
      push(p.jpeg);
      push('\nendstream');
    });
  });

  const count = 4 + pages.length * 3;
  const xref = length;
  push(`xref\n0 ${count}\n0000000000 65535 f \n`);
  for (let i = 1; i < count; i++) push(`${String(offsets[i]).padStart(10, '0')} 00000 n \n`);
  push(`trailer\n<< /Size ${count} /Root 1 0 R /Info 3 0 R >>\nstartxref\n${xref}\n%%EOF\n`);

  const out = new Uint8Array(length);
  let at = 0;
  for (const c of chunks) {
    out.set(c, at);
    at += c.length;
  }
  return out;
}

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const b64 = dataUrl.slice(dataUrl.indexOf(',') + 1);
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

/** Tuvali A4 oranında dilimleyip her dilimi bir PDF sayfası yapar. */
export function canvasToPdf(canvas: HTMLCanvasElement, title: string, quality = 0.9): Blob {
  const sliceH = Math.round(canvas.width * (A4.h / A4.w));
  const pages: PdfImagePage[] = [];
  for (let y = 0; y < canvas.height; y += sliceH) {
    const h = Math.min(sliceH, canvas.height - y);
    const part = document.createElement('canvas');
    part.width = canvas.width;
    part.height = h;
    const c = part.getContext('2d')!;
    c.fillStyle = '#ffffff';
    c.fillRect(0, 0, part.width, h);
    c.drawImage(canvas, 0, y, canvas.width, h, 0, 0, canvas.width, h);
    pages.push({ jpeg: dataUrlToBytes(part.toDataURL('image/jpeg', quality)), width: part.width, height: h });
  }
  return new Blob([buildPdf(pages, title) as BlobPart], { type: 'application/pdf' });
}
