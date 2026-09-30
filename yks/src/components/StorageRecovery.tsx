import { useState } from 'react';
import { restoreBackupFile } from '../services/backup';
import { clearAppData, LEGACY_KEY, STORAGE_KEY } from '../store/storage';
import { ConfirmDialog, toast } from './ui';

export function StorageRecovery({ error }: { error: string }) {
  const [busy, setBusy] = useState(false);
  const [reset, setReset] = useState(false);
  const download = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
      if (!raw) throw new Error('İndirilebilecek bir kayıt yok. Tarayıcının depolama iznini kontrol et.');
      const url = URL.createObjectURL(new Blob([raw], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url; link.download = 'iyi-ki-yks-kurtarma.json'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { toast(e instanceof Error ? e.message : 'Kayıt indirilemedi.'); }
  };
  return (
    <main className="main onboarding-main" id="main">
      <section className="card stack" aria-labelledby="recovery-title">
        <div className="eyebrow">İyi ki • YKS</div>
        <h1 id="recovery-title">Kayıtlarını birlikte kurtaralım</h1>
        <p>Mevcut kayıtların açılamadı. Verilerin üzerine yeni bir profil yazmadık. Yedeğini geri yükleyebilir veya mevcut kaydı indirdikten sonra yeniden başlayabilirsin.</p>
        <p className="small muted">{error}</p>
        <div className="row">
          <button className="btn" type="button" onClick={download} disabled={busy}>Mevcut kaydı indir</button>
          <label className="btn primary">
            {busy ? 'Yedek yükleniyor…' : 'Yedekten geri yükle'}
            <input type="file" hidden accept="application/json,.json" disabled={busy} onChange={async (event) => {
              const file = event.target.files?.[0];
              if (!file) return;
              setBusy(true);
              try { await restoreBackupFile(file); toast('Yedek geri yüklendi.'); }
              catch (e) { toast(e instanceof Error ? e.message : 'Yedek geri yüklenemedi.'); }
              finally { setBusy(false); }
            }} />
          </label>
          <button className="btn danger" type="button" disabled={busy} onClick={() => setReset(true)}>Yeniden başla</button>
        </div>
      </section>
      {reset && <ConfirmDialog title="Mevcut kayıtlar silinsin mi?" message="Bu işlem geri alınamaz. Önce mevcut kaydı indirerek saklayabilirsin." danger confirmLabel="Sil ve yeniden başla" onCancel={() => setReset(false)} onConfirm={() => void clearAppData().then(() => location.reload())} />}
    </main>
  );
}
