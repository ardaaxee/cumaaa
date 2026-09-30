import { useState } from 'react';
import packageInfo from '../../package.json';
import { applyUpdate, checkForUpdates, usePwaStatus } from '../services/pwa';
import { useRoute } from '../hooks/useRoute';
import { useSelector } from '../store/store';
import { toast } from './ui';

export function AppInfo() {
  const { offlineReady, updateReady } = usePwaStatus();
  const [checking, setChecking] = useState(false);
  return (
    <section className="card app-info-card" aria-labelledby="app-info-title">
      <div><div className="eyebrow">İyi ki • YKS · {packageInfo.version}</div><h2 id="app-info-title">Çalışma odan her yerde seninle</h2></div>
      <p className="small muted">{offlineReady ? 'Dersler ve soru bankası çevrimdışı kullanıma hazır.' : 'Çevrimdışı kullanım için uygulamayı bir kez internet bağlantısıyla açık tut.'}</p>
      {updateReady && <p className="small">Yeni sürüm hazır. Aşağıdaki güncelleme bildirimiyle geçebilirsin.</p>}
      <div className="row"><button type="button" className="btn small" disabled={checking} onClick={async () => {
        setChecking(true);
        try { await checkForUpdates(); toast('Güncelleme kontrolü tamamlandı.'); }
        catch { toast('Güncelleme kontrol edilemedi. İnternet bağlantını kontrol et.'); }
        finally { setChecking(false); }
      }}>{checking ? 'Kontrol ediliyor…' : 'Güncellemeleri kontrol et'}</button></div>
      <details className="mt-12"><summary>Telefonuma nasıl yüklerim?</summary><p className="small muted mt-8">Android’de Chrome menüsünden “Uygulamayı yükle” veya “Ana ekrana ekle”yi seç. iPhone’da Safari’nin Paylaş menüsünden “Ana Ekrana Ekle”ye dokun.</p></details>
    </section>
  );
}

export function AppUpdateNotice() {
  const { updateReady } = usePwaStatus();
  const route = useRoute();
  const activeWork = useSelector((state) => !!state.activeTest || state.pomodoro.running);
  const blocked = activeWork || route.path.startsWith('/defterim/');
  if (!updateReady) return null;
  return (
    <aside className="app-update-notice" role="status" aria-label="Yeni sürüm">
      <div><b>Yeni sürüm hazır ♡</b><p className="small">{blocked ? 'Çalışmanı tamamladıktan sonra güncelleyebilirsin.' : 'Kayıtların korunarak son sürüme geçebilirsin.'}</p></div>
      <button type="button" className="btn primary small" disabled={blocked} onClick={() => { if (!applyUpdate()) toast('Güncellemeden önce kayıtlar saklanamadı. Depolama alanını kontrol et.'); }}>Güncelle</button>
    </aside>
  );
}
