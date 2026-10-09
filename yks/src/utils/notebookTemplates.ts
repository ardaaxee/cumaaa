/**
 * Defter şablonları: sayfanın görünen üst bölgesine (y0) çizilir. Sayfa genişliği 900 birimdir.
 * Ders gruplarına ayrılmıştır (fizik grafikleri, matematik, geometri, kimya, biyoloji).
 */
export type Template =
  | 'sayi-dogrusu'
  | 'koordinat'
  | 'tablo'
  | 'formul-kutusu'
  | 'cetvel'
  | 'konum-zaman'
  | 'hiz-zaman'
  | 'ivme-zaman'
  | 'fonksiyon'
  | 'ucgen'
  | 'aci'
  | 'denklem'
  | 'cizim-alani';

export const TEMPLATE_GROUPS: { group: string; items: { key: Template; label: string }[] }[] = [
  { group: 'Fizik', items: [{ key: 'konum-zaman', label: 'Konum–zaman' }, { key: 'hiz-zaman', label: 'Hız–zaman' }, { key: 'ivme-zaman', label: 'İvme–zaman' }] },
  { group: 'Matematik', items: [{ key: 'koordinat', label: 'Koordinat düzlemi' }, { key: 'fonksiyon', label: 'Fonksiyon grafiği' }, { key: 'sayi-dogrusu', label: 'Sayı doğrusu' }] },
  { group: 'Geometri', items: [{ key: 'ucgen', label: 'Üçgen' }, { key: 'aci', label: 'Açı' }] },
  { group: 'Kimya', items: [{ key: 'denklem', label: 'Denklem alanı' }] },
  { group: 'Biyoloji', items: [{ key: 'cizim-alani', label: 'Çizim alanı' }] },
  { group: 'Genel', items: [{ key: 'tablo', label: 'Tablo (3×4)' }, { key: 'formul-kutusu', label: 'Formül kutusu' }, { key: 'cetvel', label: 'Başlık + çizgi' }] },
];

export function drawArrowHead(ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const len = 18;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - len * Math.cos(angle - Math.PI / 7), to.y - len * Math.sin(angle - Math.PI / 7));
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - len * Math.cos(angle + Math.PI / 7), to.y - len * Math.sin(angle + Math.PI / 7));
  ctx.stroke();
}


/** Fizik grafikleri için eksen: dikey ekseni ve t eksenini çizer, eksen adlarını yazar. */
function drawMotionAxes(ctx: CanvasRenderingContext2D, y0: number, yLabel: string, centered: boolean): { ox: number; oy: number; w: number; h: number } {
  const ox = 140;
  const h = 300;
  const w = 640;
  const top = y0 + 40;
  const oy = centered ? top + h / 2 : top + h;
  ctx.beginPath();
  ctx.moveTo(ox, top + h + (centered ? 0 : 10));
  ctx.lineTo(ox, top - 10);
  ctx.moveTo(ox - 10, oy);
  ctx.lineTo(ox + w, oy);
  ctx.stroke();
  drawArrowHead(ctx, { x: ox, y: top + 10 }, { x: ox, y: top - 10 });
  drawArrowHead(ctx, { x: ox + w - 20, y: oy }, { x: ox + w, y: oy });
  ctx.textAlign = 'center';
  ctx.fillText(yLabel, ox - 40, top + 10);
  ctx.fillText('t', ox + w + 10, oy + 32);
  ctx.fillText('0', ox - 16, oy + 26);
  // zaman aralıkları (kesikli kılavuz çizgileri)
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.setLineDash([8, 8]);
  ctx.lineWidth = 1.5;
  for (let i = 1; i <= 5; i++) {
    const x = ox + (i * w) / 5.5;
    ctx.beginPath();
    ctx.moveTo(x, top);
    ctx.lineTo(x, top + h);
    ctx.stroke();
  }
  ctx.restore();
  ctx.font = '500 16px system-ui, sans-serif';
  for (let i = 1; i <= 5; i++) ctx.fillText(`${i}t`, ox + (i * w) / 5.5, oy + 26);
  return { ox, oy, w, h };
}

/** Şablonu çizer. */
export function drawTemplate(ctx: CanvasRenderingContext2D, t: Template, y0: number, color: string): void {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  if (t === 'konum-zaman') drawMotionAxes(ctx, y0, 'x', true);
  else if (t === 'hiz-zaman') drawMotionAxes(ctx, y0, 'v', true);
  else if (t === 'ivme-zaman') drawMotionAxes(ctx, y0, 'a', true);
  else if (t === 'fonksiyon') {
    const cx = 450;
    const cy = y0 + 240;
    ctx.beginPath();
    ctx.moveTo(cx - 340, cy);
    ctx.lineTo(cx + 340, cy);
    ctx.moveTo(cx, cy + 200);
    ctx.lineTo(cx, cy - 210);
    ctx.stroke();
    drawArrowHead(ctx, { x: cx + 320, y: cy }, { x: cx + 340, y: cy });
    drawArrowHead(ctx, { x: cx, y: cy - 190 }, { x: cx, y: cy - 210 });
    ctx.fillText('x', cx + 330, cy + 30);
    ctx.fillText('y', cx - 22, cy - 196);
    ctx.fillText('y = f(x)', cx + 230, cy - 170);
    // örnek eğri (kesikli, üstüne kendi grafiğini çizebilirsin)
    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.globalAlpha = 0.5;
    ctx.beginPath();
    for (let px = -300; px <= 300; px += 6) {
      const x = px / 100;
      const y = 0.45 * x * x - 1.6;
      const sx = cx + px;
      const sy = cy - y * 60;
      if (px === -300) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
    ctx.restore();
  } else if (t === 'ucgen') {
    const A = { x: 450, y: y0 + 50 };
    const B = { x: 230, y: y0 + 330 };
    const C = { x: 690, y: y0 + 330 };
    ctx.beginPath();
    ctx.moveTo(A.x, A.y);
    ctx.lineTo(B.x, B.y);
    ctx.lineTo(C.x, C.y);
    ctx.closePath();
    ctx.stroke();
    ctx.fillText('A', A.x, A.y - 14);
    ctx.fillText('B', B.x - 22, B.y + 20);
    ctx.fillText('C', C.x + 22, C.y + 20);
    ctx.font = '500 18px system-ui, sans-serif';
    ctx.fillText('a', (B.x + C.x) / 2, B.y + 30);
    ctx.fillText('b', (A.x + C.x) / 2 + 24, (A.y + C.y) / 2);
    ctx.fillText('c', (A.x + B.x) / 2 - 24, (A.y + B.y) / 2);
  } else if (t === 'aci') {
    const O = { x: 260, y: y0 + 300 };
    ctx.beginPath();
    ctx.moveTo(O.x, O.y);
    ctx.lineTo(O.x + 480, O.y);
    ctx.moveTo(O.x, O.y);
    ctx.lineTo(O.x + 360, O.y - 240);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(O.x, O.y, 70, -Math.atan2(240, 360), 0);
    ctx.stroke();
    ctx.fillText('O', O.x - 20, O.y + 22);
    ctx.fillText('α', O.x + 95, O.y - 22);
  } else if (t === 'denklem') {
    const y = y0 + 60;
    ctx.save();
    ctx.setLineDash([10, 8]);
    ctx.strokeRect(90, y, 300, 130);
    ctx.strokeRect(510, y, 300, 130);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(405, y + 65);
    ctx.lineTo(495, y + 65);
    ctx.stroke();
    drawArrowHead(ctx, { x: 475, y: y + 65 }, { x: 495, y: y + 65 });
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.fillText('Girenler (reaktifler)', 240, y - 12);
    ctx.fillText('Ürünler', 660, y - 12);
    ctx.fillText('Denkleştir: atom sayıları eşit mi?', 450, y + 175);
  } else if (t === 'cizim-alani') {
    ctx.save();
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(90, y0 + 40, 520, 380);
    ctx.restore();
    ctx.font = '600 18px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Çizim', 100, y0 + 30);
    ctx.fillText('Etiketler', 640, y0 + 30);
    ctx.lineWidth = 2;
    for (let i = 0; i < 6; i++) {
      const y = y0 + 80 + i * 60;
      ctx.beginPath();
      ctx.moveTo(640, y);
      ctx.lineTo(820, y);
      ctx.stroke();
      ctx.fillText(`${i + 1}.`, 610, y - 6);
    }
  } else {
    drawBasicTemplate(ctx, t, y0, color);
  }
  ctx.restore();
}

function drawBasicTemplate(ctx: CanvasRenderingContext2D, t: Template, y0: number, color: string) {
  ctx.save();
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1;
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.font = '600 22px system-ui, sans-serif';
  ctx.textAlign = 'center';
  if (t === 'sayi-dogrusu') {
    const y = y0 + 90;
    ctx.beginPath();
    ctx.moveTo(90, y);
    ctx.lineTo(810, y);
    ctx.stroke();
    drawArrowHead(ctx, { x: 790, y }, { x: 810, y });
    drawArrowHead(ctx, { x: 110, y }, { x: 90, y });
    for (let i = -5; i <= 5; i++) {
      const x = 450 + i * 60;
      ctx.beginPath();
      ctx.moveTo(x, y - 12);
      ctx.lineTo(x, y + 12);
      ctx.stroke();
      ctx.fillText(String(i), x, y + 42);
    }
  } else if (t === 'koordinat') {
    const cx = 450;
    const cy = y0 + 240;
    const step = 40;
    ctx.save();
    ctx.globalAlpha = 0.25;
    ctx.lineWidth = 1.5;
    for (let i = -8; i <= 8; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + i * step, cy - 200);
      ctx.lineTo(cx + i * step, cy + 200);
      ctx.stroke();
    }
    for (let j = -5; j <= 5; j++) {
      ctx.beginPath();
      ctx.moveTo(cx - 330, cy + j * step);
      ctx.lineTo(cx + 330, cy + j * step);
      ctx.stroke();
    }
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(cx - 340, cy);
    ctx.lineTo(cx + 340, cy);
    ctx.moveTo(cx, cy + 210);
    ctx.lineTo(cx, cy - 210);
    ctx.stroke();
    drawArrowHead(ctx, { x: cx + 320, y: cy }, { x: cx + 340, y: cy });
    drawArrowHead(ctx, { x: cx, y: cy - 190 }, { x: cx, y: cy - 210 });
    ctx.fillText('x', cx + 330, cy + 30);
    ctx.fillText('y', cx - 22, cy - 196);
    ctx.fillText('O', cx - 16, cy + 26);
    ctx.font = '500 16px system-ui, sans-serif';
    for (let i = -7; i <= 7; i++) if (i) ctx.fillText(String(i), cx + i * step, cy + 22);
    for (let j = -4; j <= 4; j++) if (j) ctx.fillText(String(-j), cx - 18, cy + j * step + 6);
  } else if (t === 'tablo') {
    const x = 90;
    const w = 720;
    const rows = 4;
    const cols = 3;
    const rh = 60;
    for (let r = 0; r <= rows; r++) {
      ctx.lineWidth = r === 1 ? 3 : 2;
      ctx.beginPath();
      ctx.moveTo(x, y0 + 40 + r * rh);
      ctx.lineTo(x + w, y0 + 40 + r * rh);
      ctx.stroke();
    }
    for (let c = 0; c <= cols; c++) {
      ctx.beginPath();
      ctx.moveTo(x + (c * w) / cols, y0 + 40);
      ctx.lineTo(x + (c * w) / cols, y0 + 40 + rows * rh);
      ctx.stroke();
    }
  } else if (t === 'formul-kutusu') {
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(120, y0 + 40, 660, 150);
    ctx.setLineDash([]);
    ctx.textAlign = 'left';
    ctx.fillText('★ Formül:', 140, y0 + 76);
  } else {
    ctx.textAlign = 'left';
    ctx.font = '700 30px system-ui, sans-serif';
    ctx.fillText('Başlık:', 90, y0 + 70);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(90, y0 + 86);
    ctx.lineTo(810, y0 + 86);
    ctx.stroke();
  }
  ctx.restore();
}


/** Cetvel: bitiş noktasını 15°'lik açılara kilitler (yatay, dikey, 45° …). */
export function snapAngle(start: { x: number; y: number }, end: { x: number; y: number }, stepDeg = 15): { x: number; y: number } {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const len = Math.hypot(dx, dy);
  const step = (stepDeg * Math.PI) / 180;
  const a = Math.round(Math.atan2(dy, dx) / step) * step;
  return { x: start.x + len * Math.cos(a), y: start.y + len * Math.sin(a) };
}

/** Grafik çizgisi: dokunulan noktalardan yumuşak (Catmull-Rom) eğri. */
export function drawSmoothCurve(ctx: CanvasRenderingContext2D, pts: { x: number; y: number }[]): void {
  if (pts.length < 2) return;
  // Gürültüyü azalt: birbirine çok yakın noktaları ele.
  const p = pts.filter((q, i) => i === 0 || i === pts.length - 1 || Math.hypot(q.x - pts[i - 1].x, q.y - pts[i - 1].y) > 6);
  ctx.beginPath();
  ctx.moveTo(p[0].x, p[0].y);
  for (let i = 0; i < p.length - 1; i++) {
    const p0 = p[i - 1] ?? p[i];
    const p1 = p[i];
    const p2 = p[i + 1];
    const p3 = p[i + 2] ?? p2;
    ctx.bezierCurveTo(p1.x + (p2.x - p0.x) / 6, p1.y + (p2.y - p0.y) / 6, p2.x - (p3.x - p1.x) / 6, p2.y - (p3.y - p1.y) / 6, p2.x, p2.y);
  }
  ctx.stroke();
}

