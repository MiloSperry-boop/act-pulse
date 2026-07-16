import { describe, it, expect } from 'vitest';
import { applyAttempt, createSkillState, type AttemptEvidence } from './adaptiveEngine';
import { adjustDifficulty, classifyStatus, diagnoseWeaknessTypes } from './weakness';

function feed(
  skillId: string,
  section: 'english' | 'math' | 'reading' | 'science',
  results: Partial<AttemptEvidence>[],
) {
  let s = createSkillState(skillId, section);
  let t = Date.parse('2026-07-10T10:00:00.000Z');
  for (const r of results) {
    s = applyAttempt(s, {
      correct: true,
      difficulty: 3,
      responseTimeMs: 30000,
      hintsUsed: [],
      confidence: 'unsure',
      isReview: false,
      reviewIntervalDays: null,
      at: new Date(t).toISOString(),
      ...r,
    });
    t += 3600_000; // +1h between attempts by default
  }
  return s;
}

describe('weakness detection', () => {
  it('insufficient data below 3 attempts', () => {
    const s = feed('eng.comma.intro', 'english', [{ correct: true }, { correct: false }]);
    expect(classifyStatus(s)).toBe('insufficient_data');
  });

  it('classifies a durable, multi-day, high-accuracy skill as mastered', () => {
    const days = [
      '2026-07-10T10:00:00.000Z',
      '2026-07-11T10:00:00.000Z',
      '2026-07-12T10:00:00.000Z',
      '2026-07-13T10:00:00.000Z',
    ];
    let s = createSkillState('math.alg.linear', 'math');
    // 10 correct spread across 4 days, including difficulty 4.
    for (let i = 0; i < 10; i++) {
      s = applyAttempt(s, {
        correct: true,
        difficulty: i % 3 === 0 ? 4 : 3,
        responseTimeMs: 25000,
        hintsUsed: [],
        confidence: 'confident',
        isReview: i > 5,
        reviewIntervalDays: i > 5 ? 1 : null,
        at: days[i % days.length],
      });
    }
    expect(classifyStatus(s)).toBe('mastered');
  });

  it('flags a consistently low-accuracy skill as a confirmed weakness', () => {
    const results = Array.from({ length: 8 }, (_, i) => ({
      correct: i % 4 === 0, // 25% accuracy
      difficulty: 3,
      at: `2026-07-1${i % 3}T10:00:00.000Z`,
    }));
    const s = feed('eng.usage.sva.intervening', 'english', results);
    expect(classifyStatus(s)).toBe('confirmed');
  });

  it('diagnoses a speed gap when accurate but slow', () => {
    const s = feed(
      'math.alg.linear',
      'math',
      Array.from({ length: 6 }, () => ({
        correct: true,
        responseTimeMs: 120000, // way over the 45s expected default
      })),
    );
    const types = diagnoseWeaknessTypes(s);
    expect(types).toContain('speed_gap');
  });

  it('diagnoses a careless-error pattern on fast, confident misses', () => {
    const s = feed('eng.comma.unnecessary', 'english', [
      { correct: true, confidence: 'confident', responseTimeMs: 12000 },
      { correct: true, confidence: 'confident', responseTimeMs: 12000 },
      { correct: false, confidence: 'confident', responseTimeMs: 9000 },
      { correct: true, confidence: 'confident', responseTimeMs: 12000 },
    ]);
    const types = diagnoseWeaknessTypes(s);
    expect(types).toContain('careless_error_pattern');
  });

  it('raises difficulty after a strong independent streak', () => {
    const s = feed(
      'math.alg.linear',
      'math',
      Array.from({ length: 5 }, () => ({
        correct: true,
        responseTimeMs: 20000,
      })),
    );
    expect(adjustDifficulty(s)).toBeGreaterThanOrEqual(s.currentDifficulty);
  });

  it('lowers difficulty after mostly-wrong recent answers', () => {
    let s = createSkillState('math.fn.composition', 'math');
    s.currentDifficulty = 4;
    s = feed(
      'math.fn.composition',
      'math',
      Array.from({ length: 5 }, () => ({ correct: false })),
    );
    s.currentDifficulty = 4;
    expect(adjustDifficulty(s)).toBeLessThan(4);
  });
});
