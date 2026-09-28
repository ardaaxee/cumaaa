import { useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import { subjectColorFor } from '../data/subjectColors';
import type { SubjectId } from '../domain/types';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Empty, Modal } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { useIsDark } from '../hooks/useIsDark';
import { deletePageImage } from '../services/notebookStore';
import { addNotebookPage, deleteNotebookPage } from '../store/actions';
import type { NotebookPageMeta } from '../store/schema';
import { update, useSelector } from '../store/store';
import { formatDay, dayKey } from '../utils/date';

function NewPageForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState<SubjectId | ''>('');
  return (
    <Modal
      title="Yeni defter sayfası"
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Vazgeç
          </button>
          <button
            type="button"
            className="btn primary"
            onClick={() => {
              let id = '';
              update((s) => {
                const r = addNotebookPage(s, title, subjectId || undefined);
                id = r.id;
                return r.state;
              });
              onClose();
              navigate(`/defterim/${id}`);
            }}
          >
            Oluştur
          </button>
        </>
      }
    >
      <div className="form-grid">
        <label className="field">
          <span>Başlık</span>
          <input className="input" autoFocus value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Örn. Fizik notu — vektörler" />
        </label>
        <label className="field">
          <span>Ders (isteğe bağlı)</span>
          <select className="select" value={subjectId} onChange={(e) => setSubjectId(e.target.value as SubjectId | '')}>
            <option value="">Genel</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {subjectLabel(s)}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  );
}

export default function NotebookPage() {
  const pages = useSelector((s) => s.notebookPages);
  const isDark = useIsDark();
  const [creating, setCreating] = useState(false);
  const [del, setDel] = useState<NotebookPageMeta | null>(null);

  const sorted = pages.slice().sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  return (
    <>
      <div style={{ position: 'relative' }}>
        <PageHeader
        title="Defterim"
        sub="Kareli sayfada kalem, silgi ve şekil araçlarıyla not tut"
        actions={
          <button type="button" className="btn primary" onClick={() => setCreating(true)}>
            <Icon name="plus" /> <span>Yeni sayfa</span>
          </button>
        }
        />
      </div>

      {sorted.length === 0 ? (
        <div className="card">
          <Empty title="Henüz defter sayfan yok." action={<button type="button" className="btn primary" onClick={() => setCreating(true)}>İlk sayfanı aç</button>}>
            Fizik formüllerini, grafiklerini ya da paragraf hatalarını renkli kalemlerle buraya yazabilirsin.
          </Empty>
        </div>
      ) : (
        <div className="grid grid-cards section">
          {sorted.map((p) => {
            const subject = p.subjectId ? SUBJECTS.find((s) => s.id === p.subjectId) : undefined;
            const accent = p.subjectId ? subjectColorFor(p.subjectId, isDark) : null;
            return (
              <div key={p.id} className="card notebook-card" style={accent ? { borderColor: accent.fg } : undefined}>
                <a href={`#/defterim/${p.id}`} className="notebook-card-link">
                  <div className="notebook-thumb" aria-hidden="true">
                    <Icon name="sparkle" size={22} />
                  </div>
                  <div className="grow">
                    <b>{p.title}</b>
                    <div className="tiny muted">
                      {subject ? subjectLabel(subject) : 'Genel'} · {formatDay(dayKey(new Date(p.updatedAt)))}
                    </div>
                  </div>
                </a>
                <button type="button" className="icon-btn" aria-label={`${p.title} sayfasını sil`} onClick={() => setDel(p)}>
                  <Icon name="trash" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {creating && <NewPageForm onClose={() => setCreating(false)} />}
      {del && (
        <ConfirmDialog
          title="Sayfa silinsin mi?"
          message={del.title}
          confirmLabel="Sil"
          danger
          onCancel={() => setDel(null)}
          onConfirm={() => {
            update((s) => deleteNotebookPage(s, del.id));
            void deletePageImage(del.id);
            setDel(null);
          }}
        />
      )}
    </>
  );
}
