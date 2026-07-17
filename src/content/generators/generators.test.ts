import { describe, it, expect } from 'vitest';
import { ACTQuestionSchema } from '../../data/questionSchema';
import { generateMatrixBatch, generateMatrixQuestion } from './matrix';
import { generateSvaBatch, generateSvaQuestion } from './subjectVerb';
import { generateMathCoreBatch } from './mathCore';
import { validateQuestion } from '../validate';

describe('procedural generators', () => {
  it('matrix generator produces schema-valid, unambiguous questions', () => {
    const batch = generateMatrixBatch('test-matrix', 30);
    for (const q of batch) {
      expect(ACTQuestionSchema.safeParse(q).success).toBe(true);
      // exactly one correct id, present in choices
      expect(q.choices.map((c) => c.id)).toContain(q.correctChoiceId);
      // no duplicate choice text
      const texts = q.choices.map((c) => c.text);
      expect(new Set(texts).size).toBe(texts.length);
      // calculator allowed (math)
      expect(q.calculatorAllowed).toBe(true);
    }
  });

  it('matrix generator is deterministic for a fixed seed', () => {
    const a = generateMatrixQuestion('same-seed');
    const b = generateMatrixQuestion('same-seed');
    expect(a).toEqual(b);
  });

  it('SVA generator produces valid questions across difficulty levels', () => {
    const batch = generateSvaBatch('test-sva', 30);
    for (const q of batch) {
      const issues = validateQuestion(q);
      expect(issues, JSON.stringify(issues)).toHaveLength(0);
      expect(q.section).toBe('english');
      expect(q.calculatorAllowed).toBe(false);
    }
  });

  it('SVA questions include the correct answer among the choices', () => {
    const q = generateSvaQuestion('sva-1');
    const correct = q.choices.find((c) => c.id === q.correctChoiceId);
    expect(correct).toBeDefined();
  });

  it('SVA correct answers are always verbs compatible with the predicate', () => {
    // Regression: action/auxiliary verbs like "has"/"runs" once produced
    // ungrammatical sentences ("the series of files has stored in the attic").
    const allowed = new Set(['is', 'are', 'was', 'were', 'seems', 'seem']);
    for (let i = 0; i < 60; i++) {
      const q = generateSvaQuestion(`compat:${i}`);
      const correct = q.choices.find((c) => c.id === q.correctChoiceId)!;
      expect(allowed.has(correct.text), `"${correct.text}" in ${q.prompt}`).toBe(
        true,
      );
    }
  });

  it('math core generator produces valid questions with real distractors', () => {
    const batch = generateMathCoreBatch('test-math', 40);
    for (const q of batch) {
      expect(validateQuestion(q)).toHaveLength(0);
      // every distractor has an explanation
      for (const c of q.choices) {
        if (c.id !== q.correctChoiceId) {
          expect(q.distractorExplanations[c.id]).toBeTruthy();
        }
      }
    }
  });

  it('generates the requested batch size with unique ids', () => {
    const batch = generateMathCoreBatch('unique', 25);
    const ids = batch.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(batch.length).toBe(25);
  });
});
