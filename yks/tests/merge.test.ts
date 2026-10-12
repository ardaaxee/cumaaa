import { describe, expect, it } from 'vitest';
import { mergeStates } from '../src/store/merge';
import { defaultState, type AppState } from '../src/store/schema';
import { addMock, deleteMock, gradeCard } from '../src/store/actions';

const mock = (s: AppState, name: string) => addMock(s, { exam: 'TYT', name, date: '2026-09-28', sections: [] });

describe('bulut birleştirme', () => {
  it('keeps records from both devices', () => {
    const a = mock(defaultState(), 'A');
    const b = mock(defaultState(), 'B');
    const m = mergeStates({ local: a, localChangedAt: '2026-09-28T10:00:00Z', remote: b, remoteChangedAt: '2026-09-28T11:00:00Z' });
    expect(m.mocks.map((x) => x.name).sort()).toEqual(['A', 'B']);
  });

  it('does not resurrect a deleted record', () => {
    const shared = mock(defaultState(), 'A');
    const localDeleted = deleteMock(shared, shared.mocks[0].id);
    const m = mergeStates({ local: localDeleted, localChangedAt: '2026-09-28T12:00:00Z', remote: shared, remoteChangedAt: '2026-09-28T11:00:00Z' });
    expect(m.mocks).toHaveLength(0);
  });

  it('takes the newer card progress and keeps local cloud settings', () => {
    const older = gradeCard(defaultState(), 'c1', 'biliyorum', '2026-09-20');
    const newer = gradeCard(defaultState(), 'c1', 'bilmiyorum', '2026-09-28');
    const local = { ...older, settings: { ...older.settings, cloud: { projectId: 'p', apiKey: 'k', syncCode: 'x'.repeat(24), shareCode: '' } } };
    const m = mergeStates({ local, localChangedAt: '2026-09-28T10:00:00Z', remote: newer, remoteChangedAt: '2026-09-28T11:00:00Z' });
    expect(m.cards.c1.box).toBe(1);
    expect(m.settings.cloud.projectId).toBe('p');
  });
});
