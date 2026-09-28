import { useRef, useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import type { SubjectId } from '../domain/types';
import { AssistantCharacter } from '../components/AssistantCharacter';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, toast } from '../components/ui';
import { getTeacherPhoto, resizeImage, setTeacherPhoto } from '../services/photoStore';
import { updateProfile, updateSettings } from '../store/actions';
import { createBackup, migrationContext, parseBackup } from '../store/storage';
import { replaceState, update, useAppState } from '../store/store';
import { isValidDayKey } from '../utils/date';

export default function SettingsPage() {
  const state = useAppState();
  const { profile, settings } = state;
  const fileRef = useRef<HTMLInputElement>(null);
  const photoRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  const exportData = async () => {
    const photo = await getTeacherPhoto();
    const backup = createBackup(state, photo);
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `iyi-ki-yks-yedek-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    toast('Yedek indirildi.');
  };

  const importData = async (file: File) => {
    setBusy(true);
    try {
      const text = await file.text();
      const { state: next, teacherPhoto, report } = parseBackup(text, migrationContext());
      replaceState(next);
      if (teacherPhoto) await setTeacherPhoto(teacherPhoto);
      toast(report.notes.length ? `Yedek içe aktarıldı. ${report.notes[0]}` : 'Yedek içe aktarıldı.', 5000);
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Geçersiz yedek dosyası.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const uploadPhoto = async (file: File) => {
    setBusy(true);
    try {
      const dataUrl = await resizeImage(file);
      await setTeacherPhoto(dataUrl);
      toast('Öğretmen fotoğrafı güncellendi.');
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Fotoğraf yüklenemedi.');
    } finally {
      setBusy(false);
      if (photoRef.current) photoRef.current.value = '';
    }
  };

  return (
    <>
      <PageHeader title="Ayarlar" />

      <section className="card" aria-labelledby="prof-h">
        <h2 id="prof-h" className="mb-8">
          Profil ve hedefler
        </h2>
        <div className="form-grid two">
          <label className="field">
            <span>Adın</span>
            <input className="input" value={profile.name} maxLength={40} onChange={(e) => update((s) => updateProfile(s, { name: e.target.value }))} />
          </label>
          <label className="field">
            <span>Sınıf</span>
            <input className="input" value={profile.grade} maxLength={30} onChange={(e) => update((s) => updateProfile(s, { grade: e.target.value }))} />
          </label>
          <label className="field">
            <span>Alan</span>
            <input className="input" value={profile.field} maxLength={30} onChange={(e) => update((s) => updateProfile(s, { field: e.target.value }))} />
          </label>
          <label className="field">
            <span>En zorlandığın ders</span>
            <select
              className="select"
              value={profile.hardestSubject}
              onChange={(e) => update((s) => updateProfile(s, { hardestSubject: (e.target.value || '') as SubjectId | '' }))}
            >
              <option value="">Belirtmedim</option>
              {SUBJECTS.map((s) => (
                <option key={s.id} value={s.id}>
                  {subjectLabel(s)}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Günlük soru hedefi</span>
            <input className="input" type="number" min={1} max={500} value={profile.dailyQuestionGoal} onChange={(e) => update((s) => updateProfile(s, { dailyQuestionGoal: Math.max(1, Number(e.target.value) || 1) }))} />
          </label>
          <label className="field">
            <span>Günlük çalışma hedefi (dk)</span>
            <input className="input" type="number" min={10} max={900} value={profile.dailyStudyMinutes} onChange={(e) => update((s) => updateProfile(s, { dailyStudyMinutes: Math.max(10, Number(e.target.value) || 10) }))} />
          </label>
          <label className="field">
            <span>TYT hedef net</span>
            <input className="input" type="number" min={0} max={120} value={profile.tytTarget ?? ''} onChange={(e) => update((s) => updateProfile(s, { tytTarget: e.target.value ? Number(e.target.value) : null }))} />
          </label>
          <label className="field">
            <span>AYT hedef net</span>
            <input className="input" type="number" min={0} max={80} value={profile.aytTarget ?? ''} onChange={(e) => update((s) => updateProfile(s, { aytTarget: e.target.value ? Number(e.target.value) : null }))} />
          </label>
          <label className="field">
            <span>Sınav tarihi</span>
            <input
              className="input"
              type="date"
              value={profile.examDate}
              onChange={(e) => update((s) => updateProfile(s, { examDate: isValidDayKey(e.target.value) ? e.target.value : '' }))}
            />
          </label>
        </div>
      </section>

      <section className="card section" aria-labelledby="pom-h">
        <h2 id="pom-h" className="mb-8">
          Pomodoro
        </h2>
        <div className="form-grid two">
          <label className="field">
            <span>Odak süresi (dk)</span>
            <input className="input" type="number" min={5} max={120} value={settings.focusMinutes} onChange={(e) => update((s) => updateSettings(s, { focusMinutes: Math.min(120, Math.max(5, Number(e.target.value) || 25)) }))} />
          </label>
          <label className="field">
            <span>Kısa mola (dk)</span>
            <input className="input" type="number" min={1} max={60} value={settings.breakMinutes} onChange={(e) => update((s) => updateSettings(s, { breakMinutes: Math.min(60, Math.max(1, Number(e.target.value) || 5)) }))} />
          </label>
          <label className="field">
            <span>Uzun mola (dk)</span>
            <input className="input" type="number" min={1} max={90} value={settings.longBreakMinutes} onChange={(e) => update((s) => updateSettings(s, { longBreakMinutes: Math.min(90, Math.max(1, Number(e.target.value) || 15)) }))} />
          </label>
          <label className="field">
            <span>Kaç odaktan sonra uzun mola</span>
            <input className="input" type="number" min={1} max={10} value={settings.cyclesBeforeLongBreak} onChange={(e) => update((s) => updateSettings(s, { cyclesBeforeLongBreak: Math.min(10, Math.max(1, Number(e.target.value) || 4)) }))} />
          </label>
        </div>
      </section>

      <section className="card section" aria-labelledby="t-h">
        <h2 id="t-h" className="mb-8">
          Asistan
        </h2>
        <div className="teacher">
          <AssistantCharacter size={110} mood="happy" />
          <div className="grow">
            <label className="field">
              <span>Asistan adı</span>
              <input className="input" value={settings.teacherName} maxLength={40} onChange={(e) => update((s) => updateSettings(s, { teacherName: e.target.value || 'Asistanın' }))} />
            </label>
          </div>
        </div>
        <div className="row mt-12">
          <label className="btn small">
            Farklı yüz fotoğrafı yükle
            <input ref={photoRef} type="file" accept="image/*" hidden disabled={busy} onChange={(e) => e.target.files?.[0] && void uploadPhoto(e.target.files[0])} />
          </label>
          <button type="button" className="btn small ghost" onClick={() => void setTeacherPhoto(null).then(() => toast('Fotoğraf kaldırıldı.'))}>
            Varsayılan yüze dön
          </button>
        </div>
        <label className="field mt-12">
          <span>Fotoğraf dikey konumu</span>
          <input
            className="input"
            type="range"
            min={0}
            max={100}
            value={settings.teacherPhotoFocusY}
            onChange={(e) => update((s) => updateSettings(s, { teacherPhotoFocusY: Number(e.target.value) }))}
          />
        </label>
      </section>

      <section className="card section" aria-labelledby="d-h">
        <h2 id="d-h" className="mb-8">
          Veri
        </h2>
        <p className="small muted">Tüm verilerin bu cihazda saklanır. JSON olarak dışa aktarabilir, başka cihazda içe aktarabilirsin.</p>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => void exportData()} disabled={busy}>
            Veriyi dışa aktar
          </button>
          <label className="btn">
            İçe aktar
            <input ref={fileRef} type="file" accept="application/json" hidden disabled={busy} onChange={(e) => e.target.files?.[0] && void importData(e.target.files[0])} />
          </label>
          <button type="button" className="btn danger" onClick={() => setResetConfirm(true)}>
            Tüm verileri sıfırla
          </button>
        </div>
      </section>

      {resetConfirm && (
        <ConfirmDialog
          title="Tüm veriler silinsin mi?"
          message="Bu işlem geri alınamaz. Önce yedek almanı öneririz."
          confirmLabel="Sıfırla"
          danger
          onCancel={() => setResetConfirm(false)}
          onConfirm={() => {
            localStorage.clear();
            location.reload();
          }}
        />
      )}
    </>
  );
}
