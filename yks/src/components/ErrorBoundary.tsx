import { Component, type ReactNode } from 'react';
import { recoverFromChunkError } from '../utils/chunkRecovery';

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
        <div className="small">Uygulama güncellenmiş olabilir. Yenileyince düzelir.</div>
        <div className="row mt-12" style={{ justifyContent: 'center' }}>
          <button type="button" className="btn primary" onClick={() => window.location.reload()}>
            Yenile
          </button>
          <a className="btn" href="#/">
            Ana sayfa
          </a>
        </div>
      </div>
    );
  }
}
