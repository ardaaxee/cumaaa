import { useState } from 'react';
import './plan-page.css';
import { SUBJECTS, subjectLabel, subjectTopics, getTopicRef } from '../data/curriculum';
import type { SubjectId } from '../domain/types';
import { Icon } from '../components/Icon';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, Empty, Modal, Segmented, toast } from '../components/ui';
import { navigate } from '../hooks/useRoute';
import { buildAdaptivePlan } from '../services/adaptiveStudy';
import { launchTest, makeConfig } from '../services/testLauncher';
import { addTask, carryAllUnfinished, carryTask, deleteTask, toggleTask, updateTask, type NewTask } from '../store/actions';
import type { PlanTask, TaskType } from '../store/schema';
import { getState, update, useSelector } from '../store/store';
import { MOCK_REASONS } from '../utils/mockLearning';
import { addDays, dayKey, formatDay, isValidDayKey, weekDays } from '../utils/date';

export const TASK_TYPES: { value: TaskType; label: string }[] = [
  { value: 'konu', label: 'Konu çalış' },
  { value: 'test', label: 'Test çöz' },
  { value: 'yanlis', label: 'Yanlış tekrar' },
  { value: 'deneme', label: 'Deneme' },
  { value: 'video', label: 'Video izle' },
  { value: 'tekrar', label: 'Tekrar' },
  { value: 'ozel', label: 'Özel görev' },
];

const typeLabel = (t: TaskType) => TASK_TYPES.find((x) => x.value === t)?.label ?? t;

function TaskForm({ initial, onClose }: { initial: Partial<PlanTask> & { date: string }; onClose: () => void }) {
  const [f, setF] = useState<NewTask>({
    date: initial.date,
    time: initial.time ?? '',
    type: initial.type ?? 'konu',
    title: initial.title ?? '',
    subjectId: initial.subjectId,
    topicId: initial.topicId,
    targetQuestions: initial.targetQuestions,
    estMinutes: initial.estMinutes,
  });
  const [error, setError] = useState('');
  const topics = f.subjectId ? subjectTopics(f.subjectId) : [];
  const set = (patch: Partial<NewTask>) => setF((x) => ({ ...x, ...patch }));

  const save = () => {
    const topicName = f.topicId ? getTopicRef(f.topicId)?.topic.name : '';
    const title = f.title.trim() || (topicName ? `${typeLabel(f.type)}: ${topicName}` : '');
    if (!title) return setError('Başlık yaz ya da bir konu seç.');
    if (!isValidDayKey(f.date)) return setError('Geçerli bir tarih seç.');
    const clean: NewTask = {
      ...f,
      title: title.slice(0, 140),
      time: f.time || undefined,
      targetQuestions: f.targetQuestions && f.targetQuestions > 0 ? Math.min(500, Math.round(f.targetQuestions)) : undefined,
      estMinutes: f.estMinutes && f.estMinutes > 0 ? Math.min(600, Math.round(f.estMinutes)) : undefined,
    };
    if (initial.id) update((s) => updateTask(s, initial.id!, clean));
    else update((s) => addTask(s, clean));
    toast(initial.id ? 'Görev güncellendi.' : 'Görev eklendi.');
    onClose();
  };

  return (
    <Modal
      title={initial.id ? 'Görevi düzenle' : 'Görev ekle'}
      onClose={onClose}
      actions={
        <>
          <button type="button" className="btn" onClick={onClose}>
            Vazgeç
          </button>
          <button type="button" className="btn primary" onClick={save}>
            Kaydet
          </button>
        </>
      }
    >
      <div className="form-grid two">
        <label className="field">
          <span>Görev türü</span>
          <select className="select" value={f.type} onChange={(e) => set({ type: e.target.value as TaskType })}>
            {TASK_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Başlık</span>
          <input className="input" value={f.title} maxLength={140} onChange={(e) => set({ title: e.target.value })} placeholder="Boş bırakırsan konudan oluşur" />
        </label>
        <label className="field">
          <span>Tarih</span>
          <input className="input" type="date" value={f.date} onChange={(e) => set({ date: e.target.value })} required />
        </label>
        <label className="field">
          <span>Saat (isteğe bağlı)</span>
          <input className="input" type="time" value={f.time ?? ''} onChange={(e) => set({ time: e.target.value })} />
        </label>
        <label className="field">
          <span>Ders</span>
          <select className="select" value={f.subjectId ?? ''} onChange={(e) => set({ subjectId: (e.target.value || undefined) as SubjectId | undefined, topicId: undefined })}>
            <option value="">—</option>
            {SUBJECTS.map((s) => (
              <option key={s.id} value={s.id}>
                {subjectLabel(s)}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Konu</span>
          <select className="select" value={f.topicId ?? ''} disabled={!f.subjectId} onChange={(e) => set({ topicId: e.target.value || undefined })}>
            <option value="">—</option>
            {topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Hedef soru</span>
          <input className="input" type="number" min={0} inputMode="numeric" value={f.targetQuestions ?? ''} onChange={(e) => set({ targetQuestions: e.target.value ? Number(e.target.value) : undefined })} />
        </label>
        <label className="field">
          <span>Tahmini süre (dk)</span>
          <input className="input" type="number" min={0} inputMode="numeric" value={f.estMinutes ?? ''} onChange={(e) => set({ estMinutes: e.target.value ? Number(e.target.value) : undefined })} />
        </label>
      </div>
      {error && (
        <div className="field-error mt-8" role="alert">
          {error}
        </div>
      )}
    </Modal>
  );
}

async function runTask(t: PlanTask) {
  if (t.type === 'tekrar' && t.sourceMockId && t.topicId) return navigate(`/tekrar/${t.topicId}`);
  if (t.type === 'konu' || t.type === 'tekrar') return navigate(t.topicId ? `/konu/${t.topicId}` : '/tekrar');
  if (t.type === 'test') {
    const timed = t.sourceMockId ? getState().mocks.find(m => m.id === t.sourceMockId)?.learning?.issues.some(i => !i.reviewed && i.topicId === t.topicId && i.reason === 'sure') : false;
    const err = await launchTest(
      makeConfig({ subjectId: t.subjectId ?? 'all', topicId: t.topicId ?? 'all', count: [5, 10, 20, 40].find((n) => n >= (t.targetQuestions ?? 10)) ?? 40, origin: 'plan', mode: timed ? 'sinav' : 'ogrenme', durationMin: timed ? 15 : undefined, title: t.title }),
    );
    if (err) toast(err);
    return;
  }
  if (t.type === 'yanlis') return navigate('/yanlislar');
  if (t.type === 'deneme') return navigate('/denemeler');
  if (t.type === 'video') return navigate('/kaynaklar');
  return undefined;
}

function TaskRow({ t, onEdit, onDelete }: { t: PlanTask; onEdit: () => void; onDelete: () => void }) {
  const mocks = useSelector((s) => s.mocks);
  const source = mocks.find((m) => m.id === t.sourceMockId);
  const reasons = [...new Set(source?.learning?.issues.filter((i) => i.topicId === t.topicId).map((i) => i.reason) ?? [])];
  const stage = t.type === 'konu' ? '1. Anlatım ve çözümlü örnekler' : t.type === 'test' ? '2. Pekiştirme soruları' : t.type === 'tekrar' ? '3. Tekrarla öğrenmeni ölç' : '';
  const meta = [
    typeLabel(t.type),
    t.time,
    t.topicId ? getTopicRef(t.topicId)?.topic.name : '',
    t.targetQuestions ? `${t.targetQuestions} soru` : '',
    t.estMinutes ? `${t.estMinutes} dk` : '',
    t.carriedFrom ? `${formatDay(t.carriedFrom)} tarihinden taşındı` : '',
  ].filter(Boolean);
  return (
    <li className={`task${t.done ? ' done' : ''}`}>
      <input type="checkbox" className="task-check" checked={t.done} onChange={() => update((s) => toggleTask(s, t.id))} aria-label={`${t.title} tamamlandı`} />
      <div className="grow">
        <div className="task-title">{t.title}</div>
        <div className="task-meta">{meta.join(' · ')}</div>
        {source && <div className="mt-8">
          <a className="btn small ghost" href={`#/denemeler?sinav=${source.exam}&deneme=${encodeURIComponent(source.id)}`} aria-label={`${source.name} deneme analizini aç`}>Kaynak: {source.name}</a>
          <p className="task-meta">{[stage, reasons.length ? `Çalışma nedeni: ${reasons.map((r) => MOCK_REASONS[r].label).join(', ')}` : ''].filter(Boolean).join(' · ')}</p>
        </div>}
        <div className="row mt-8">
          {t.type !== 'ozel' && !t.done && (
            <button type="button" className="btn small" onClick={() => void runTask(t)}>
              Başla
            </button>
          )}
          {!t.done && (
            <button type="button" className="btn small ghost" onClick={() => { update((s) => carryTask(s, t.id)); toast('Görev ertesi güne taşındı.'); }}>
              Yarına taşı
            </button>
          )}
          <button type="button" className="btn small ghost" onClick={onEdit}>
            Düzenle
          </button>
          <button type="button" className="btn small ghost danger" onClick={onDelete} aria-label={`${t.title} görevini sil`}>
            <Icon name="trash" />
          </button>
        </div>
      </div>
    </li>
  );
}

export default function PlanPage() {
  const tasks = useSelector((s) => s.tasks);
  const today = dayKey();
  const [view, setView] = useState<'gun' | 'hafta'>('gun');
  const [day, setDay] = useState(today);
  const [weekAnchor, setWeekAnchor] = useState(today);
  const [form, setForm] = useState<(Partial<PlanTask> & { date: string }) | null>(null);
  const [del, setDel] = useState<PlanTask | null>(null);
  const [smartBusy, setSmartBusy] = useState(false);

  const dayTasks = tasks.filter((t) => t.date === day).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
  const unfinished = dayTasks.filter((t) => !t.done).length;
  const overdue = tasks.filter((t) => t.date < today && !t.done);
  const days = weekDays(weekAnchor);
  const doneCount = dayTasks.filter((t) => t.done).length;
  const minutes = dayTasks.reduce((s, t) => s + (t.estMinutes ?? 0), 0);

  const refreshSmartWeek = () => {
    if (smartBusy) return;
    setSmartBusy(true);
    try {
      const current = getState();
      const smart = buildAdaptivePlan(current, today, 7);
      update((state) => {
        const kept = state.tasks.filter(
          (t) => !(t.date >= today && !t.done && t.title.startsWith('Akıllı ·')),
        );
        let next = { ...state, tasks: kept };
        for (const task of smart.tasks) next = addTask(next, task);
        return next;
      });
      setWeekAnchor(today);
      setDay(today);
      toast('Akıllı 7 günlük plan güncellendi. Kendi eklediğin görevler korundu.', 5000);
    } finally {
      setSmartBusy(false);
    }
  };

  return (
    <div className="plan-page">
      <PageHeader
        title="Planım"
        sub="Günlük ve haftalık çalışma planı"
        actions={
          <div className="row nowrap">
            <button type="button" className="btn" disabled={smartBusy} onClick={refreshSmartWeek}>
              <Icon name="target" /> <span>{smartBusy ? 'Hazırlanıyor…' : '7 günü akıllı yenile'}</span>
            </button>
            <button type="button" className="btn primary" onClick={() => setForm({ date: view === 'gun' ? day : today })}>
              <Icon name="plus" /> <span>Görev</span>
            </button>
          </div>
        }
      />
      <div className="notice plan-smart-notice">
        <div className="grow">
          <b>Akıllı plan artık gerçek verine göre yenileniyor.</b>
          <div className="small muted">
            Son doğruluk, açık yanlışlar, tekrar zamanı ve günlük hedeflerin birlikte değerlendirilir. Elle eklediğin görevler silinmez.
          </div>
        </div>
        <a className="btn small ghost" href="#/koc">Neden bu konular?</a>
      </div>

      <div className="plan-toolbar">
        <Segmented
          label="Görünüm"
          value={view}
          onChange={setView}
          options={[
            { value: 'gun', label: 'Günlük' },
            { value: 'hafta', label: 'Haftalık' },
          ]}
        />
        {view === 'gun' && day !== today && (
          <button type="button" className="btn small ghost" onClick={() => setDay(today)}>
            Bugüne dön
          </button>
        )}
      </div>

      {view === 'gun' && (
        <div className="plan-summary" aria-label="Seçili gün özeti">
          <div><b>{dayTasks.length}</b><span>görev</span></div>
          <div><b>{doneCount}</b><span>tamamlandı</span></div>
          <div><b>{unfinished}</b><span>kaldı</span></div>
          <div><b>{minutes || 0}</b><span>planlanan dk</span></div>
        </div>
      )}

      {overdue.length > 0 && (
        <div className="notice warn section">
          <div className="grow">
            Geçmiş günlerden {overdue.length} tamamlanmamış görev var.
          </div>
          <button
            type="button"
            className="btn small"
            onClick={() => {
              update((s) => ({
                ...s,
                tasks: s.tasks.map((t) => (t.date < today && !t.done ? { ...t, carriedFrom: t.carriedFrom ?? t.date, date: today } : t)),
              }));
              toast('Eski görevler bugüne taşındı.');
            }}
          >
            Bugüne taşı
          </button>
        </div>
      )}

      {view === 'gun' ? (
        <section className="card section plan-day-card" aria-labelledby="day-h">
          <div className="row between">
            <button type="button" className="icon-btn" aria-label="Önceki gün" onClick={() => setDay(addDays(day, -1))}>
              <Icon name="left" />
            </button>
            <div className="center">
              <h2 id="day-h">{day === today ? 'Bugün' : formatDay(day, { weekday: 'long' })}</h2>
              <div className="small muted">{formatDay(day, { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <button type="button" className="icon-btn" aria-label="Sonraki gün" onClick={() => setDay(addDays(day, 1))}>
              <Icon name="right" />
            </button>
          </div>
          <div className="small muted center mt-8">
            {dayTasks.length ? `${doneCount}/${dayTasks.length} görev tamamlandı${minutes ? ` · planlanan ${minutes} dk` : ''}` : ''}
          </div>
          {dayTasks.length === 0 ? (
            <Empty title="Bu gün için görev yok." action={<button type="button" className="btn" onClick={() => setForm({ date: day })}>Görev ekle</button>} />
          ) : (
            <ul className="list mt-8">
              {dayTasks.map((t) => (
                <TaskRow key={t.id} t={t} onEdit={() => setForm(t)} onDelete={() => setDel(t)} />
              ))}
            </ul>
          )}
          {unfinished > 0 && (
            <button
              type="button"
              className="btn block mt-12"
              onClick={() => {
                update((s) => carryAllUnfinished(s, day));
                toast(`${unfinished} görev ertesi güne taşındı.`);
              }}
            >
              Tamamlanmayanları ertesi güne taşı ({unfinished})
            </button>
          )}
        </section>
      ) : (
        <section className="section plan-week-section" aria-labelledby="week-h">
          <div className="row between mb-8">
            <button type="button" className="icon-btn" aria-label="Önceki hafta" onClick={() => setWeekAnchor(addDays(weekAnchor, -7))}>
              <Icon name="left" />
            </button>
            <h2 id="week-h">
              {formatDay(days[0])} – {formatDay(days[6])}
            </h2>
            <button type="button" className="icon-btn" aria-label="Sonraki hafta" onClick={() => setWeekAnchor(addDays(weekAnchor, 7))}>
              <Icon name="right" />
            </button>
          </div>
          <div className="week">
            {days.map((d) => {
              const list = tasks.filter((t) => t.date === d).sort((a, b) => (a.time ?? '99').localeCompare(b.time ?? '99'));
              const done = list.filter((t) => t.done).length;
              return (
                <div key={d} className={`day-col${d === today ? ' today' : ''}`}>
                  <div className="row between nowrap">
                    <h3>{formatDay(d, { weekday: 'short', day: 'numeric' })}</h3>
                    <span className="tiny muted">
                      {done}/{list.length}
                    </span>
                  </div>
                  {list.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      className={`mini-task${t.done ? ' done' : ''}`}
                      style={{ display: 'block', width: '100%', textAlign: 'left', border: 0 }}
                      onClick={() => {
                        setDay(d);
                        setView('gun');
                      }}
                    >
                      {t.time ? `${t.time} · ` : ''}
                      {t.title}
                    </button>
                  ))}
                  <button type="button" className="btn small ghost block mt-8" onClick={() => setForm({ date: d })} aria-label={`${formatDay(d)} için görev ekle`}>
                    <Icon name="plus" /> Ekle
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {form && <TaskForm initial={form} onClose={() => setForm(null)} />}
      {del && (
        <ConfirmDialog
          title="Görev silinsin mi?"
          message={del.title}
          confirmLabel="Sil"
          danger
          onCancel={() => setDel(null)}
          onConfirm={() => {
            update((s) => deleteTask(s, del.id));
            setDel(null);
          }}
        />
      )}
    </div>
  );
}
