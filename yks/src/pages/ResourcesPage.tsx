import { useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import { OFFICIAL_RESOURCES } from '../data/officialResources';
import type { SubjectId } from '../domain/types';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Empty, Modal, SourceBadge, toast } from '../components/ui';
import { useRoute } from '../hooks/useRoute';
import { addVideo, deleteVideo, toggleVideoWatched } from '../store/actions';
import type { VideoResource } from '../store/schema';
import { update, useSelector } from '../store/store';

type NewVideo = Omit<VideoResource, 'id' | 'createdAt' | 'watched'>;

function VideoForm({ initial, onClose }: { initial: Partial<NewVideo>; onClose: () => void }) {
  const [f, setF] = useState<NewVideo>({ title: initial.title ?? '', channel: initial.channel ?? '', url: initial.url ?? '', subjectId: initial.subjectId, topicId: initial.topicId });
  const [error, setError] = useState('');
  const save = () => {
    if (!f.title.trim()) return setError('Başlık gerekli.');
    if (!/^https?:\/\/\S+/.test(f.url.trim())) return setError('Geçerli bir bağlantı gir (https://…).');
    update((s) => addVideo(s, { ...f, title: f.title.trim().slice(0, 140), channel: f.channel.trim().slice(0, 80), url: f.url.trim() }));
    toast('Video eklendi.');
    onClose();
  };
  return (
    <Modal
      title="Video kaynağı ekle"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn" onClick={onClose}>Vazgeç</button>
          <button type="button" className="btn primary" onClick={save}>Kaydet</button>
        </>
      }
    >
      <div className="form-grid">
        <label className="field">
          <span>Video adı</span>
          <input className="input" value={f.title} onChange={(e) => setF((x) => ({ ...x, title: e.target.value }))} />
        </label>
        <label className="field">
          <span>Bağlantı</span>
          <input className="input" value={f.url} onChange={(e) => setF((x) => ({ ...x, url: e.target.value }))} placeholder="https://youtube.com/…" />
        </label>
        <label className="field">
          <span>Kanal / etiket (isteğe bağlı)</span>
          <input className="input" value={f.channel} onChange={(e) => setF((x) => ({ ...x, channel: e.target.value }))} />
        </label>
        <label className="field">
          <span>Ders (isteğe bağlı)</span>
          <select className="select" value={f.subjectId ?? ''} onChange={(e) => setF((x) => ({ ...x, subjectId: (e.target.value || undefined) as SubjectId | undefined }))}>
            <option value="">—</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {subjectLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && <div className="field-error mt-8">{error}</div>}
    </Modal>
  );
}

export default function ResourcesPage() {
  const videos = useSelector((s) => s.videos);
  const route = useRoute();
  const [adding, setAdding] = useState(false);
  const [del, setDel] = useState<VideoResource | null>(null);
  const presetTopic = route.query.get('konu') ?? undefined;

  return (
    <>
      <PageHeader title="Kaynaklar" sub="Resmî MEB / ÖSYM kaynakları ve kendi video listen" />

      <section className="card" aria-labelledby="off-h">
        <div className="card-head">
          <h2 id="off-h">Resmî kaynaklar</h2>
          <SourceBadge type="osym-resmi" />
        </div>
        <ul className="list">
          {OFFICIAL_RESOURCES.map((r) => (
            <li key={r.url} className="resource list-item" style={{ alignItems: 'flex-start' }}>
              <div className="grow">
                <b>{r.title}</b> <span className="badge outline">{r.org}</span>
                <div className="small muted">{r.desc}</div>
              </div>
              <a className="btn small" href={r.url} target="_blank" rel="noopener noreferrer">
                Aç <Icon name="external" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="card section" aria-labelledby="vid-h">
        <div className="card-head">
          <h2 id="vid-h">YouTube / video kaynaklarım</h2>
          <button type="button" className="btn small primary" onClick={() => setAdding(true)}>
            <Icon name="plus" /> Kaynak ekle
          </button>
        </div>
        {videos.length === 0 ? (
          <Empty title="Henüz video kaynağı eklemedin.">Kendi izlediğin YouTube derslerini burada listeleyip “izlendi” olarak işaretleyebilirsin.</Empty>
        ) : (
          <ul className="list">
            {videos.map((v) => (
              <li key={v.id} className="list-item">
                <Icon name="video" />
                <div className="grow">
                  <b>{v.title}</b>
                  <div className="tiny muted">
                    {v.channel || 'Etiketsiz'}
                    {v.subjectId && <> · {subjectLabel(SUBJECTS.find((s) => s.id === v.subjectId)!)}</>}
                  </div>
                </div>
                {v.watched && <span className="badge ok">İzlendi</span>}
                <a className="btn small" href={v.url} target="_blank" rel="noopener noreferrer">
                  Aç
                </a>
                <button type="button" className="btn small ghost" onClick={() => update((s) => toggleVideoWatched(s, v.id))}>
                  {v.watched ? 'Geri al' : 'İzlendi'}
                </button>
                <button type="button" className="icon-btn" aria-label="Videoyu sil" onClick={() => setDel(v)}>
                  <Icon name="trash" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="tiny muted section">
        Kullanıcı kaynağı olarak eklediğin videolar yalnız senin cihazında saklanır. <SourceBadge type="kullanici" />
      </p>

      {adding && <VideoForm initial={{ topicId: presetTopic }} onClose={() => setAdding(false)} />}
      {del && (
        <ConfirmDialog
          title="Video kaldırılsın mı?"
          message={del.title}
          confirmLabel="Kaldır"
          danger
          onCancel={() => setDel(null)}
          onConfirm={() => {
            update((s) => deleteVideo(s, del.id));
            setDel(null);
          }}
        />
      )}
    </>
  );
}
