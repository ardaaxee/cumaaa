import { useEffect, useRef, useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import { subjectColorFor } from '../data/subjectColors';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Empty, Modal, Spinner, toast } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { useIsDark } from '../hooks/useIsDark';
import { getPageImage, setPageImage } from '../services/notebookStore';
import { addNotebookPage, deleteNotebookPage, renameNotebookPage, setNotebookPaper, touchNotebookPage } from '../store/actions';
import type { NotebookPaper } from '../store/schema';
import { canvasToPdf } from '../utils/pdf';
import { TEMPLATE_GROUPS, drawArrowHead, drawSmoothCurve, drawTemplate, snapAngle, type Template } from '../utils/notebookTemplates';
import { update, useSelector } from '../store/store';

/**
 * Dijital defter: kareli kağıt hissi veren, kalem/silgi/şekil araçlarıyla
 * çizim yapılabilen bir çalışma kağıdı. Çizim verisi tabanı şeffaftır;
 * kareli zemin CSS ile altına konur, böylece silgi gerçek silme yapar
 * (destination-out) ve dışa aktarımda ayrıca birleştirilir.
 */

type Tool = 'kalem' | 'silgi' | 'cizgi' | 'kesikli' | 'cetvel' | 'egri' | 'ok' | 'kutu' | 'daire' | 'eksen' | 'metin' | 'cikartma';

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
  { key: 'kesikli', label: 'Noktalı çizgi', icon: 'line' },
  { key: 'cetvel', label: 'Cetvel (15° kilitli)', icon: 'line' },
  { key: 'egri', label: 'Grafik çizgisi (yumuşak eğri)', icon: 'axis' },
  { key: 'ok', label: 'Ok', icon: 'arrow' },
  { key: 'kutu', label: 'Kutu', icon: 'square' },
  { key: 'daire', label: 'Daire', icon: 'circle' },
  { key: 'eksen', label: 'Eksen (x-y)', icon: 'axis' },
  { key: 'metin', label: 'Metin', icon: 'text' },
  { key: 'cikartma', label: 'Çıkartma', icon: 'sparkle' },
];

const TOOL_SHORT: Partial<Record<Tool, string>> = { eksen: 'Eksen', kesikli: 'Noktalı', cetvel: 'Cetvel', egri: 'Grafik' };

const STICKERS = ['⭐', '✅', '❌', '❤️', '⚠️', '❓', '💡', '📌', '🐰', '🐱', '🐼', '🦊', '🐻', '🌸', '🎯', '🔥'];

const PAPERS: { key: NotebookPaper; label: string }[] = [
  { key: 'kareli', label: 'Kareli' },
  { key: 'cizgili', label: 'Çizgili' },
  { key: 'noktali', label: 'Noktalı' },
  { key: 'duz', label: 'Düz' },
];

const DEFAULT_WIDTH = 4;
const HIGHLIGHTER_WIDTH = 16;

const W = 900;
const H = 1200;
const HISTORY_LIMIT = 30;

function point(canvas: HTMLCanvasElement, e: PointerEvent | React.PointerEvent): { x: number; y: number } {
  const r = canvas.getBoundingClientRect();
  return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
}

function drawShape(ctx: CanvasRenderingContext2D, tool: Tool, start: { x: number; y: number }, end: { x: number; y: number }) {
  ctx.beginPath();
  if (tool === 'kesikli' || tool === 'cetvel') {
    const to = tool === 'cetvel' ? snapAngle(start, end) : end;
    ctx.save();
    if (tool === 'kesikli') ctx.setLineDash([ctx.lineWidth * 3 + 6, ctx.lineWidth * 2 + 6]);
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.restore();
  } else if (tool === 'cizgi' || tool === 'ok') {
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

export default function NotebookEditorPage({ params, embedded = false, onPageChange }: { params: string[]; embedded?: boolean; onPageChange?: (id: string) => void }) {
  const id = params[0] ?? '';
  const pages = useSelector(s=>s.notebookPages);
  const orderedPages=pages.slice().sort((a,b)=>a.createdAt.localeCompare(b.createdAt)||a.id.localeCompare(b.id));
  const pageNumber=orderedPages.findIndex(p=>p.id===id);
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
  const revisionRef = useRef(0);
  const readyRef = useRef(false);
  const saveQueueRef = useRef<Promise<void>>(Promise.resolve());
  const [saveStatus,setSaveStatus]=useState('Yükleniyor…');

  const [loading, setLoading] = useState(true);
  const [tool, setTool] = useState<Tool>('kalem');
  const [pen, setPen] = useState<{key:string;label:string;color:string;alpha:number}>(PENS[0]);
  const [nib, setNib] = useState('tukenmez');
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  /** Titrek el çizgisini yumuşatır (kalemde). */
  const [smooth, setSmooth] = useState(true);
  const curveRef = useRef<{ x: number; y: number }[]>([]);
  const smoothRef = useRef({ x: 0, y: 0 });
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
  const [compact, setCompact] = useState(true);
  const [turning, setTurning] = useState(false);
  const [sticker, setSticker] = useState(STICKERS[0]);
  const [stickerSize, setStickerSize] = useState(56);
  const [full, setFull] = useState(false);
  const paper: NotebookPaper = meta?.paper ?? 'kareli';

  const ctx = () => canvasRef.current?.getContext('2d') ?? null;
  const octx = () => overlayRef.current?.getContext('2d') ?? null;

  useEffect(() => {
    let alive = true;
    readyRef.current=false;
    setLoading(true);
    getPageImage(id).then(async (data) => {
      if (!alive) return;
      const c = canvasRef.current;
      const cx = ctx();
      if (c && cx) {
        cx.clearRect(0, 0, W, H);
        if (data) {
          const img = new Image();
          await new Promise<void>((resolve,reject)=>{img.onload=()=>{if(alive)cx.drawImage(img,0,0,W,H);resolve();};img.onerror=()=>reject(new Error('Çizim açılamadı'));img.src=data;});
        }
      }
      if(!alive)return;
      readyRef.current=true;
      setSaveStatus('Kaydedildi');
      baseRef.current = data ?? null;
      historyRef.current = [];
      redoRef.current = [];
      setCanUndo(false);
      setCanRedo(false);
      setLoading(false);
    }).catch(()=>{if(alive){setSaveStatus('Sayfa açılamadı; yeniden açmayı dene');setLoading(false);toast('Kayıtlı çizim açılamadı. Verini korumak için çizim kapatıldı.');}});
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
    revisionRef.current++;
    setSaveStatus('Kaydedilmedi');
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(false);
  };

  const restoreFrom = (data: string | null) => {
    const c=canvasRef.current;const cx=ctx();
    if(!c||!cx)return;
    readyRef.current=false;
    cx.clearRect(0,0,W,H);
    if(!data){readyRef.current=true;return;}
    const img=new Image();
    img.onload=()=>{cx.drawImage(img,0,0);readyRef.current=true;};
    img.onerror=()=>{setSaveStatus('Çizim geri yüklenemedi');toast('Çizim geri yüklenemedi. Sayfayı yeniden açmayı dene.');};
    img.src=data;
  };

  const undo = () => {
    const c = canvasRef.current;
    if (!readyRef.current || !c || !historyRef.current.length) return;
    redoRef.current.push(c.toDataURL());
    historyRef.current.pop();
    restoreFrom(historyRef.current[historyRef.current.length - 1] ?? baseRef.current);
    setCanUndo(historyRef.current.length > 0);
    setCanRedo(true);
    dirtyRef.current = true;
    revisionRef.current++;
    setSaveStatus('Kaydedilmedi');
  };

  const redo = () => {
    if(!readyRef.current)return;
    const next = redoRef.current.pop();
    if (!next) return;
    historyRef.current.push(next);
    restoreFrom(next);
    setCanUndo(true);
    setCanRedo(redoRef.current.length > 0);
    dirtyRef.current = true;
    revisionRef.current++;
    setSaveStatus('Kaydedilmedi');
  };

  const save = async (silent = false, target = canvasRef.current) => {
    if (!target || !readyRef.current) return false;
    const revision=revisionRef.current;
    const data=target.toDataURL('image/png');
    setSaveStatus('Kaydediliyor…');
    const operation=saveQueueRef.current.catch(()=>{}).then(()=>setPageImage(id,data));
    saveQueueRef.current=operation;
    try {
      await operation;
      update(s=>touchNotebookPage(s,id));
      if(revision===revisionRef.current){dirtyRef.current=false;setSaveStatus('Kaydedildi');}
      if(!silent)toast('Sayfa kaydedildi.');
      return true;
    } catch {
      dirtyRef.current=true;
      setSaveStatus('Kayıt başarısız · tekrar dene');
      toast('Defter kaydedilemedi. Sayfayı kapatmadan Kaydet düğmesiyle tekrar dene.');
      return false;
    }
  };

  const turnPage = async (targetId?: string) => {
    if (turning || drawingRef.current) return;
    setTurning(true);
    try {
      if (!(await save(true))) return;
      let nextId = targetId;
      if (!nextId && meta) {
        update(state => {
          const result = addNotebookPage(state, `${meta.title.replace(/ · Sayfa \d+$/, '')} · Sayfa ${orderedPages.length+1}`, meta.subjectId);
          nextId = result.id;
          return setNotebookPaper(result.state, result.id, paper);
        });
      }
      if (nextId) {
        if (onPageChange) onPageChange(nextId);
        else navigate(`#/defterim/${nextId}`);
      }
    } finally { setTurning(false); }
  };


  useEffect(() => {
    const activeCanvas=canvasRef.current;
    const iv=setInterval(()=>{if(dirtyRef.current)void save(true,activeCanvas);},2000);
    const onHide=()=>{if(dirtyRef.current)void save(true,activeCanvas);};
    document.addEventListener('visibilitychange',onHide);
    window.addEventListener('pagehide',onHide);
    return ()=>{
      clearInterval(iv);
      document.removeEventListener('visibilitychange',onHide);
      window.removeEventListener('pagehide',onHide);
      if(dirtyRef.current)void save(true,activeCanvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[id]);

  const applyPenStyle = (c: CanvasRenderingContext2D, overrideWidth?: number) => {
    c.lineCap = nib === 'fosfor' || nib === 'kaligrafi' ? 'butt' : 'round';
    c.lineJoin = 'round';
    c.globalCompositeOperation = 'source-over';
    c.strokeStyle = pen.color;
    c.globalAlpha = pen.alpha * (nib === 'kursun' ? .65 : nib === 'fosfor' ? .28 : 1);
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
    if(!readyRef.current)return;
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
    if (!readyRef.current || !c || !oc || !cx || !ocx) return;
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
    smoothRef.current = startRef.current;
    curveRef.current = [startRef.current];

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
    if (tool === 'kalem') applyPenStyle(cx, width * (nib === 'dolma' || nib === 'firca' ? (e.pointerType === 'pen' ? .35 + Math.max(.05,e.pressure) * 1.3 : 1) : 1));

    if (tool === 'kalem' && smooth) {
      // Sabitleyici: kalem ucu parmağı biraz geriden izler, titreme yumuşar; ara noktalar eğriyle birleşir.
      const prev = smoothRef.current;
      const next = { x: prev.x + (p.x - prev.x) * 0.45, y: prev.y + (p.y - prev.y) * 0.45 };
      const mid = { x: (prev.x + next.x) / 2, y: (prev.y + next.y) / 2 };
      cx.quadraticCurveTo(prev.x, prev.y, mid.x, mid.y);
      cx.stroke();
      cx.beginPath();
      cx.moveTo(mid.x, mid.y);
      smoothRef.current = next;
      lastRef.current = p;
    } else if (tool === 'kalem' || tool === 'silgi') {
      cx.lineTo(p.x, p.y);
      cx.stroke();
      cx.beginPath();
      cx.moveTo(p.x,p.y);
      lastRef.current = p;
    } else if (tool === 'egri') {
      curveRef.current.push(p);
      ocx.clearRect(0, 0, W, H);
      applyPenStyle(ocx);
      ocx.globalAlpha = 1;
      drawSmoothCurve(ocx, curveRef.current);
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
    if (tool === 'kalem' && smooth) {
      const p = point(c, e);
      cx.lineTo(p.x, p.y);
      cx.stroke();
    } else if (tool === 'egri') {
      curveRef.current.push(point(c, e));
      applyPenStyle(cx);
      drawSmoothCurve(cx, curveRef.current);
      ocx.clearRect(0, 0, W, H);
    } else if (tool !== 'kalem' && tool !== 'silgi') {
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
    o.fillStyle = '#fffdf5';
    o.fillRect(0, 0, W, H);
    o.strokeStyle = '#ded9cf';
    o.fillStyle = '#cfc8ba';
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
    o.strokeStyle='#d8959588';o.beginPath();o.moveTo(W*.08,0);o.lineTo(W*.08,H);o.stroke();
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

  /** Gerçek PDF: kareli zemin, çizim, yazı ve çıkartmalar ekrandaki gibi; uzun sayfa A4 sayfalara bölünür. */
  const exportPdf = async () => {
    const out = renderFlattened();
    if (!out) return;
    try {
      const blob = canvasToPdf(out, fileBase());
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `${fileBase()}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      toast('PDF indirildi.');
    } catch {
      toast('PDF hazırlanamadı. PNG olarak indirmeyi deneyebilirsin.');
    }
  };

  if(!meta)return <><PageHeader title="Sayfa bulunamadı" back="#/defterim"/><Empty title="Bu defter sayfası bulunamadı." action={<a className="btn" href="#/defterim">Defterime dön</a>}/></>;

  const accent = meta?.subjectId ? subjectColorFor(meta.subjectId, isDark) : null;

  return (
    <>
      <PageHeader
        title={meta?.title ?? 'Defter sayfası'}
        sub={meta?.subjectId ? subjectLabel(SUBJECTS.find((s) => s.id === meta.subjectId)!) : 'Genel'}
        back={embedded ? undefined : '#/defterim'}
        actions={embedded ? undefined :
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

      <nav className="notebook-page-turn" aria-label="Defter sayfaları">
        <button className="btn small" disabled={turning || loading || pageNumber <= 0} onClick={() => void turnPage(orderedPages[pageNumber-1]?.id)}>← Önceki</button>
        <span>Sayfa {pageNumber+1} / {orderedPages.length}</span>
        <button className="btn small" disabled={turning || loading || pageNumber >= orderedPages.length-1} onClick={() => void turnPage(orderedPages[pageNumber+1]?.id)}>Sonraki →</button>
        <button className="btn small primary" disabled={turning || loading} onClick={() => void turnPage()}>＋ Sayfa ekle</button>
      </nav>
      <p role="status" className="notebook-save-status">{saveStatus}</p>
      <div className={`nb-stage${full ? ' full' : ''}`}>
      <div className={`card notebook-toolbar${compact ? ' notebook-toolbar-compact' : ''}`}>
        <button type="button" className="btn small notebook-tools-toggle" aria-expanded={!compact} onClick={() => setCompact(v=>!v)}>{compact ? 'Tüm kalemler ve araçlar' : 'Araçları küçült'}</button>
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
              <span>{TOOL_SHORT[t.key] ?? t.label}</span>
            </button>
          ))}
        </div>
        <div className="nb-row">
          <label>Kalem türü <select aria-label="Kalem türü" value={nib} onChange={e=>{setNib(e.target.value);setTool('kalem');setWidth(({tukenmez:3,kursun:2,dolma:4,jel:4,kece:7,firca:10,kaligrafi:9,fosfor:18} as Record<string,number>)[e.target.value]);}}>
            {Object.entries({tukenmez:'Tükenmez kalem',kursun:'Kurşun kalem',dolma:'Dolma kalem',jel:'Jel kalem',kece:'Keçeli kalem',firca:'Fırça kalem',kaligrafi:'Kaligrafi kalemi',fosfor:'Fosforlu kalem'}).map(([key,label])=><option key={key} value={key}>{label}</option>)}
          </select></label>
          <label>Özel renk <input type="color" aria-label="Özel kalem rengi" value={pen.color} onChange={e=>setPen({key:'ozel',label:'Özel renk',color:e.target.value,alpha:1})}/></label>
          <span className="tiny muted">Parmağınla veya dokunmatik kalemle yaz. Dolma ve fırça kalemi basınca duyarlıdır.</span>
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
          <div className="segmented nb-sizes" role="group" aria-label="Kalem kalınlığı">
            {([
              ['İnce', 2],
              ['Normal', 4],
              ['Başlık', 9],
            ] as const).map(([label, w]) => (
              <button key={label} type="button" aria-pressed={width === w} onClick={() => setWidth(w)}>
                {label}
              </button>
            ))}
          </div>
          <button type="button" className={`chip${smooth ? ' on' : ''}`} aria-pressed={smooth} onClick={() => setSmooth((v) => !v)} title="Titrek çizgiyi yumuşatır">
            Düzgün çizgi
          </button>
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
            {TEMPLATE_GROUPS.map((g) => (
              <div key={g.group} className="nb-row" role="group" aria-label={`${g.group} şablonları`}>
                <span className="tiny muted nb-group">{g.group}:</span>
                {g.items.map((t) => (
                  <button key={t.key} type="button" className="chip" onClick={() => insertTemplate(t.key)}>
                    {t.label}
                  </button>
                ))}
              </div>
            ))}
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
          onPointerCancel={onUp}
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
          <textarea aria-label="Deftere eklenecek yazı" className="input" rows={3} value={textValue} onChange={(e) => setTextValue(e.target.value)} placeholder="Örn. F = m · a" style={{ color: pen.color, fontWeight: 600 }} />
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
