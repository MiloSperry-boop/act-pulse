/**
 * The question bank. Combines authored questions, procedurally generated
 * batches, and passages into a single indexed collection.
 */

import type { ACTQuestion, Passage } from '../data/questionSchema';
import { ENGLISH_QUESTIONS } from './authored/english';
import { MATH_QUESTIONS } from './authored/math';
import { READING_QUESTIONS, READING_PASSAGES } from './reading/passages';
import { SCIENCE_QUESTIONS, SCIENCE_PASSAGES } from './science/sets';
import { generateMatrixBatch } from './generators/matrix';
import { generateSvaBatch } from './generators/subjectVerb';
import { generateMathCoreBatch } from './generators/mathCore';

export const QUESTION_BANK_VERSION = '2026.07.16-2';

/** Deterministic generated content (fixed seeds → same bank every load). */
function buildGenerated(): ACTQuestion[] {
  return [
    ...generateMatrixBatch('matrix-seed', 30),
    ...generateSvaBatch('sva-seed', 30),
    ...generateMathCoreBatch('mathcore-seed', 45),
  ];
}

let _all: ACTQuestion[] | null = null;
let _byId: Map<string, ACTQuestion> | null = null;

export function getAllQuestions(): ACTQuestion[] {
  if (!_all) {
    const authored = [
      ...ENGLISH_QUESTIONS,
      ...MATH_QUESTIONS,
      ...READING_QUESTIONS,
      ...SCIENCE_QUESTIONS,
    ];
    const generated = buildGenerated();
    // De-duplicate by id (defensive).
    const seen = new Set<string>();
    _all = [];
    for (const q of [...authored, ...generated]) {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        _all.push(q);
      }
    }
    _byId = new Map(_all.map((q) => [q.id, q]));
  }
  return _all;
}

export function getQuestionById(id: string): ACTQuestion | undefined {
  if (!_byId) getAllQuestions();
  return _byId!.get(id);
}

export function getApprovedQuestions(): ACTQuestion[] {
  return getAllQuestions().filter((q) => q.validationStatus === 'approved');
}

const PASSAGES: Passage[] = [...READING_PASSAGES, ...SCIENCE_PASSAGES];
const PASSAGE_BY_ID = new Map(PASSAGES.map((p) => [p.id, p]));

export function getAllPassages(): Passage[] {
  return PASSAGES;
}

export function getPassageById(id: string): Passage | undefined {
  return PASSAGE_BY_ID.get(id);
}

/** Content counts for the Settings / inspector screens. */
export interface ContentStats {
  total: number;
  bySection: Record<string, number>;
  byDifficulty: Record<number, number>;
  authored: number;
  generated: number;
  passages: number;
}

export function getContentStats(): ContentStats {
  const all = getAllQuestions();
  const bySection: Record<string, number> = {};
  const byDifficulty: Record<number, number> = {};
  let authored = 0;
  let generated = 0;
  for (const q of all) {
    bySection[q.section] = (bySection[q.section] ?? 0) + 1;
    byDifficulty[q.difficulty] = (byDifficulty[q.difficulty] ?? 0) + 1;
    if (q.sourceType === 'original_authored') authored++;
    else generated++;
  }
  return {
    total: all.length,
    bySection,
    byDifficulty,
    authored,
    generated,
    passages: PASSAGES.length,
  };
}

/** For tests: force a rebuild (clears memoized caches). */
export function _resetBankCacheForTests(): void {
  _all = null;
  _byId = null;
}
