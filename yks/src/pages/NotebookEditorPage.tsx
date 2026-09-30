import { useEffect, useRef, useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import { subjectColorFor } from '../data/subjectColors';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Modal, Spinner, toast } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { useIsDark } from '../hooks/useIsDark';
import { getPageImage, setPageImage } from '../services/notebookStore';
import { deleteNotebookPage, renameNotebookPage, setNotebookPaper, touchNotebookPage } from '../store/actions';
import type { NotebookPaper } from '../store/schema';
import { update, useSelector } from '../store/store';

/**
 * Dijital defter: kareli kağıt hissi veren, kalem/silgi/şekil araçlarıyla
 * çizim yapılabilen bir çalışma kağıdı. Çizim verisi tabanı şeffaftır;
 * kareli zemin CSS ile altına konur, böylece silgi gerçek silme yapar
 * (destination-out) ve dışa aktarımda ayrıca birleştirilir.
 */

type Tool = 'kalem' | 'silgi' | 'cizgi' | 'ok' | 'kutu' | 'daire' | 'eksen' | 'metin' | 'cikartma';

const PENS = [
  { key: 'siyah', label: 'Siyah kalem', color: '#2a2430', alpha: 1 },
  { key: 'mavi', label: 'Mavi kalem', color: '#2f6fed', alpha: 1 },
  { key: 'turuncu', label: 'Turuncu kalem', color: '#e07a1f', alpha: 1 },
  { key: 'kirmizi', label: 'Kırmızı kalem', color: '#d13d54', alpha: 1 },
  { key: 'yesil', label: 'Yeşil kalem', color: '#1f8f5a', alpha: 1 },
  { key: 'fosforlu', label: 'Fosforlu kalem', color: '#ffd93d', alpha: 0.4 },
] as const;

const TOOLS: { key: Tool; label: string; icon: string }[] = [
  { key: 'kalem', label: 'Kalem', icon: 'pen' },
  { key: 'silgi', label: 'Silgi', icon: 'eraser' },
  { key: 'cizgi', label: 'Çizgi', icon: 'line' },
  { key: 'ok', label: 'Ok', icon: 'arrow' },
  { key: 'kutu', label: 'Kutu', icon: 'square' },
  { key: 'daire', label: 'Daire', icon: 'circle' },
  { key: 'eksen', label: 'Eksen (x-y)', icon: 'axis' },
  { key: 'metin', label: 'Metin', icon: 'text' },
  { key: 'cikartma', label: 'Çıkartma', icon: 'sparkle' },
];

const STICKERS = ['⭐', '✅', '❌', '❤️', '⚠️', '❓', '💡', '📌', '🐰', '🐱', '🐼', '🦊', '🐻', '🌸', '🎯', '🔥'];

type Template = 'sayi-dogrusu' | 'koordinat' | 'tablo' | 'formul-kutusu' | 'cetvel';

const TEMPLATES: { key: Template; label: string }[] = [
  { key: 'sayi-dogrusu', label: 'Sayı doğrusu' },
  { key: 'koordinat', label: 'Koordinat düzlemi' },
  { key: 'tablo', label: 'Tablo (3×4)' },
  { key: 'formul-kutusu', label: 'Formül kutusu' },
  { key: 'cetvel', label: 'Başlık + çizgi' },
];

/** Şablonu sayfanın görünen üst bölgesine (y0) çizer. */
function drawTemplate(ctx: CanvasRenderingContext2D, t: Template, y0: number, color: string) {
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

const PAPERS: { key: NotebookPaper; label: string }[] = [
  { key: 'kareli', label: 'Kareli' },
  { key: 'cizgili', label: 'Çizgili' },
  { key: 'noktali', label: 'Noktalı' },
  { key: 'duz', label: 'Düz' },
];

const DEFAULT_WIDTH = 3;
const HIGHLIGHTER_WIDTH = 16;

const W = 900;
const H = 1200;
const HISTORY_LIMIT = 30;

function point(canvas: HTMLCanvasElement, e: PointerEvent | React.PointerEvent): { x: number; y: number } {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}

function drawArrowHead(ctx: CanvasRenderingContext2D, from: { x: number; y: number }, to: { x: number; y: number }) {
  const angle = Math.atan2(to.y - from.y, to.x - from.x);
  const len = 18;
  ctx.beginPath();
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - len * Math.cos(angle - Math.PI / 7), to.y - len * Math.sin(angle - Math.PI / 7));
  ctx.moveTo(to.x, to.y);
  ctx.lineTo(to.x - len * Math.cos(angle + Math.PI / 7), to.y - len * Math.sin(angle + Math.PI / 7));
  ctx.stroke();
}

function drawShape(ctx: CanvasRenderingContext2D, tool: Tool, start: { x: number; y: number }, end: { x: number; y: number }) {
  ctx.beginPath();
  if (tool === 'cizgi' || tool === 'ok') {
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    if (tool === 'ok') drawArrowHead(ctx, start, end);
  } else if (tool === 'kutu') {
    ctx.strokeRect(Math.min(start.x, end.x), Math.min(start.y, end.y), Math.abs(end.x - start.x), Math.abs(end.y - start.y));
  } else if (tool === 'daire') {
    const rx = Math.abs(end.x - start.x) / 2;
    const ry = Math.abs(end.y - start.y) / 2;
    ctx.ellipse((start.x + end.x) / 2, (start.y + end.y) / 2, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tool === 'eksen') {
    const ox = start.x;
    const oy = start.y;
    const w = end.x - start.x || 220;
    const h = end.y - start.y || -180;
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + w, oy);
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox, oy + h);
    ctx.stroke();
    drawArrowHead(ctx, { x: ox + w - 20 * Math.sign(w || 1), y: oy }, { x: ox + w, y: oy });
    drawArrowHead(ctx, { x: ox, y: oy + h - 20 * Math.sign(h || 1) }, { x: ox, y: oy + h });
  }
}

export default function NotebookEditorPage({ params }: { params: string[] }) {
  const id = params[0] ?? '';
  const meta = useSelector((s) => s.notebookPages.find((p) => p.id === id));
  const isDark = useIsDark();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const historyRef = useRef<string[]>([]);
  /** Sayfa açıldığındaki hâl: ilk çizgi geri alınınca buraya dönülür (kayıtlı çizim silinmez). */
  const baseRef = useRef<string | null>(null);
  const redoRef = useRef<string[]>([]);
  const drawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0 });
  const dirtyRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<Tool>('kalem');
  const [pen, setPen] = useState<(typeof PENS)[number]>(PENS[0]);
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [confirmClear, setConfirmClear] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(meta?.title ?? '');
  const [textAt, setTextAt] = useState<{ x: number; y: number } | null>(null);
  const [textValue, setTextValue] = useState('');
  const [textSize, setTextSize] = useState(28);
  const [showMore, setShowMore] = useState(false);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [stickerSize, setStickerSize] = useState(56);
  const [full, setFull] = useState(false);
  const paper: NotebookPaper = meta?.paper ?? 'kareli';

  const ctx = () => canvasRef.current?.getContext('2d') ?? null;
  const octx = () => overlayRef.current?.getContext('2d') ?? null;

  useEffect(() => {
    let alive = true;
    getPageImage(id).then((data) => {
      if (!alive) return;
      const c = canvasRef.current;
      const cx = ctx();
      if (c && cx) {
        cx.clearRect(0, 0, W, H);
        if (data) {
          const img = new Image();
          img.onload = () => cx.drawImage(img, 0, 0, W, H);
          img.src = data;
        }
      }
      baseRef.current = data ?? null;
      historyRef.current = [];
      redoRef.current = [];
      setCanUndo(false);
      setCanRedo(false);
      setLoading(false);
    });
    return () => {
      alive = false;
    };
  }, [id]);

  const pushHistory = () => {
    const c = canvasRef.current;
    if (!c) return;
    historyRef.current.push(c.toDataURL());
    if (historyRef.current.length > HISTORY_LIMIT) historyRef.current.shift();
    redoRef.current = [];
    dirtyRef.current = true;
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(false);
  };

  const restoreFrom = (data: string | null) => {
    const c = canvasRef.current;
    const cx = ctx();
    if (!c || !cx) return;
    cx.clearRect(0, 0, W, H);
    if (data) {
      const img = new Image();
      img.onload = () => cx.drawImage(img, 0, 0);
      img.src = data;
    }
  };

  const undo = () => {
    const c = canvasRef.current;
    if (!c || !historyRef.current.length) return;
    redoRef.current.push(c.toDataURL());
    historyRef.current.pop();
    restoreFrom(historyRef.current[historyRef.current.length - 1] ?? baseRef.current);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
    dirtyRef.current = true;
  };

  const redo = () => {
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(next);
    restoreFrom(next);
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    dirtyRef.current = true;
  };

  const save = async (silent = false) => {
    const c = canvasRef.current;
    if (!c) return;
    const image = c.toDataURL('image/png');
    try {
      await setPageImage(id, image);
      update((s) => touchNotebookPage(s, id));
      if (canvasRef.current?.toDataURL('image/png') === image) dirtyRef.current = false;
      if (!silent) toast('Sayfa kaydedildi.');
    } catch {
      toast('Çizim kaydedilemedi. Sayfadan ayrılmadan görsel olarak indir ve cihazında yer aç.', 5000);
    }
  };

  useEffect(() => {
    const iv = setInterval(() => {
      if (dirtyRef.current) void save(true);
    }, 8000);
    const onHide = () => { if (document.visibilityState === 'hidden' && dirtyRef.current) void save(true); };
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onHide);
      if (dirtyRef.current) void save(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const applyPenStyle = (c: CanvasRenderingContext2D, overrideWidth?: number) => {
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = pen.color;
    c.globalAlpha = pen.alpha;
    c.lineWidth = overrideWidth ?? width;
  };

  const placeText = () => {
    const cx = ctx();
    const at = textAt;
    setTextAt(null);
    if (!cx || !at || !textValue.trim()) return;
    cx.globalCompositeOperation = 'source-over';
    cx.globalAlpha = 1;
    cx.fillStyle = pen.color;
    cx.font = `600 ${textSize}px system-ui, sans-serif`;
    textValue.split('\n').forEach((line, i) => cx.fillText(line, at.x, at.y + i * textSize * 1.25));
    pushHistory();
  };

  useEffect(() => {
    if (!full) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setFull(false);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener('keydown', onKey);
    };
  }, [full]);

  const insertTemplate = (t: Template) => {
    const cx = ctx();
    const wrap = wrapRef.current;
    if (!cx || !wrap) return;
    // Şablon, sayfanın ekranda görünen üst kısmına yerleştirilir.
    const r = wrap.getBoundingClientRect();
    const visibleTop = Math.max(0, -r.top + 80);
    const y0 = Math.min(H - 480, Math.max(0, (visibleTop / r.height) * H));
    drawTemplate(cx, t, y0, pen.key === 'fosforlu' ? '#2a2430' : pen.color);
    pushHistory();
    setShowMore(false);
    toast('Şablon eklendi.');
  };

  const clearAll = () => {
    const cx = ctx();
    if (!cx) return;
    cx.clearRect(0, 0, W, H);
    pushHistory();
    setConfirmClear(false);
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    const oc = overlayRef.current;
    const cx = ctx();
    const ocx = octx();
    if (!c || !oc || !cx || !ocx) return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);

    if (tool === 'cikartma') {
      const p = point(c, e);
      cx.save();
      cx.globalCompositeOperation = 'source-over';
      cx.globalAlpha = 1;
      cx.font = `${stickerSize}px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif`;
      cx.textAlign = 'center';
      cx.textBaseline = 'middle';
      cx.fillText(sticker, p.x, p.y);
      cx.restore();
      pushHistory();
      return;
    }
    if (tool === 'metin') {
      setTextValue('');
      setTextAt(point(c, e));
      return;
    }

    drawingRef.current = true;
    startRef.current = point(c, e);
    lastRef.current = startRef.current;

    if (tool === 'kalem' || tool === 'silgi') {
      cx.beginPath();
      cx.moveTo(startRef.current.x, startRef.current.y);
      if (tool === 'silgi') {
        cx.globalCompositeOperation = 'destination-out';
        cx.lineCap = 'round';
        cx.lineJoin = 'round';
        cx.lineWidth = Math.max(14, width * 4);
      } else {
        applyPenStyle(cx);
      }
    }
  };

  const onMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    const c = canvasRef.current;
    const oc = overlayRef.current;
    const cx = ctx();
    const ocx = octx();
    if (!c || !oc || !cx || !ocx) return;
    const p = point(c, e);

    if (tool === 'kalem' || tool === 'silgi') {
      cx.lineTo(p.x, p.y);
      cx.stroke();
      lastRef.current = p;
    } else {
      ocx.clearRect(0, 0, W, H);
      applyPenStyle(ocx);
      ocx.globalAlpha = 1;
      drawShape(ocx, tool, startRef.current, p);
    }
  };

  const onUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    const c = canvasRef.current;
    const cx = ctx();
    const ocx = octx();
    if (!c || !cx || !ocx) return;
    if (tool !== 'kalem' && tool !== 'silgi') {
      const p = point(c, e);
      applyPenStyle(cx);
      drawShape(cx, tool, startRef.current, p);
      ocx.clearRect(0, 0, W, H);
    }
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'source-over';
    pushHistory();
  };

  const fileBase = () => (meta?.title ?? 'defter-sayfasi').replace(/[^\p{L}\p{N} ]/gu, '').trim() || 'defter-sayfasi';

  /** Çizimi kareli zeminle birleştirip düz bir PNG'ye dönüştürür (dışa aktarım için). */
  const renderFlattened = (): HTMLCanvasElement | null => {
    const c = canvasRef.current;
    if (!c) return null;
    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const o = out.getContext('2d')!;
    o.fillStyle = isDark ? '#1b1622' : '#ffffff';
    o.fillRect(0, 0, W, H);
    o.strokeStyle = isDark ? '#332a40' : '#e4dcef';
    o.fillStyle = isDark ? '#3a3048' : '#d9cfe8';
    o.lineWidth = 1;
    if (paper === 'kareli') {
      for (let x = 0; x <= W; x += 30) {
        o.beginPath();
        o.moveTo(x, 0);
        o.lineTo(x, H);
        o.stroke();
      }
    }
    if (paper === 'kareli' || paper === 'cizgili') {
      for (let y = 0; y <= H; y += 30) {
        o.beginPath();
        o.moveTo(0, y);
        o.lineTo(W, y);
        o.stroke();
      }
    }
    if (paper === 'noktali') {
      for (let x = 15; x < W; x += 30) for (let y = 15; y < H; y += 30) o.fillRect(x - 1.5, y - 1.5, 3, 3);
    }
    o.drawImage(c, 0, 0);
    return out;
  };

  const exportPng = async () => {
    const out = renderFlattened();
    if (!out) return;
    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = `${fileBase()}.png`;
    a.click();
  };

  /** Tarayıcının "PDF olarak kaydet" yazdırma seçeneğini kullanarak tek sayfalık PDF üretir. */
  const exportPdf = async () => {
    const out = renderFlattened();
    if (!out) return;
    const dataUrl = out.toDataURL('image/png');
    const win = window.open('', '_blank');
    if (!win) return toast('Açılır pencereye izin verilmedi. Tarayıcı ayarlarından izin ver.');
    win.document.write(
      `<!doctype html><html><head><title>${fileBase()}</title><style>@page{size:auto;margin:0}html,body{margin:0}img{width:100%;display:block}</style></head><body><img src="${dataUrl}" onload="window.focus();window.print();"></body></html>`,
    );
    win.document.close();
  };

  const accent = meta?.subjectId ? subjectColorFor(meta.subjectId, isDark) : null;

  return (
    <>
      <PageHeader
        title={meta?.title ?? 'Defter sayfası'}
        sub={meta?.subjectId ? subjectLabel(SUBJECTS.find((s) => s.id === meta.subjectId)!) : 'Genel'}
        back="#/defterim"
        actions={
          <>
            <button type="button" className="icon-btn" aria-label="Sayfayı yeniden adlandır" onClick={() => setRenaming(true)}>
              <Icon name="settings" />
            </button>
            <button type="button" className="icon-btn" aria-label="Sayfayı sil" onClick={() => setConfirmDelete(true)}>
              <Icon name="trash" />
            </button>
          </>
        }
      />

      <div className={`nb-stage${full ? ' full' : ''}`}>
      <div className="card notebook-toolbar">
        <div className="nb-tools" role="group" aria-label="Araçlar">
          {TOOLS.map((t) => (
            <button
              key={t.key}
              type="button"
              className={`nb-tool${tool === t.key ? ' on' : ''}`}
              aria-pressed={tool === t.key}
              aria-label={t.label}
              title={t.label}
              onClick={() => setTool(t.key)}
            >
              <Icon name={t.icon} size={20} />
              <span>{t.key === 'eksen' ? 'Eksen' : t.label}</span>
            </button>
          ))}
        </div>
        <div className="nb-row" role="group" aria-label="Kalem renkleri">
          {PENS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="pen-swatch"
              style={{ background: p.color, opacity: p.alpha < 1 ? 0.85 : 1 }}
              aria-pressed={tool !== 'silgi' && pen.key === p.key}
              aria-label={p.label}
              title={p.label}
              onClick={() => {
                if (tool === 'silgi') setTool('kalem');
                setPen(p);
                setWidth(p.key === 'fosforlu' ? HIGHLIGHTER_WIDTH : DEFAULT_WIDTH);
              }}
            />
          ))}
          <label className="nb-width">
            <span className="sr-only">Kalem kalınlığı</span>
            <input type="range" min={1} max={24} value={width} onChange={(e) => setWidth(Number(e.target.value))} aria-label="Kalem kalınlığı" />
            <span className="nb-dot" style={{ width: Math.min(24, width + 4), height: Math.min(24, width + 4), background: tool === 'silgi' ? 'var(--line-strong)' : pen.color }} />
          </label>
        </div>
        <div className="nb-row">
          <button type="button" className="icon-btn" onClick={undo} disabled={!canUndo} aria-label="Geri al" title="Geri al">
            <Icon name="undo" />
          </button>
          <button type="button" className="icon-btn" onClick={redo} disabled={!canRedo} aria-label="Yinele" title="Yinele">
            <Icon name="redo" />
          </button>
          <button type="button" className="btn small primary" onClick={() => void save()}>
            <Icon name="save" size={18} /> Kaydet
          </button>
          <button type="button" className="btn small" aria-expanded={showMore} onClick={() => setShowMore((v) => !v)}>
            <Icon name="more" /> Daha
          </button>
          <button type="button" className="icon-btn" aria-pressed={full} aria-label={full ? 'Tam ekrandan çık' : 'Tam ekran'} title={full ? 'Tam ekrandan çık' : 'Tam ekran'} onClick={() => setFull((v) => !v)}>
            <Icon name={full ? 'close' : 'expand'} />
          </button>
        </div>
        {tool === 'cikartma' && (
          <div className="nb-row nb-stickers" role="group" aria-label="Çıkartmalar">
            {STICKERS.map((st) => (
              <button key={st} type="button" className={`nb-sticker${sticker === st ? ' on' : ''}`} aria-pressed={sticker === st} onClick={() => setSticker(st)}>
                {st}
              </button>
            ))}
            <label className="nb-width">
              <span className="tiny muted">Boyut</span>
              <input type="range" min={28} max={120} value={stickerSize} onChange={(e) => setStickerSize(Number(e.target.value))} aria-label="Çıkartma boyutu" />
            </label>
          </div>
        )}
        {showMore && (
          <div className="nb-more">
            <div className="nb-row" role="group" aria-label="Kağıt deseni">
              <span className="tiny muted">Kağıt:</span>
              {PAPERS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  className={`chip${paper === p.key ? ' on' : ''}`}
                  aria-pressed={paper === p.key}
                  onClick={() => update((s) => setNotebookPaper(s, id, p.key))}
                >
                  {p.label}
                </button>
              ))}
            </div>
            <div className="nb-row" role="group" aria-label="Şablonlar">
              <span className="tiny muted">Şablon ekle:</span>
              {TEMPLATES.map((t) => (
                <button key={t.key} type="button" className="chip" onClick={() => insertTemplate(t.key)}>
                  {t.label}
                </button>
              ))}
            </div>
            <div className="nb-row">
              <button type="button" className="btn small ghost" onClick={() => void exportPng()}>
                <Icon name="download" /> PNG indir
              </button>
              <button type="button" className="btn small ghost" onClick={() => void exportPdf()}>
                <Icon name="download" /> PDF indir
              </button>
              <button type="button" className="btn small ghost danger" onClick={() => setConfirmClear(true)}>
                <Icon name="trash" /> Sayfayı temizle
              </button>
            </div>
          </div>
        )}
      </div>

      <div className={`notebook-canvas-wrap section paper-${paper}`} ref={wrapRef} style={accent ? ({ ['--accent' as string]: accent.fg }) : undefined}>
        {loading && (
          <div className="center" style={{ padding: 40 }}>
            <Spinner />
          </div>
        )}
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="notebook-canvas"
          style={{ touchAction: 'none' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerLeave={(e) => drawingRef.current && onUp(e)}
        />
        <canvas ref={overlayRef} width={W} height={H} className="notebook-canvas overlay" aria-hidden="true" />
      </div>
      </div>
      <p className="tiny muted mt-8">Değişikliklerin birkaç saniyede bir otomatik kaydedilir. Metin ve çıkartma araçlarında sayfaya dokunduğun yere eklenir; tam ekran için ⤢ düğmesine bas.</p>

      {textAt && (
        <Modal
          title="Sayfaya yazı ekle"
          onClose={() => setTextAt(null)}
          actions={
            <>
              <button type="button" className="btn" onClick={() => setTextAt(null)}>
                Vazgeç
              </button>
              <button type="button" className="btn primary" onClick={placeText} disabled={!textValue.trim()}>
                Ekle
              </button>
            </>
          }
        >
          <textarea className="input" rows={3} value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Örn. F = m · a" style={{ color: pen.color, fontWeight: 600 }} />
          <label className="row nowrap mt-8" style={{ gap: 8 }}>
            <span className="tiny muted">Boyut</span>
            <input type="range" min={16} max={60} value={textSize} onChange={(e) => setTextSize(Number(e.target.value))} style={{ flex: 1 }} aria-label="Yazı boyutu" />
            <span className="tiny muted">{textSize}</span>
          </label>
        </Modal>
      )}

      {renaming && (
        <ConfirmDialog
          title="Sayfayı yeniden adlandır"
          confirmLabel="Kaydet"
          message={
            <input className="input" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sayfa başlığı" />
          }
          onCancel={() => setRenaming(false)}
          onConfirm={() => {
            update((s) => renameNotebookPage(s, id, title));
            setRenaming(false);
          }}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          title="Sayfa silinsin mi?"
          message="Bu defter sayfası kalıcı olarak silinir."
          confirmLabel="Sil"
          danger
          onCancel={() => setConfirmDelete(false)}
          onConfirm={() => {
            update((s) => deleteNotebookPage(s, id));
            navigate('/defterim', { replace: true });
          }}
        />
      )}
      {confirmClear && (
        <ConfirmDialog
          title="Sayfa temizlensin mi?"
          message="Bu sayfadaki tüm çizim silinir. İstersen sonra “Geri al” ile eski haline döndürebilirsin."
          confirmLabel="Temizle"
          danger
          onCancel={() => setConfirmClear(false)}
          onConfirm={clearAll}
        />
      )}
    </>
  );
}
