import type { ACTQuestion, Difficulty } from '../../data/questionSchema';
import { SKILL_BY_ID } from '../../config/skills';

export interface AuthoredInput {
  id: string;
  section: ACTQuestion['section'];
  microSkill: string;
  difficulty: Difficulty;
  expectedSeconds: number;
  format?: ACTQuestion['format'];
  passageId?: string;
  stimulus?: ACTQuestion['stimulus'];
  prompt: string;
  /** choices as [text, ...] with the FIRST entry being the correct answer. */
  correct: string;
  choices: string[]; // include the correct text somewhere
  explanation: string;
  distractors: Record<string, string>; // keyed by choice TEXT
  conceptSummary: string;
  strategyTip?: string;
  hints?: ACTQuestion['hints'];
  secondarySkills?: string[];
  tags?: string[];
  calculatorAllowed?: boolean;
}

const IDS = ['A', 'B', 'C', 'D'];

/**
 * Author a fixed question. Choice order is preserved as given (authored
 * questions are hand-ordered, often with NO CHANGE first). Distractor
 * explanations are keyed by choice text for readability.
 */
export function authored(input: AuthoredInput): ACTQuestion {
  const skill = SKILL_BY_ID[input.microSkill];
  if (!skill) {
    throw new Error(`Authored question ${input.id}: unknown skill ${input.microSkill}`);
  }
  if (input.choices.length !== 4) {
    throw new Error(`Authored question ${input.id}: needs exactly 4 choices`);
  }
  const correctIndex = input.choices.indexOf(input.correct);
  if (correctIndex === -1) {
    throw new Error(
      `Authored question ${input.id}: correct text not among choices`,
    );
  }
  const choices = input.choices.map((text, i) => ({ id: IDS[i], text }));
  const correctChoiceId = IDS[correctIndex];
  const distractorExplanations: Record<string, string> = {};
  for (const c of choices) {
    if (c.id !== correctChoiceId) {
      const exp = input.distractors[c.text];
      distractorExplanations[c.id] =
        exp ?? 'This option does not best satisfy the requirement of the question.';
    }
  }

  return {
    id: input.id,
    version: 1,
    blueprintVersion: 'act-enhanced-2026',
    section: input.section,
    officialCategory: skill.categoryId,
    subskill: skill.subcategory,
    microSkill: input.microSkill,
    secondarySkills: input.secondarySkills ?? [],
    difficulty: input.difficulty,
    expectedSeconds: input.expectedSeconds,
    format: input.format ?? 'multiple_choice',
    passageId: input.passageId,
    stimulus: input.stimulus,
    prompt: input.prompt,
    choices,
    correctChoiceId,
    explanation: input.explanation,
    distractorExplanations,
    conceptSummary: input.conceptSummary,
    strategyTip: input.strategyTip,
    hints: input.hints ?? [],
    prerequisites: [],
    calculatorAllowed: input.calculatorAllowed ?? input.section === 'math',
    sourceType: 'original_authored',
    validationStatus: 'approved',
    tags: input.tags ?? [],
  };
}
