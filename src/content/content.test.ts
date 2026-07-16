import { describe, it, expect } from 'vitest';
import { getAllQuestions, getContentStats, getAllPassages } from './questionBank';
import { validateAll } from './validate';
import { ACTQuestionSchema } from '../data/questionSchema';

describe('question bank content', () => {
  const all = getAllQuestions();

  it('every question passes full validation', () => {
    const issues = validateAll(all);
    expect(issues, JSON.stringify(issues, null, 2)).toHaveLength(0);
  });

  it('every question is schema-valid with exactly four choices', () => {
    for (const q of all) {
      const parsed = ACTQuestionSchema.safeParse(q);
      expect(parsed.success, `${q.id} failed schema`).toBe(true);
      expect(q.choices).toHaveLength(4);
    }
  });

  it('no calculator questions leak into non-math sections', () => {
    for (const q of all) {
      if (q.section !== 'math') expect(q.calculatorAllowed).toBe(false);
    }
  });

  it('every passage-based question references a resolvable passage', () => {
    const passageIds = new Set(getAllPassages().map((p) => p.id));
    for (const q of all) {
      if (q.passageId) expect(passageIds.has(q.passageId)).toBe(true);
    }
  });

  it('has meaningful coverage across all four sections', () => {
    const stats = getContentStats();
    expect(stats.bySection.english ?? 0).toBeGreaterThanOrEqual(15);
    expect(stats.bySection.math ?? 0).toBeGreaterThanOrEqual(15);
    expect(stats.bySection.reading ?? 0).toBeGreaterThanOrEqual(8);
    expect(stats.bySection.science ?? 0).toBeGreaterThanOrEqual(8);
  });

  it('has no duplicate question ids', () => {
    const ids = all.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('ships original passages across required kinds', () => {
    const kinds = new Set(getAllPassages().map((p) => p.kind));
    expect(kinds.has('literary_narrative')).toBe(true);
    expect(kinds.has('natural_science')).toBe(true);
    expect(kinds.has('science_conflicting')).toBe(true);
  });
});
