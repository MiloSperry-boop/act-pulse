import { describe, it, expect } from 'vitest';
import { ACTQuestionSchema, type ACTQuestion } from './questionSchema';

function base(): ACTQuestion {
  return {
    id: 'q.test',
    version: 1,
    blueprintVersion: 'act-enhanced-2026',
    section: 'english',
    officialCategory: 'eng.conventions',
    subskill: 'Punctuation',
    microSkill: 'eng.comma.intro',
    secondarySkills: [],
    difficulty: 2,
    expectedSeconds: 35,
    format: 'multiple_choice',
    prompt: 'Pick one.',
    choices: [
      { id: 'A', text: 'alpha' },
      { id: 'B', text: 'bravo' },
      { id: 'C', text: 'charlie' },
      { id: 'D', text: 'delta' },
    ],
    correctChoiceId: 'A',
    explanation: 'Because alpha is right.',
    distractorExplanations: { B: 'no', C: 'no', D: 'no' },
    conceptSummary: 'A rule.',
    hints: [],
    prerequisites: [],
    calculatorAllowed: false,
    sourceType: 'original_authored',
    validationStatus: 'approved',
    tags: [],
  };
}

describe('ACTQuestionSchema', () => {
  it('accepts a well-formed question', () => {
    expect(ACTQuestionSchema.safeParse(base()).success).toBe(true);
  });

  it('rejects a missing correct choice', () => {
    const q = { ...base(), correctChoiceId: 'Z' };
    expect(ACTQuestionSchema.safeParse(q).success).toBe(false);
  });

  it('rejects duplicate choice ids', () => {
    const q = base();
    q.choices[1].id = 'A';
    expect(ACTQuestionSchema.safeParse(q).success).toBe(false);
  });

  it('rejects duplicate choice text', () => {
    const q = base();
    q.choices[1].text = 'alpha';
    expect(ACTQuestionSchema.safeParse(q).success).toBe(false);
  });

  it('rejects a missing distractor explanation', () => {
    const q = base();
    delete (q.distractorExplanations as Record<string, string>).B;
    expect(ACTQuestionSchema.safeParse(q).success).toBe(false);
  });

  it('rejects calculator allowed outside math', () => {
    const q = { ...base(), calculatorAllowed: true };
    expect(ACTQuestionSchema.safeParse(q).success).toBe(false);
  });

  it('rejects fewer than four choices', () => {
    const q = base();
    q.choices = q.choices.slice(0, 3);
    expect(ACTQuestionSchema.safeParse(q).success).toBe(false);
  });

  it('requires a passageId for passage formats', () => {
    const q = { ...base(), format: 'passage_reading' as const, section: 'reading' as const };
    expect(ACTQuestionSchema.safeParse(q).success).toBe(false);
  });
});
