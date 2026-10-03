import { describe, expect, it } from 'vitest';
import type { MockExam } from '../src/store/schema';
import { buildSections } from '../src/utils/mock';
import { mockInsights, mockSubjectLinks, mockTargetStatus } from '../src/utils/mockInsights';

function result(id: string, date: string, math: number, physics: number): MockExam {
  return { id, date, exam: 'AYT', name: id, createdAt: `${date}T12:00:00Z`, sections: buildSections('AYT', [
    { key: 'matematik', correct: math, wrong: 0 }, { key: 'fizik', correct: physics, wrong: 0 },
    { key: 'kimya', correct: 10, wrong: 0 }, { key: 'biyoloji', correct: 10, wrong: 0 },
  ]).sections };
}
describe('result-based mock report', () => {
  it('uses only preceding comparable results and normalizes priority by question count', () => {
    const first = result('first', '2026-10-01', 20, 10);
    const second = result('second', '2026-10-02', 24, 7);
    const future = result('future', '2026-10-03', 40, 14);
    const legacy = { ...first, id: 'legacy', sections: [{ key: 'genel', correct: 1, wrong: 0, blank: 79 }] };
    const report = mockInsights(second, [future, legacy, second, first]);
    expect(report.previous?.id).toBe('first');
    expect(report.delta).toBe(1);
    expect(report.average).toBe(50.5);
    expect(report.priority?.key).toBe('fizik');
    expect(report.history).toHaveLength(2);
  });
  it('does not invent a trend for one result or subject evidence for legacy totals', () => {
    const first = result('first', '2026-10-01', 20, 10);
    expect(mockInsights(first, [first]).delta).toBeNull();
    const legacy = { ...first, sections: [{ key: 'genel', correct: 1, wrong: 0, blank: 79 }] };
    expect(mockInsights(legacy, [legacy]).priority).toBeNull();
  });
  it('opens all subjects inside combined TYT sections', () => {
    expect(mockSubjectLinks('TYT', 'fen')).toEqual(['tyt-fizik', 'tyt-kimya', 'tyt-biyoloji']);
    expect(mockSubjectLinks('AYT', 'kimya')).toEqual(['ayt-kimya']);
  });
  it('rejects fractional, infinite, negative and overflowing counts instead of silently rounding', () => {
    for (const correct of [1.5, Infinity, -1, 41]) {
      expect(buildSections('AYT', [{ key: 'matematik', correct, wrong: 0 }]).errors.length).toBeGreaterThan(0);
    }
    expect(buildSections('AYT', [{ key: 'fizik', correct: 10, wrong: 5 }]).errors.length).toBeGreaterThan(0);
  });
});


describe('mock net targets', () => {
  it('handles negative nets, zero targets and exceeded targets without invalid progress', () => {
    expect(mockTargetStatus(-2, 40, 'AYT')).toEqual({ target: 40, gap: 42, reached: false, progress: 0 });
    expect(mockTargetStatus(-2, 0, 'AYT')?.reached).toBe(false);
    expect(mockTargetStatus(0, 0, 'AYT')?.progress).toBe(100);
    expect(mockTargetStatus(60, 50, 'AYT')).toEqual({ target: 50, gap: 0, reached: true, progress: 100 });
  });
  it('validates each exam limit and permits quarter-net goals', () => {
    for (const target of [null, Infinity, NaN, -1, 81]) expect(mockTargetStatus(30, target, 'AYT')).toBeNull();
    expect(mockTargetStatus(30, 100, 'TYT')?.gap).toBe(70);
    expect(mockTargetStatus(31, 40.25, 'AYT')?.gap).toBe(9.25);
  });
});
