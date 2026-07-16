import { describe, it, expect } from 'vitest';
import {
  applyAttempt,
  createSkillState,
  evidenceWeight,
  masteryEstimate,
  predictedSuccess,
  strongestHint,
  type AttemptEvidence,
} from './adaptiveEngine';
import { classifyStatus } from './weakness';

function ev(partial: Partial<AttemptEvidence> = {}): AttemptEvidence {
  return {
    correct: true,
    difficulty: 3,
    responseTimeMs: 30000,
    hintsUsed: [],
    confidence: 'unsure',
    isReview: false,
    reviewIntervalDays: null,
    at: '2026-07-16T10:00:00.000Z',
    ...partial,
  };
}

describe('adaptiveEngine', () => {
  it('starts each skill at a neutral 0.5 mastery (alpha=beta=2)', () => {
    const s = createSkillState('eng.comma.intro', 'english');
    expect(masteryEstimate(s)).toBeCloseTo(0.5, 5);
    expect(s.alpha).toBe(2);
    expect(s.beta).toBe(2);
  });

  it('a correct answer increases mastery', () => {
    const s = createSkillState('eng.comma.intro', 'english');
    const next = applyAttempt(s, ev({ correct: true }));
    expect(masteryEstimate(next)).toBeGreaterThan(masteryEstimate(s));
    expect(next.correctAttempts).toBe(1);
    expect(next.independentCorrectAttempts).toBe(1);
  });

  it('an incorrect answer decreases mastery', () => {
    const s = createSkillState('eng.comma.intro', 'english');
    const next = applyAttempt(s, ev({ correct: false }));
    expect(masteryEstimate(next)).toBeLessThan(masteryEstimate(s));
  });

  it('one early mistake does NOT drive mastery to zero', () => {
    const s = createSkillState('eng.comma.intro', 'english');
    const next = applyAttempt(s, ev({ correct: false, difficulty: 3 }));
    expect(masteryEstimate(next)).toBeGreaterThan(0.2);
  });

  it('hints reduce the independent-evidence weight', () => {
    const s = createSkillState('math.nq.matrix.multiply', 'math');
    const noHint = evidenceWeight(ev({ hintsUsed: [] }), null);
    const withHint = evidenceWeight(
      ev({ hintsUsed: ['starting_step'] }),
      null,
    );
    expect(withHint).toBeLessThan(noHint);

    const hinted = applyAttempt(s, ev({ correct: true, hintsUsed: ['concept'] }));
    expect(hinted.independentCorrectAttempts).toBe(0);
    expect(hinted.hintedAttempts).toBe(1);
  });

  it('strongestHint picks the most helpful hint used', () => {
    expect(strongestHint([])).toBe('none');
    expect(strongestHint(['concept', 'partial_setup'])).toBe('partial_setup');
    expect(strongestHint(['concept'])).toBe('concept');
  });

  it('delayed correct reviews carry more retention weight than same-day', () => {
    const sameDay = evidenceWeight(
      ev({ isReview: true, reviewIntervalDays: 0 }),
      '2026-07-16T09:00:00.000Z',
    );
    const weekLater = evidenceWeight(
      ev({ isReview: true, reviewIntervalDays: 7 }),
      '2026-07-09T10:00:00.000Z',
    );
    expect(weekLater).toBeGreaterThan(sameDay);
  });

  it('builds retention strength on a delayed correct answer', () => {
    let s = createSkillState('eng.usage.sva.basic', 'english');
    s = { ...s, lastPracticedAt: '2026-07-13T10:00:00.000Z' };
    const next = applyAttempt(
      s,
      ev({ correct: true, at: '2026-07-16T10:00:00.000Z' }),
    );
    expect(next.retentionStrength).toBeGreaterThan(s.retentionStrength);
  });

  it('one miss does not confirm a weakness, but repeated misses do', () => {
    let s = createSkillState('eng.comma.intro', 'english');
    s = applyAttempt(s, ev({ correct: false }));
    s.weaknessStatus = classifyStatus(s);
    expect(s.weaknessStatus).not.toBe('confirmed');

    // Six misses across two days.
    const days = [
      '2026-07-15T10:00:00.000Z',
      '2026-07-15T11:00:00.000Z',
      '2026-07-15T12:00:00.000Z',
      '2026-07-16T10:00:00.000Z',
      '2026-07-16T11:00:00.000Z',
    ];
    for (const at of days) {
      s = applyAttempt(s, ev({ correct: false, at }));
    }
    s.weaknessStatus = classifyStatus(s);
    expect(['confirmed', 'possible']).toContain(s.weaknessStatus);
    expect(s.totalAttempts).toBeGreaterThanOrEqual(6);
  });

  it('predictedSuccess drops as difficulty rises above the working level', () => {
    const s = createSkillState('math.alg.linear', 'math');
    const easy = predictedSuccess(s, 1);
    const hard = predictedSuccess(s, 5);
    expect(easy).toBeGreaterThan(hard);
  });

  it('tracks slow-correct as lower speed mastery than fast-correct', () => {
    const s = createSkillState('math.alg.linear', 'math');
    const fast = applyAttempt(s, ev({ correct: true, responseTimeMs: 8000 }));
    const slow = applyAttempt(s, ev({ correct: true, responseTimeMs: 90000 }));
    expect(fast.speedMastery).toBeGreaterThan(slow.speedMastery);
  });
});
