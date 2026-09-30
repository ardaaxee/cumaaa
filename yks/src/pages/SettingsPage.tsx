import { useRef, useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import type { SubjectId } from '../domain/types';
import { AssistantCharacter } from '../components/AssistantCharacter';
import { ConnectSettings } from '../components/ConnectSettings';
import { CompanionToggle } from '../components/Companion';
import { PageHeader } from '../components/Layout';
import { ConfirmDialog, toast } from '../components/ui';
import { getPageImageStrict } from '../services/notebookStore';
import { getTeacherPhoto } from '../services/photoStore';
import { restoreBackupFile } from '../services/backup';
import { AppInfo } from '../components/AppInfo';
import { updateProfile, updateSettings } from '../store/actions';
import { clearAppData, createBackup } from '../store/storage';
import { update, useAppState } from '../store/store';
import { dayKey, isValidDayKey } from '../utils/date';

export default function SettingsPage() {
  const state = useAppState();
  const { profile, settings } = state;
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);
  const [pendingImport, setPendingImport] = useState<File | null>(null);

  const exportData = async () => {
    setBusy(true);
    try {
      const photo = await getTeacherPhoto();
      const notebookEntries = await Promise.all(
        state.notebookPages.map(async (page) => [page.id, await getPageImageStrict(page.id)] as const),
      );
      const notebookImages = Object.fromEntries(
        notebookEntries.filter((entry): entry is readonly [string, string] => typeof entry[1] === 'string'),
      );
      const backup = createBackup(state, photo, notebookImages);
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `iyi-ki-yks-yedek-${dayKey()}.json`;
      a.click();
      window.setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      toast(`Yedek indirildi · ${Object.keys(notebookImages).length} defter çizimi dahil.`);
    } catch {
      toast('Yedek hazırlanamadı. Cihaz depolamasını kontrol edip tekrar dene.');
    } finally {
      setBusy(false);
    }
  };

  const importData = async (file: File) => {
    setBusy(true);
    try {
      const { report, restoredDrawings } = await restoreBackupFile(file);
      toast(
        report.notes.length
          ? `Yedek içe aktarıldı. ${report.notes[0]}`
          : `Yedek içe aktarıldı${restoredDrawings ? ` · ${restoredDrawings} defter çizimi geri yüklendi` : ''}.`,
        5000,
      );
    } catch (e) {
      toast(e instanceof Error ? e.message : 'Geçersiz yedek dosyası.');
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };



  return (
    <>
      <PageHeader title="Ayarlar" />

      <AppInfo />

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
            <span>Hedef üniversite</span>
            <input
              className="input"
              value={profile.targetUniversity}
              maxLength={80}
              placeholder="Örn. Hacettepe Üniversitesi"
              onChange={(e) => update((s) => updateProfile(s, { targetUniversity: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>Hedef bölüm</span>
            <input
              className="input"
              value={profile.targetDepartment}
              maxLength={80}
              placeholder="Örn. Bilgisayar Mühendisliği"
              onChange={(e) => update((s) => updateProfile(s, { targetDepartment: e.target.value }))}
            />
          </label>
          <label className="field">
            <span>Tercih ettiğin çalışma başlangıcı</span>
            <input
              className="input"
              type="time"
              value={profile.preferredStudyTime}
              onChange={(e) => update((s) => updateProfile(s, { preferredStudyTime: e.target.value }))}
            />
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

      <section className="card section" aria-labelledby="t-h">
        <h2 id="t-h" className="mb-8">
          Asistan
        </h2>
        <div className="teacher">
          <AssistantCharacter size={110} mood="happy" />
          <div className="grow">
            <label className="field">
              <span>Asistan adı</span>
              <input className="input" value={settings.teacherName} maxLength={40} onChange={(e) => update((s) => updateSettings(s, { teacherName: e.target.value || 'Cuma' }))} />
            </label>
          </div>
        </div>
        <CompanionToggle />
      </section>

      <ConnectSettings />

      <section className="card section" aria-labelledby="d-h">
        <h2 id="d-h" className="mb-8">
          Veri
        </h2>
        <p className="small muted">
          Profil, test geçmişi, plan, Panda durumu, öğretmen fotoğrafı ve dijital defter çizimleri dahil YKS verilerini tek yedek dosyasına alabilirsin.
        </p>
        <div className="row">
          <button type="button" className="btn primary" onClick={() => void exportData()} disabled={busy}>
            Veriyi dışa aktar
          </button>
          <label className="btn">
            İçe aktar
            <input ref={fileRef} type="file" accept="application/json,.json" hidden disabled={busy} onChange={(e) => setPendingImport(e.target.files?.[0] ?? null)} />
          </label>
          <button type="button" className="btn danger" disabled={busy} onClick={() => setResetConfirm(true)}>
            Tüm verileri sıfırla
          </button>
        </div>
      </section>

      {pendingImport && (
        <ConfirmDialog
          title="Yedek geri yüklensin mi?"
          message={`${pendingImport.name} dosyasındaki profil, plan ve kayıtlar mevcut verilerinin yerini alacak. Önce mevcut verilerini dışa aktarabilirsin.`}
          confirmLabel="Yedeği geri yükle"
          onCancel={() => { setPendingImport(null); if (fileRef.current) fileRef.current.value = ''; }}
          onConfirm={() => { const file = pendingImport; setPendingImport(null); void importData(file); }}
        />
      )}

      {resetConfirm && (
        <ConfirmDialog
          title="Tüm veriler silinsin mi?"
          message="Bu işlem geri alınamaz. Önce yedek almanı öneririz."
          confirmLabel="Sıfırla"
          danger
          onCancel={() => setResetConfirm(false)}
          onConfirm={() => {
            setResetConfirm(false);
            void clearAppData().finally(() => location.reload());
          }}
        />
      )}
    </>
  );
}
