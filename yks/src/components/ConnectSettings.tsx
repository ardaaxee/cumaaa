import { useEffect, useState, useSyncExternalStore } from 'react';
import { checkAiStatus, DEFAULT_AI_SERVER, type AiStatus } from '../services/ai';
import { FIRESTORE_RULES, getCloudStatus, randomCode, shareLink, subscribeCloud, syncNow } from '../services/cloud';
import { canInstall, downloadIcs, getReminderTime, isStandalone, promptInstall, setReminderTime } from '../services/reminder';
import { updateSettings } from '../store/actions';
import { update, useSelector } from '../store/store';
import { useRoute } from '../hooks/useRoute';
import { toast } from './ui';

async function copy(text: string, label: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast(`${label} kopyalandı.`);
  } catch {
    window.prompt(`${label}:`, text);
  }
}

function AiSection() {
  const url = useSelector((s) => s.settings.aiServerUrl);
  const [draft, setDraft] = useState(url);
  const [status, setStatus] = useState<AiStatus | null>(null);
  const [testing, setTesting] = useState(false);

  const save = async () => {
    const clean = draft.trim().replace(/\/+$/, '');
    if (clean && !/^https:\/\/\S+$/.test(clean)) return toast('Adres https:// ile başlamalı.');
    update((s) => updateSettings(s, { aiServerUrl: clean }));
    setTesting(true);
    setStatus(await checkAiStatus(8000));
    setTesting(false);
  };

  return (
    <section className="card section" aria-labelledby="ai-h">
      <h2 id="ai-h" className="mb-8">
        🤖 Yapay zekâ bağlantısı
      </h2>
      <p className="small muted">
        Gerçek AI öğretmen artık varsayılan olarak ortak Render sunucusuna bağlıdır. Zeynep başka telefondan açtığında hiçbir adres girmeden çalışır.
        API anahtarı yalnız Render'da gizli kalır; uygulamaya yazılmaz.
      </p>
      <div className="notice">
        <b>Otomatik sunucu:</b> {DEFAULT_AI_SERVER}
        <div className="tiny muted">Aşağıdaki alanı yalnız farklı bir sunucu kullanmak istersen doldur.</div>
      </div>
      <label className="field">
        <span>Sunucu adresi</span>
        <input className="input" type="url" inputMode="url" value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={DEFAULT_AI_SERVER + ' (otomatik)'} />
      </label>
      <div className="row mt-8">
        <button type="button" className="btn primary" onClick={() => void save()} disabled={testing}>
          {testing ? 'Deneniyor…' : 'Kaydet ve dene'}
        </button>
        {status && (
          <span className={`badge ${status.configured ? 'ok' : 'warn'}`}>{status.configured ? `Bağlı ✓ (${status.model})` : status.reason}</span>
        )}
      </div>
      <details className="mt-12">
        <summary className="small">Ücretsiz nasıl kurarım? (5 dakika)</summary>
        <ol className="small muted">
          <li>
            <b>aistudio.google.com</b> → Google hesabınla gir → “Get API key” → anahtar oluştur (ücretsiz, kart istemez).
          </li>
          <li>
            <b>render.com</b>’a GitHub ile ücretsiz üye ol → New → Blueprint → <b>cumaaa</b> deposunu seç (ayarlar hazır).
          </li>
          <li>İstenince GEMINI_API_KEY alanına anahtarı yapıştır → Deploy (ücretsiz plan).</li>
          <li>Verilen adresi (…onrender.com) yukarıya yapıştır ve “Kaydet ve dene”ye bas.</li>
        </ol>
        <p className="tiny muted">
          Ücretsiz kotada dakikalık/günlük soru sınırı vardır; dolarsa biraz bekleyip tekrar dene. Ücretsiz sunucu bir süre kullanılmazsa uyur, ilk
          cevap ~30 sn gecikebilir. Google ücretsiz kotadaki istekleri hizmetini geliştirmek için kullanabilir; kişisel bilgi yazma.
        </p>
      </details>
    </section>
  );
}

function CloudSection() {
  const route = useRoute();
  const cloud = useSelector((s) => s.settings.cloud);
  const st = useSyncExternalStore(subscribeCloud, getCloudStatus, getCloudStatus);
  const [projectId, setProjectId] = useState(cloud.projectId);
  const [apiKey, setApiKey] = useState(cloud.apiKey);
  const [joinCode, setJoinCode] = useState('');

  // Diğer cihazdan gelen kurulum bağlantısı: #/ayarlar?bulut=<kod>&p=<proje>&a=<anahtar>
  useEffect(() => {
    const code = route.query.get('bulut');
    const p = route.query.get('p');
    const a = route.query.get('a');
    if (code && p && a && code !== cloud.syncCode) {
      update((s) => updateSettings(s, { cloud: { ...s.settings.cloud, projectId: p, apiKey: a, syncCode: code, shareCode: s.settings.cloud.shareCode || randomCode() } }));
      toast('Bu cihaz buluta bağlandı. Veriler eşitleniyor…');
      setTimeout(() => void syncNow(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveConfig = (syncCode: string) => {
    const p = projectId.trim();
    const a = apiKey.trim();
    if (!/^[a-z0-9-]{4,40}$/.test(p) || !/^[A-Za-z0-9_-]{20,60}$/.test(a)) return toast('Firebase proje kimliğini ve web API anahtarını kontrol et.');
    if (!/^[A-Za-z0-9]{20,64}$/.test(syncCode)) return toast('Eşitleme kodu en az 20 harf/rakam olmalı.');
    update((s) => updateSettings(s, { cloud: { projectId: p, apiKey: a, syncCode, shareCode: s.settings.cloud.shareCode || randomCode() } }));
    setTimeout(() => void syncNow(), 200);
  };

  const deviceLink = cloud.syncCode
    ? `${location.origin}${location.pathname}#/ayarlar?${new URLSearchParams({ bulut: cloud.syncCode, p: cloud.projectId, a: cloud.apiKey })}`
    : '';

  return (
    <section className="card section" aria-labelledby="cloud-h">
      <h2 id="cloud-h" className="mb-8">
        ☁️ Bulut kaydı (cihazlar arası)
      </h2>
      <p className="small muted">Verilerin bu telefonda kaybolmasın, başka cihazda da aynısını gör. Ücretsiz bir Firebase projesi yeter.</p>
      {cloud.syncCode ? (
        <>
          <div className="notice">
            {st.syncing ? 'Eşitleniyor…' : st.error ? `⚠ ${st.error}` : st.lastSyncAt ? `✓ Son eşitleme: ${new Date(st.lastSyncAt).toLocaleString('tr-TR')}` : 'Henüz eşitlenmedi.'}
          </div>
          <div className="row mt-8">
            <button type="button" className="btn primary" onClick={() => void syncNow()} disabled={st.syncing}>
              Şimdi eşitle
            </button>
            <button type="button" className="btn" onClick={() => void copy(deviceLink, 'Diğer cihaz bağlantısı')}>
              Diğer cihazı bağla (bağlantı kopyala)
            </button>
            <button
              type="button"
              className="btn ghost danger"
              onClick={() => update((s) => updateSettings(s, { cloud: { ...s.settings.cloud, syncCode: '' } }))}
            >
              Bu cihazda kapat
            </button>
          </div>
          <p className="tiny muted mt-8">Diğer cihazda bu bağlantıyı açman yeterli. Bağlantı gizli koddur; yalnız kendi cihazlarında kullan.</p>
        </>
      ) : (
        <>
          <div className="form-grid two">
            <label className="field">
              <span>Firebase proje kimliği</span>
              <input className="input" value={projectId} onChange={(e) => setProjectId(e.target.value)} placeholder="iyiki-yks-12345" />
            </label>
            <label className="field">
              <span>Firebase web API anahtarı</span>
              <input className="input" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIza…" />
            </label>
          </div>
          <div className="row mt-8">
            <button type="button" className="btn primary" onClick={() => saveConfig(randomCode())}>
              Eşitlemeyi başlat (yeni kod)
            </button>
          </div>
          <div className="row mt-8">
            <input className="input" style={{ flex: 1, minWidth: 0 }} value={joinCode} onChange={(e) => setJoinCode(e.target.value.trim())} placeholder="…ya da diğer cihazdaki eşitleme kodu" />
            <button type="button" className="btn" onClick={() => saveConfig(joinCode)} disabled={!joinCode}>
              Bağlan
            </button>
          </div>
          <details className="mt-12">
            <summary className="small">Firebase’i nasıl kurarım? (5 dakika, ücretsiz)</summary>
            <ol className="small muted">
              <li>console.firebase.google.com → Proje ekle (Analytics gerekmez).</li>
              <li>Build → Firestore Database → Veritabanı oluştur (production mode).</li>
              <li>
                Rules sekmesine aşağıdaki kuralları yapıştır → Publish.{' '}
                <button type="button" className="btn small" onClick={() => void copy(FIRESTORE_RULES, 'Kurallar')}>
                  Kuralları kopyala
                </button>
              </li>
              <li>Proje ayarları → Web uygulaması ekle (&lt;/&gt;) → çıkan projectId ve apiKey değerlerini yukarı yapıştır.</li>
            </ol>
          </details>
        </>
      )}
    </section>
  );
}

function ShareSection() {
  const state = useSelector((s) => s);
  const link = shareLink(state);
  return (
    <section className="card section" aria-labelledby="share-h">
      <h2 id="share-h" className="mb-8">
        💌 Ortak ekran (sevgilinle paylaş)
      </h2>
      {!link ? (
        <p className="small muted">Önce bulut kaydını aç. Sonra buradan özel bir bağlantı alırsın: o bağlantıyı açan kişi serini, haftalık soru sayını ve rozetlerini görür, sana moral mesajı bırakabilir. Notların ve cevapların görünmez.</p>
      ) : (
        <>
          <p className="small muted">Bu bağlantıyı yalnız güvendiğin kişiyle paylaş. Açan kişi yalnız çalışma sayılarını görür ve mesaj bırakabilir.</p>
          <div className="row">
            <button
              type="button"
              className="btn primary"
              onClick={() =>
                navigator.share ? void navigator.share({ title: 'Çalışma odam ♡', url: link }).catch(() => undefined) : void copy(link, 'Paylaşım bağlantısı')
              }
            >
              Bağlantıyı paylaş
            </button>
            <button type="button" className="btn" onClick={() => void copy(link, 'Paylaşım bağlantısı')}>
              Kopyala
            </button>
            <a className="btn ghost" href={link.slice(link.indexOf('#'))}>
              Önizle
            </a>
          </div>
        </>
      )}
    </section>
  );
}

function ReminderSection() {
  const [time, setTime] = useState(getReminderTime() || '20:00');
  const [active, setActive] = useState(!!getReminderTime());
  const [perm, setPerm] = useState(typeof Notification !== 'undefined' ? Notification.permission : 'unsupported');
  const [installable, setInstallable] = useState(canInstall());
  useEffect(() => {
    const on = () => setInstallable(canInstall());
    window.addEventListener('iyiki:installable', on);
    return () => window.removeEventListener('iyiki:installable', on);
  }, []);

  const enable = async () => {
    setReminderTime(time);
    setActive(true);
    if (typeof Notification !== 'undefined' && Notification.permission === 'default') setPerm(await Notification.requestPermission());
    toast(`Hatırlatıcı ${time} için kuruldu.`);
  };

  return (
    <section className="card section" aria-labelledby="rem-h">
      <h2 id="rem-h" className="mb-8">
        ⏰ Günlük hatırlatıcı ve ana ekran
      </h2>
      <div className="row">
        <label className="field" style={{ flex: '0 0 auto' }}>
          <span>Saat</span>
          <input className="input" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </label>
        <button type="button" className="btn primary" onClick={() => void enable()} style={{ alignSelf: 'flex-end' }}>
          {active ? 'Saati güncelle' : 'Hatırlatıcıyı aç'}
        </button>
        <button type="button" className="btn" onClick={() => downloadIcs(time)} style={{ alignSelf: 'flex-end' }}>
          📅 Takvime ekle
        </button>
        {active && (
          <button
            type="button"
            className="btn ghost"
            onClick={() => {
              setReminderTime('');
              setActive(false);
            }}
            style={{ alignSelf: 'flex-end' }}
          >
            Kapat
          </button>
        )}
      </div>
      <p className="tiny muted mt-8">
        En güvenilir yol “Takvime ekle”: telefonunun takvimi her gün bu saatte bildirim verir. Uygulama açıkken ayrıca tarayıcı bildirimi gelir
        {perm === 'denied' ? ' (bildirim izni kapalı)' : perm === 'granted' ? ' (izin verildi ✓)' : ''}.
      </p>
      <div className="divider" />
      {isStandalone() ? (
        <div className="small">✓ Uygulama ana ekranında yüklü.</div>
      ) : installable ? (
        <button type="button" className="btn" onClick={() => void promptInstall()}>
          📲 Ana ekrana ekle
        </button>
      ) : (
        <p className="small muted">
          📲 Ana ekrana eklemek için: iPhone’da Safari’de <b>Paylaş → Ana Ekrana Ekle</b>; Android’de Chrome menüsünden <b>Ana ekrana ekle</b>.
        </p>
      )}
    </section>
  );
}

export function ConnectSettings() {
  return (
    <>
      <AiSection />
      <CloudSection />
      <ShareSection />
      <ReminderSection />
    </>
  );
}
