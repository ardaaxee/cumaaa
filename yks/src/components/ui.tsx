import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SourceType } from '../domain/types';
import { Icon } from './Icon';

// ---------- Toast ----------

type ToastItem = { id: number; text: string };
let toastListeners: ((items: ToastItem[]) => void)[] = [];
let toasts: ToastItem[] = [];
let toastSeq = 0;

export function toast(text: string, ms = 2600): void {
  const item = { id: ++toastSeq, text };
  toasts = [...toasts, item].slice(-3);
  toastListeners.forEach((l) => l(toasts));
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== item.id);
    toastListeners.forEach((l) => l(toasts));
  }, ms);
}

export function ToastHost() {
  const [items, setItems] = useState<ToastItem[]>(toasts);
  useEffect(() => {
    toastListeners.push(setItems);
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setItems);
    };
  }, []);
  return (
    <div className="toasts" role="status" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} className="toast">
          {t.text}
        </div>
      ))}
    </div>
  );
}

// ---------- Modal ----------

export function Modal({
  title,
  onClose,
  children,
  actions,
  labelledBy = 'modal-title',
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
  actions?: ReactNode;
  labelledBy?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    const focusable = el?.querySelector<HTMLElement>('input, select, textarea, button:not([data-close])');
    (focusable ?? el)?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && el) {
        const nodes = el.querySelectorAll<HTMLElement>('a[href], button:not(:disabled), input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [onClose]);
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={labelledBy} ref={ref} tabIndex={-1}>
        <div className="modal-head">
          <h2 id={labelledBy}>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="Kapat" data-close>
            <Icon name="close" />
          </button>
        </div>
        {children}
        {actions && <div className="modal-actions">{actions}</div>}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Onayla',
  danger,
  onConfirm,
  onCancel,
}: {
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      actions={
        <>
          <button type="button" className="btn" onClick={onCancel}>
            Vazgeç
          </button>
          <button type="button" className={`btn ${danger ? 'danger' : 'primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </>
      }
    >
      <div className="muted">{message}</div>
    </Modal>
  );
}

// ---------- Küçük parçalar ----------

const SOURCE_LABELS: Record<SourceType, string> = {
  'meb-program': 'MEB Programı ile eşleşmiş',
  'ozgun-pratik': 'Özgün YKS Pratiği',
  'osym-resmi': 'Resmî ÖSYM bağlantısı',
  kullanici: 'Kullanıcı kaynağı',
};

const SOURCE_HINTS: Record<SourceType, string> = {
  'meb-program': 'Konu ve kazanımlar MEB ortaöğretim programı mantığıyla eşleştirilmiştir.',
  'ozgun-pratik': 'Bu uygulama için yazılmış özgün pratik sorudur; ÖSYM sorusu değildir.',
  'osym-resmi': 'ÖSYM’nin resmî sayfasına bağlantıdır; içerik kopyalanmaz.',
  kullanici: 'Senin eklediğin kaynak.',
};

export function SourceBadge({ type }: { type: SourceType }) {
  return (
    <span className={`source-badge ${type}`} title={SOURCE_HINTS[type]}>
      {SOURCE_LABELS[type]}
    </span>
  );
}

export function Stat({ label, value, sub }: { label: string; value: ReactNode; sub?: ReactNode }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      {sub != null && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export function ProgressBar({ value, label }: { value: number; label: string }) {
  const v = Math.max(0, Math.min(100, Math.round(value)));
  return (
    <div className="progress" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100} aria-label={label}>
      <span style={{ width: `${v}%` }} />
    </div>
  );
}

export function Empty({ title, children, action }: { title: string; children?: ReactNode; action?: ReactNode }) {
  return (
    <div className="empty">
      <strong>{title}</strong>
      {children && <div className="small">{children}</div>}
      {action && <div className="mt-12">{action}</div>}
    </div>
  );
}

export function Spinner({ label = 'Yükleniyor' }: { label?: string }) {
  return (
    <div role="status">
      <div className="spinner" />
      <span className="sr-only">{label}</span>
    </div>
  );
}

export function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}
