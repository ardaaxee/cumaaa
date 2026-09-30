import type { Profile } from '../store/schema';

function bounded(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
}

export function normalizeProfile(previous: Profile, patch: Partial<Profile>): Profile {
  const profile = { ...previous, ...patch };
  return {
    ...profile,
    name: typeof profile.name === 'string' ? profile.name.slice(0, 40) : previous.name,
    grade: typeof profile.grade === 'string' ? profile.grade.slice(0, 30) : previous.grade,
    field: typeof profile.field === 'string' ? profile.field.slice(0, 30) : previous.field,
    targetUniversity: typeof profile.targetUniversity === 'string' ? profile.targetUniversity.slice(0, 80) : previous.targetUniversity,
    targetDepartment: typeof profile.targetDepartment === 'string' ? profile.targetDepartment.slice(0, 80) : previous.targetDepartment,
    preferredStudyTime: typeof profile.preferredStudyTime === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(profile.preferredStudyTime) ? profile.preferredStudyTime : '',
    dailyQuestionGoal: Math.round(bounded(profile.dailyQuestionGoal, 1, 500, previous.dailyQuestionGoal)),
    dailyStudyMinutes: Math.round(bounded(profile.dailyStudyMinutes, 10, 900, previous.dailyStudyMinutes)),
    tytTarget: profile.tytTarget == null ? null : bounded(profile.tytTarget, 0, 120, previous.tytTarget ?? 0),
    aytTarget: profile.aytTarget == null ? null : bounded(profile.aytTarget, 0, 80, previous.aytTarget ?? 0),
  };
}
