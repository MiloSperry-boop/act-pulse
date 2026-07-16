import { describe, it, expect } from 'vitest';
import {
  buildSession,
  buildDiagnostic,
  questionCountForMinutes,
} from './session';
import { mulberry32 } from './rng';
import { getApprovedQuestions } from '../content/questionBank';
import type { SelectionContext } from './selection';

function ctx(includeScience = true): SelectionContext {
  return {
    skillStates: new Map(),
    reviewItemsBySkill: new Map(),
    blueprintGap: new Map(),
    seenQuestionIds: new Set(),
    now: '2026-07-16T10:00:00.000Z',
    includeScience,
  };
}

describe('session composition', () => {
  const bank = getApprovedQuestions();

  it('maps durations to sensible question counts', () => {
    expect(questionCountForMinutes(5)).toBeLessThanOrEqual(7);
    expect(questionCountForMinutes(10)).toBeGreaterThanOrEqual(9);
    expect(questionCountForMinutes(20)).toBeGreaterThanOrEqual(17);
  });

  it('builds a mixed adaptive daily session', () => {
    const plan = buildSession(
      { mode: 'daily', targetDurationMin: 10, includeScience: true },
      bank,
      ctx(),
      mulberry32(1),
    );
    expect(plan.questionIds.length).toBeGreaterThan(0);
    expect(new Set(plan.questionIds).size).toBe(plan.questionIds.length);
  });

  it('comma clinic only draws comma questions', () => {
    const plan = buildSession(
      { mode: 'comma_clinic', targetDurationMin: 10, includeScience: true },
      bank,
      ctx(),
      mulberry32(3),
    );
    const byId = new Map(bank.map((q) => [q.id, q]));
    for (const id of plan.questionIds) {
      expect(byId.get(id)!.microSkill.startsWith('eng.comma')).toBe(true);
    }
  });

  it('late-section math only draws difficulty 4+ math', () => {
    const plan = buildSession(
      { mode: 'late_math', targetDurationMin: 15, includeScience: true },
      bank,
      ctx(),
      mulberry32(5),
    );
    const byId = new Map(bank.map((q) => [q.id, q]));
    for (const id of plan.questionIds) {
      const q = byId.get(id)!;
      expect(q.section).toBe('math');
      expect(q.difficulty).toBeGreaterThanOrEqual(4);
    }
  });

  it('diagnostic spans multiple sections and drops science when disabled', () => {
    const withSci = buildDiagnostic(bank, true, mulberry32(2));
    const noSci = buildDiagnostic(bank, false, mulberry32(2));
    const byId = new Map(bank.map((q) => [q.id, q]));
    expect(withSci.some((id) => byId.get(id)!.section === 'science')).toBe(true);
    expect(noSci.every((id) => byId.get(id)!.section !== 'science')).toBe(true);
  });
});
