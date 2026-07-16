/** Shared helpers for procedural question generators. */

import type {
  ACTQuestion,
  AnswerChoice,
  Difficulty,
  QuestionHint,
} from '../../data/questionSchema';
import { type RNG, shuffle } from '../../engine/rng';

export const CHOICE_IDS = ['A', 'B', 'C', 'D'] as const;

/**
 * Assemble a valid 4-choice question from a correct value + distractor values.
 * Ensures no duplicate choice text and returns which id is correct.
 */
export function buildChoices(
  rng: RNG,
  correctText: string,
  distractorTexts: string[],
): { choices: AnswerChoice[]; correctChoiceId: string } {
  const unique = new Set<string>([correctText]);
  const distractors: string[] = [];
  for (const d of distractorTexts) {
    if (!unique.has(d)) {
      unique.add(d);
      distractors.push(d);
    }
    if (distractors.length === 3) break;
  }
  // If we couldn't find 3 distinct distractors, synthesize simple ones.
  let salt = 1;
  while (distractors.length < 3) {
    const alt = `${correctText} (${salt})`;
    if (!unique.has(alt)) {
      unique.add(alt);
      distractors.push(alt);
    }
    salt++;
  }

  const all = shuffle(rng, [correctText, ...distractors]);
  const choices: AnswerChoice[] = all.map((text, i) => ({
    id: CHOICE_IDS[i],
    text,
  }));
  const correctChoiceId = choices.find((c) => c.text === correctText)!.id;
  return { choices, correctChoiceId };
}

export interface GeneratedQuestionInput {
  id: string;
  section: ACTQuestion['section'];
  officialCategory: string;
  subskill: string;
  microSkill: string;
  difficulty: Difficulty;
  expectedSeconds: number;
  prompt: string;
  correctText: string;
  distractorTexts: string[];
  distractorExplainer: (choiceText: string) => string;
  explanation: string;
  conceptSummary: string;
  strategyTip?: string;
  hints?: QuestionHint[];
  calculatorAllowed?: boolean;
  stimulus?: ACTQuestion['stimulus'];
  format?: ACTQuestion['format'];
  tags?: string[];
}

export function makeQuestion(
  rng: RNG,
  input: GeneratedQuestionInput,
): ACTQuestion {
  const { choices, correctChoiceId } = buildChoices(
    rng,
    input.correctText,
    input.distractorTexts,
  );
  const distractorExplanations: Record<string, string> = {};
  for (const c of choices) {
    if (c.id !== correctChoiceId) {
      distractorExplanations[c.id] = input.distractorExplainer(c.text);
    }
  }
  return {
    id: input.id,
    version: 1,
    blueprintVersion: 'act-enhanced-2026',
    section: input.section,
    officialCategory: input.officialCategory,
    subskill: input.subskill,
    microSkill: input.microSkill,
    secondarySkills: [],
    difficulty: input.difficulty,
    expectedSeconds: input.expectedSeconds,
    format: input.format ?? 'multiple_choice',
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
    calculatorAllowed: input.calculatorAllowed ?? false,
    sourceType: 'procedural_template',
    validationStatus: 'approved',
    tags: input.tags ?? ['generated'],
  };
}
