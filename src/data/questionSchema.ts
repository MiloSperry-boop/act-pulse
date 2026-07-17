/**
 * Strongly-typed question model and Zod runtime validation.
 * All bundled and imported content is validated against these schemas.
 */

import { z } from 'zod';
import { SECTION_ORDER } from '../config/actBlueprint';

export const SectionEnum = z.enum(['english', 'math', 'reading', 'science']);

export const QuestionFormatEnum = z.enum([
  'multiple_choice', // isolated 4-choice
  'passage_english', // in-context editing question
  'passage_reading', // reading comprehension
  'science_set', // science stimulus question
  'matrix', // matrix lab interactive
  'lesson', // teaching card (answer visible options)
]);
export type QuestionFormat = z.infer<typeof QuestionFormatEnum>;

export const DifficultyEnum = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);
export type Difficulty = z.infer<typeof DifficultyEnum>;

export const AnswerChoiceSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
});
export type AnswerChoice = z.infer<typeof AnswerChoiceSchema>;

export const QuestionHintSchema = z.object({
  level: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  kind: z.enum(['concept', 'starting_step', 'partial_setup']),
  text: z.string().min(1),
});
export type QuestionHint = z.infer<typeof QuestionHintSchema>;

/** Optional visual/data stimulus attached directly to a question. */
export const QuestionStimulusSchema = z.object({
  kind: z.enum(['table', 'matrix', 'figure_note', 'highlight']),
  title: z.string().optional(),
  // For tables: header row + body rows.
  columns: z.array(z.string()).optional(),
  rows: z.array(z.array(z.union([z.string(), z.number()]))).optional(),
  // For matrix stimuli.
  matrices: z
    .array(
      z.object({
        name: z.string(),
        values: z.array(z.array(z.number())),
      }),
    )
    .optional(),
  caption: z.string().optional(),
});
export type QuestionStimulus = z.infer<typeof QuestionStimulusSchema>;

export const ACTQuestionSchema = z
  .object({
    id: z.string().min(1),
    version: z.number().int().nonnegative(),
    blueprintVersion: z.literal('act-enhanced-2026'),
    section: SectionEnum,
    officialCategory: z.string().min(1),
    subskill: z.string().min(1),
    microSkill: z.string().min(1),
    secondarySkills: z.array(z.string()).default([]),
    difficulty: DifficultyEnum,
    expectedSeconds: z.number().int().positive().max(600),
    format: QuestionFormatEnum,
    passageId: z.string().optional(),
    stimulus: QuestionStimulusSchema.optional(),
    prompt: z.string().min(1),
    choices: z.array(AnswerChoiceSchema).length(4),
    correctChoiceId: z.string().min(1),
    explanation: z.string().min(1),
    distractorExplanations: z.record(z.string(), z.string()),
    conceptSummary: z.string().min(1),
    strategyTip: z.string().optional(),
    hints: z.array(QuestionHintSchema).default([]),
    prerequisites: z.array(z.string()).default([]),
    calculatorAllowed: z.boolean(),
    sourceType: z.enum([
      'original_authored',
      'procedural_template',
      'reviewed_generated',
    ]),
    validationStatus: z.enum(['approved', 'draft', 'rejected']),
    tags: z.array(z.string()).default([]),
  })
  .superRefine((q, ctx) => {
    // Exactly one correct answer, and it must be present in choices.
    const ids = q.choices.map((c) => c.id);
    if (new Set(ids).size !== ids.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate choice ids',
        path: ['choices'],
      });
    }
    if (!ids.includes(q.correctChoiceId)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'correctChoiceId not found among choices',
        path: ['correctChoiceId'],
      });
    }
    // Duplicate choice text (a classic generator bug).
    const texts = q.choices.map((c) => c.text.trim().toLowerCase());
    if (new Set(texts).size !== texts.length) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Duplicate choice text',
        path: ['choices'],
      });
    }
    // Every wrong choice needs a distractor explanation.
    for (const c of q.choices) {
      if (c.id !== q.correctChoiceId && !q.distractorExplanations[c.id]) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Missing distractor explanation for ${c.id}`,
          path: ['distractorExplanations'],
        });
      }
    }
    // Calculator policy must respect section rules (only Math allows it).
    if (q.section !== 'math' && q.calculatorAllowed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Calculator only allowed in Math',
        path: ['calculatorAllowed'],
      });
    }
    // Passage-based formats must reference a passage.
    if (
      (q.format === 'passage_reading' || q.format === 'passage_english') &&
      !q.passageId
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Passage format requires passageId',
        path: ['passageId'],
      });
    }
  });

export type ACTQuestion = z.infer<typeof ACTQuestionSchema>;

// ── Passages ──────────────────────────────────────────────────────────
export const PassageParagraphSchema = z.object({
  id: z.string(),
  text: z.string().min(1),
  /** Correct "function" label for passage-mapping drills, if authored. */
  functionLabel: z.string().optional(),
});

export const PassageSchema = z.object({
  id: z.string().min(1),
  section: SectionEnum,
  kind: z.enum([
    'literary_narrative',
    'social_science',
    'humanities',
    'natural_science',
    'paired',
    'english_editing',
    'science_data',
    'science_research',
    'science_conflicting',
  ]),
  title: z.string().min(1),
  paragraphs: z.array(PassageParagraphSchema).min(1),
  wordCount: z.number().int().positive(),
  stimulus: QuestionStimulusSchema.optional(),
  attribution: z.string().default('Original practice content — Summit'),
});
export type Passage = z.infer<typeof PassageSchema>;

export function isMultipleCorrect(q: ACTQuestion): boolean {
  return q.choices.filter((c) => c.id === q.correctChoiceId).length !== 1;
}

export const KNOWN_SECTIONS = SECTION_ORDER;
