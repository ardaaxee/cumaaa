import { Component, type ReactNode } from 'react';
import { recoverFromChunkError } from '../utils/chunkRecovery';

async function clearAppCache() {
  try {
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map((r) => r.unregister()));
    }
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.filter((k) => k.startsWith('iyiki-yks-')).map((k) => caches.delete(k)));
    }
  } finally {
    const next = new URL(window.location.href);
    next.searchParams.set('recover', Date.now().toString());
    window.location.replace(next.toString());
  }
}

/**
 * Bir sayfa yüklenemezse (ör. güncelleme sonrası eksik dosya) boş ekran yerine
 * açıklama ve "Yenile" düğmesi gösterir; güncelleme kaynaklıysa sayfayı kendisi yeniler.
 */
export class PageErrorBoundary extends Component<{ children: ReactNode; resetKey: string }, { error: unknown }> {
  state: { error: unknown } = { error: null };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown) {
    recoverFromChunkError(error);
    console.error('[sayfa hatası]', error);
  }

  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="card empty" role="alert" style={{ marginTop: 16 }}>
        <div style={{ fontSize: '2.4rem' }} aria-hidden="true">
          🐼
        </div>
        <strong>Bu sayfa şu an açılamadı.</strong>
        <div className="small">
          Uygulama güncellenmiş olabilir. Önce yenilemeyi dene; düzelmezse “Önbelleği düzelt” cihazındaki çalışma verilerini silmeden yalnız uygulama dosyalarını tazeler.
        </div>
        <div className="row mt-12" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn primary" onClick={() => window.location.reload()}>
            Yenile
          </button>
          <button type="button" className="btn" onClick={() => void clearAppCache()}>
            Önbelleği düzelt
          </button>
          <a className="btn ghost" href="#/">
            Ana sayfa
          </a>
        </div>
      </div>
    );
  }
}
