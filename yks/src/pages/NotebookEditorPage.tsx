import { useEffect, useRef, useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import { subjectColorFor } from '../data/subjectColors';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Spinner, toast } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { useIsDark } from '../hooks/useIsDark';
import { getPageImage, setPageImage } from '../services/notebookStore';
import { deleteNotebookPage, renameNotebookPage, touchNotebookPage } from '../store/actions';
import { update, useSelector } from '../store/store';

/**
 * Dijital defter: kareli kağıt hissi veren, kalem/silgi/şekil araçlarıyla
 * çizim yapılabilen bir çalışma kağıdı. Çizim verisi tabanı şeffaftır;
 * kareli zemin CSS ile altına konur, böylece silgi gerçek silme yapar
 * (destination-out) ve dışa aktarımda ayrıca birleştirilir.
 */

type Tool = 'kalem' | 'silgi' | 'cizgi' | 'ok' | 'kutu' | 'daire' | 'eksen' | 'metin';

const PENS = [
  { key: 'siyah', color: '#2a2430', width: 3, alpha: 1 },
  { key: 'mavi', color: '#2f6fed', width: 3, alpha: 1 },
  { key: 'turuncu', color: '#e07a1f', width: 3, alpha: 1 },
  { key: 'kirmizi', color: '#d13d54', width: 3, alpha: 1 },
  { key: 'fosforlu', color: '#ffd93d', width: 16, alpha: 0.4 },
] as const;

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
  const redoRef = useRef<string[]>([]);
  const drawingRef = useRef(false);
  const startRef = useRef({ x: 0, y: 0 });
  const lastRef = useRef({ x: 0, y: 0 });
  const dirtyRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<Tool>('kalem');
  const [pen, setPen] = useState<(typeof PENS)[number]>(PENS[0]);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [title, setTitle] = useState(meta?.title ?? '');

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
    restoreFrom(historyRef.current[historyRef.current.length - 1] ?? null);
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
    await setPageImage(id, c.toDataURL('image/png'));
    update((s) => touchNotebookPage(s, id));
    dirtyRef.current = false;
    if (!silent) toast('Sayfa kaydedildi.');
  };

  useEffect(() => {
    const iv = setInterval(() => {
      if (dirtyRef.current) void save(true);
    }, 8000);
    const onHide = () => dirtyRef.current && void save(true);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      clearInterval(iv);
      document.removeEventListener('visibilitychange', onHide);
      if (dirtyRef.current) void save(true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const applyPenStyle = (c: CanvasRenderingContext2D, width?: number) => {
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = pen.color;
    c.globalAlpha = pen.alpha;
    c.lineWidth = width ?? pen.width;
  };

  const onDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const c = canvasRef.current;
    const oc = overlayRef.current;
    const cx = ctx();
    const ocx = octx();
    if (!c || !oc || !cx || !ocx) return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);

    if (tool === 'metin') {
      const text = window.prompt('Not metni:');
      if (text) {
        const p = point(c, e);
        cx.globalCompositeOperation = 'source-over';
        cx.globalAlpha = 1;
        cx.fillStyle = pen.color;
        cx.font = '28px system-ui, sans-serif';
        cx.fillText(text, p.x, p.y);
        pushHistory();
      }
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
        cx.lineWidth = 26;
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
      applyPenStyle(ocx, 3);
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
      applyPenStyle(cx, 3);
      drawShape(cx, tool, startRef.current, p);
      ocx.clearRect(0, 0, W, H);
    }
    cx.globalAlpha = 1;
    cx.globalCompositeOperation = 'source-over';
    pushHistory();
  };

  const exportPng = async () => {
    const c = canvasRef.current;
    if (!c) return;
    const out = document.createElement('canvas');
    out.width = W;
    out.height = H;
    const octx2 = out.getContext('2d')!;
    octx2.fillStyle = isDark ? '#1b1622' : '#ffffff';
    octx2.fillRect(0, 0, W, H);
    octx2.strokeStyle = isDark ? '#332a40' : '#e4dcef';
    octx2.lineWidth = 1;
    for (let x = 0; x <= W; x += 30) {
      octx2.beginPath();
      octx2.moveTo(x, 0);
      octx2.lineTo(x, H);
      octx2.stroke();
    }
    for (let y = 0; y <= H; y += 30) {
      octx2.beginPath();
      octx2.moveTo(0, y);
      octx2.lineTo(W, y);
      octx2.stroke();
    }
    octx2.drawImage(c, 0, 0);
    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = `${(meta?.title ?? 'defter-sayfasi').replace(/[^\p{L}\p{N} ]/gu, '')}.png`;
    a.click();
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

      <div className="card notebook-toolbar">
        <div className="row nowrap" style={{ overflowX: 'auto' }} role="group" aria-label="Kalemler">
          {PENS.map((p) => (
            <button
              key={p.key}
              type="button"
              className="pen-swatch"
              style={{ background: p.color, opacity: p.alpha < 1 ? 0.85 : 1 }}
              aria-pressed={tool === 'kalem' && pen.key === p.key}
              aria-label={`${p.key} kalem`}
              onClick={() => {
                setTool('kalem');
                setPen(p);
              }}
            />
          ))}
          <button type="button" className={`btn small${tool === 'silgi' ? ' primary' : ''}`} aria-pressed={tool === 'silgi'} onClick={() => setTool('silgi')}>
            Silgi
          </button>
        </div>
        <div className="row nowrap mt-8" style={{ overflowX: 'auto' }} role="group" aria-label="Şekil araçları">
          {(
            [
              ['cizgi', 'Çizgi'],
              ['ok', 'Ok'],
              ['kutu', 'Kutu'],
              ['daire', 'Daire'],
              ['eksen', 'Eksen'],
              ['metin', 'Metin'],
            ] as [Tool, string][]
          ).map(([t, label]) => (
            <button key={t} type="button" className={`btn small${tool === t ? ' primary' : ''}`} aria-pressed={tool === t} onClick={() => setTool(t)}>
              {label}
            </button>
          ))}
        </div>
        <div className="row mt-8">
          <button type="button" className="btn small" onClick={undo} disabled={!canUndo}>
            <Icon name="left" /> Geri al
          </button>
          <button type="button" className="btn small" onClick={redo} disabled={!canRedo}>
            Yinele <Icon name="right" />
          </button>
          <button type="button" className="btn small primary" onClick={() => void save()}>
            Kaydet
          </button>
          <button type="button" className="btn small ghost" onClick={() => void exportPng()}>
            <Icon name="download" /> PNG indir
          </button>
        </div>
      </div>

      <div className="notebook-canvas-wrap section" ref={wrapRef} style={accent ? ({ ['--accent' as string]: accent.fg }) : undefined}>
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
      <p className="tiny muted mt-8">Değişikliklerin birkaç saniyede bir otomatik kaydedilir. Sayfadan ayrılmadan önce “Kaydet”e basman önerilir.</p>

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
    </>
  );
}
