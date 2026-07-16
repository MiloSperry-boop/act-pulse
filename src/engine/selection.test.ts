import { describe, it, expect } from 'vitest';
import {
  reviewDueWeight,
  uncertaintyWeight,
  weaknessWeight,
  selectQuestions,
  type SelectionContext,
} from './selection';
import { createSkillState } from './adaptiveEngine';
import { mulberry32 } from './rng';
import { getApprovedQuestions } from '../content/questionBank';

function emptyCtx(now = '2026-07-16T10:00:00.000Z'): SelectionContext {
  return {
    skillStates: new Map(),
    reviewItemsBySkill: new Map(),
    blueprintGap: new Map(),
    seenQuestionIds: new Set(),
    now,
    includeScience: true,
  };
}

describe('selection weights', () => {
  it('weaknessWeight is higher for a low-mastery confirmed weakness', () => {
    const weak = createSkillState('eng.comma.intro', 'english');
    weak.alpha = 2;
    weak.beta = 8;
    weak.weaknessStatus = 'confirmed';
    const strong = createSkillState('eng.comma.intro', 'english');
    strong.alpha = 10;
    strong.beta = 2;
    strong.weaknessStatus = 'mastered';
    expect(weaknessWeight(weak)).toBeGreaterThan(weaknessWeight(strong));
  });

  it('uncertaintyWeight decreases with more attempts', () => {
    const fresh = createSkillState('x', 'math');
    const seasoned = createSkillState('x', 'math');
    seasoned.totalAttempts = 6;
    expect(uncertaintyWeight(fresh)).toBeGreaterThan(uncertaintyWeight(seasoned));
  });

  it('reviewDueWeight is zero with no scheduled items and positive when overdue', () => {
    expect(reviewDueWeight([], '2026-07-16T10:00:00.000Z')).toBe(0);
    const w = reviewDueWeight(
      [
        {
          skillId: 's',
          questionId: 'q',
          section: 'math',
          intervalIndex: 1,
          dueAt: '2026-07-14T10:00:00.000Z',
          lastReviewedAt: null,
          status: 'scheduled',
          retentionStrength: 0.3,
          createdAt: '2026-07-13T10:00:00.000Z',
        },
      ],
      '2026-07-16T10:00:00.000Z',
    );
    expect(w).toBeGreaterThan(0);
  });
});

describe('selectQuestions', () => {
  const bank = getApprovedQuestions();

  it('returns the requested number of unique questions', () => {
    const rng = mulberry32(42);
    const picks = selectQuestions(bank, emptyCtx(), 10, rng);
    expect(picks).toHaveLength(10);
    expect(new Set(picks.map((q) => q.id)).size).toBe(10);
  });

  it('excludes science when includeScience is false', () => {
    const ctx = emptyCtx();
    ctx.includeScience = false;
    const rng = mulberry32(7);
    const picks = selectQuestions(bank, ctx, 15, rng);
    expect(picks.every((q) => q.section !== 'science')).toBe(true);
  });

  it('avoids more than 3 consecutive questions from one micro-skill', () => {
    const rng = mulberry32(99);
    const picks = selectQuestions(bank, emptyCtx(), 20, rng, {
      maxPerSkillConsecutive: 3,
    });
    let run = 1;
    for (let i = 1; i < picks.length; i++) {
      run = picks[i].microSkill === picks[i - 1].microSkill ? run + 1 : 1;
      expect(run).toBeLessThanOrEqual(3);
    }
  });
});
