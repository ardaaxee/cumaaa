import { useState } from 'react';
import { SUBJECTS, subjectLabel } from '../data/curriculum';
import type { SubjectId } from '../domain/types';
import { lookup } from '../services/lookup';
import { generateStarterPlan } from '../services/planGenerator';
import { toast } from '../components/ui';
import { addTask, updateProfile } from '../store/actions';
import { getState, update } from '../store/store';
import { dayKey, isValidDayKey } from '../utils/date';
import { navigate } from '../hooks/useRoute';

const STEPS = ['Adın', 'Sınıf ve alan', 'Hedef okul', 'Hedefler', 'Sınav tarihi'] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('12. sınıf');
  const [field, setField] = useState('Sayısal');
  const [hardest, setHardest] = useState<SubjectId | ''>('');
  const [targetUniversity, setTargetUniversity] = useState('');
  const [targetDepartment, setTargetDepartment] = useState('');
  const [preferredStudyTime, setPreferredStudyTime] = useState('');
  const [dailyQuestionGoal, setDailyQuestionGoal] = useState(60);
  const [dailyStudyMinutes, setDailyStudyMinutes] = useState(180);
  const [tytTarget, setTytTarget] = useState('');
  const [aytTarget, setAytTarget] = useState('');
  const [examDate, setExamDate] = useState('');

  const finish = () => {
    const profilePatch = {
      name: name.trim().slice(0, 40),
      grade,
      field,
      hardestSubject: hardest,
      targetUniversity: targetUniversity.trim().slice(0, 80),
      targetDepartment: targetDepartment.trim().slice(0, 80),
      preferredStudyTime,
      dailyQuestionGoal: Math.max(1, dailyQuestionGoal),
      dailyStudyMinutes: Math.max(10, dailyStudyMinutes),
      tytTarget: tytTarget ? Number(tytTarget) : null,
      aytTarget: aytTarget ? Number(aytTarget) : null,
      examDate: isValidDayKey(examDate) ? examDate : '',
      onboarded: true,
    };
    update((s) => updateProfile(s, profilePatch));
    const today = dayKey();
    const tasks = generateStarterPlan({ ...getState().profile, ...profilePatch }, getState().topicProgress, lookup, today);
    update((s) => tasks.reduce((st, t) => addTask(st, t), s));
    toast('Hoş geldin! Şimdi kısa seviye tespitiyle planını kişiselleştirelim. ♡', 4500);
    navigate('/koc');
  };

  const next = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const back = () => setStep((s) => Math.max(0, s - 1));

  return (
    <div className="onboarding-shell">
      <aside className="onboarding-intro" aria-label="İyi ki YKS">
        <div className="onboarding-logo">♡</div>
        <div className="eyebrow">İyi ki • YKS</div>
        <h1>Sana ait bir çalışma odası.</h1>
        <p>Planın, derslerin, tekrarların ve ilerlemen tek yerde. İlk kurulumu bitirince kısa seviye tespiti ve kişisel 7 günlük çalışma rotası hazırlayacağız.</p>
        <div className="onboarding-benefits" aria-label="Özellikler">
          <span>✓ TYT + AYT Sayısal</span>
          <span>✓ Adaptif kişisel plan</span>
          <span>✓ Konu + soru + tekrar</span>
        </div>
      </aside>

      <div className="card onboarding-card">
        <div className="onboarding-card-head">
          <div>
            <div className="eyebrow">Kişisel kurulum</div>
            <h2>Hoş geldin <span className="heart">♡</span></h2>
            <p className="muted">Sadece birkaç adım. Sonra doğrudan çalışmaya başlayabilirsin.</p>
          </div>
          <span className="onboarding-step-count">{step + 1}/{STEPS.length}</span>
        </div>

        <div className="onboarding-steps" aria-label="Kurulum adımları">
          {STEPS.map((label, i) => (
            <div key={label} className={`onboarding-step${i === step ? ' current' : ''}${i < step ? ' done' : ''}`}>
              <span>{i < step ? '✓' : i + 1}</span>
              <small>{label}</small>
            </div>
          ))}
        </div>

        <div className="progress onboarding-progress" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length} aria-label="Adım">
          <span style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>

        <form
        className="stack"
        onSubmit={(e) => {
          e.preventDefault();
          if (step < STEPS.length - 1) next();
          else finish();
        }}
      >
        {step === 0 && (
          <label className="field">
            <span>Adın</span>
            <input className="input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Nasıl seslenelim?" />
          </label>
        )}
        {step === 1 && (
          <div className="form-grid two">
            <label className="field">
              <span>Sınıfın</span>
              <input className="input" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </label>
            <label className="field">
              <span>Alanın</span>
              <input className="input" value={field} onChange={(e) => setField(e.target.value)} />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>En zorlandığın ders</span>
              <select className="select" value={hardest} onChange={(e) => setHardest(e.target.value as SubjectId | '')}>
                <option value="">Belirtmek istemiyorum</option>
                {SUBJECTS.map((s) => (
                  <option key={s.id} value={s.id}>
                    {subjectLabel(s)}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="form-grid two">
            <label className="field">
              <span>Hedef üniversite (isteğe bağlı)</span>
              <input className="input" value={targetUniversity} maxLength={80} onChange={(e) => setTargetUniversity(e.target.value)} placeholder="Örn. Hacettepe Üniversitesi" />
            </label>
            <label className="field">
              <span>Hedef bölüm (isteğe bağlı)</span>
              <input className="input" value={targetDepartment} maxLength={80} onChange={(e) => setTargetDepartment(e.target.value)} placeholder="Örn. Tıp" />
            </label>
            <label className="field" style={{ gridColumn: '1 / -1' }}>
              <span>Çalışmaya en rahat başladığın saat</span>
              <input className="input" type="time" value={preferredStudyTime} onChange={(e) => setPreferredStudyTime(e.target.value)} />
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="form-grid two">
            <label className="field">
              <span>Günlük soru hedefin</span>
              <input className="input" type="number" min={5} max={500} value={dailyQuestionGoal} onChange={(e) => setDailyQuestionGoal(Number(e.target.value) || 0)} />
            </label>
            <label className="field">
              <span>Günlük çalışma süren (dk)</span>
              <input className="input" type="number" min={10} max={900} value={dailyStudyMinutes} onChange={(e) => setDailyStudyMinutes(Number(e.target.value) || 0)} />
            </label>
            <label className="field">
              <span>TYT hedef net (isteğe bağlı)</span>
              <input className="input" type="number" min={0} max={120} value={tytTarget} onChange={(e) => setTytTarget(e.target.value)} />
            </label>
            <label className="field">
              <span>AYT hedef net (isteğe bağlı)</span>
              <input className="input" type="number" min={0} max={80} value={aytTarget} onChange={(e) => setAytTarget(e.target.value)} />
            </label>
          </div>
        )}
        {step === 4 && (
          <label className="field">
            <span>Sınav tarihin (isteğe bağlı)</span>
            <input className="input" type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            <span className="field-hint">Bu bilgiyle günlerini geri sayabiliriz. İstersen boş bırak.</span>
          </label>
        )}

        <div className="row mt-12">
          {step > 0 && (
            <button type="button" className="btn" onClick={back}>
              Geri
            </button>
          )}
          <button type="submit" className="btn primary block" disabled={step === 0 && !name.trim()}>
            {step < STEPS.length - 1 ? 'Devam et' : 'Profilimi oluştur'}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
