/**
 * Core mastery model. Pure functions: given a SkillState and an attempt, return
 * an updated SkillState. No I/O and no ambient clock — callers pass `now`.
 */

import type {
  ConfidenceLevel,
  HintKind,
  RecentOutcome,
  SkillState,
} from '../data/models';
import type { SectionId } from '../config/actBlueprint';
import { SKILL_BY_ID } from '../config/skills';
import {
  DIFFICULTY_WEIGHT,
  HINT_MULTIPLIER,
  PRIOR_ALPHA,
  PRIOR_BETA,
  RECENT_WINDOW,
  retentionMultiplier,
  FAST_RATIO,
  SLOW_RATIO,
} from './constants';

export function createSkillState(
  skillId: string,
  section: SectionId,
  expectedResponseTimeMs = 45_000,
): SkillState {
  const skill = SKILL_BY_ID[skillId];
  const initialDifficulty = skill && skill.initialPriority >= 2 ? 2 : 3;
  return {
    skillId,
    section,
    alpha: PRIOR_ALPHA,
    beta: PRIOR_BETA,
    knowledgeMastery: PRIOR_ALPHA / (PRIOR_ALPHA + PRIOR_BETA),
    speedMastery: 0.5,
    retentionStrength: 0.3,
    confidenceCalibration: 0,
    totalAttempts: 0,
    correctAttempts: 0,
    independentCorrectAttempts: 0,
    hintedAttempts: 0,
    recentAccuracy: 0.5,
    averageResponseTimeMs: expectedResponseTimeMs,
    expectedResponseTimeMs,
    currentDifficulty: initialDifficulty,
    lastPracticedAt: null,
    nextReviewAt: null,
    consecutiveCorrect: 0,
    consecutiveIncorrect: 0,
    distinctPracticeDays: [],
    hadDelayedReviewSuccess: false,
    maxDifficultyCleared: 0,
    weaknessStatus: 'insufficient_data',
    weaknessTypes: [],
    recentOutcomes: [],
  };
}

export interface AttemptEvidence {
  correct: boolean;
  difficulty: number;
  responseTimeMs: number;
  hintsUsed: HintKind[];
  confidence: ConfidenceLevel;
  isReview: boolean;
  reviewIntervalDays: number | null;
  at: string; // ISO
}

export function strongestHint(hints: HintKind[]): HintKind | 'none' {
  if (hints.includes('partial_setup')) return 'partial_setup';
  if (hints.includes('starting_step')) return 'starting_step';
  if (hints.includes('concept')) return 'concept';
  return 'none';
}

function daysBetween(fromIso: string | null, toIso: string): number {
  if (!fromIso) return 0;
  const ms = new Date(toIso).getTime() - new Date(fromIso).getTime();
  return Math.max(0, ms / (1000 * 60 * 60 * 24));
}

function isoDay(iso: string): string {
  return iso.slice(0, 10);
}

function clamp01(x: number): number {
  return Math.max(0, Math.min(1, x));
}

/**
 * Compute the evidence weight for an attempt. The `answerRevealed` flag zeroes
 * out knowledge evidence (a fully-revealed answer teaches nothing about mastery).
 */
export function evidenceWeight(
  ev: AttemptEvidence,
  lastPracticedAt: string | null,
): number {
  const diffW = DIFFICULTY_WEIGHT[Math.round(ev.difficulty)] ?? 1;
  const hint = strongestHint(ev.hintsUsed);
  const hintW = HINT_MULTIPLIER[hint];

  // Retention weight: a delayed review is stronger evidence than a same-day one.
  const daysSince = ev.isReview
    ? (ev.reviewIntervalDays ?? daysBetween(lastPracticedAt, ev.at))
    : daysBetween(lastPracticedAt, ev.at);
  const retW = retentionMultiplier(daysSince);

  return diffW * hintW * retW;
}

/** Update confidence calibration toward the observed over/under-confidence. */
function updateCalibration(
  prev: number,
  confidence: ConfidenceLevel,
  correct: boolean,
): number {
  // Map confidence to an expected probability of being correct.
  const expected =
    confidence === 'confident' ? 0.9 : confidence === 'unsure' ? 0.6 : 0.35;
  const actual = correct ? 1 : 0;
  // Positive error = underconfident; negative = overconfident.
  const error = actual - expected;
  return clamp(prev * 0.8 + error * 0.2, -1, 1);
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

function updateSpeedMastery(
  prev: SkillState,
  correct: boolean,
  ratio: number,
): number {
  // Only correct answers can raise speed mastery. Fast+correct rewards most.
  let target: number;
  if (!correct) {
    target = ratio < FAST_RATIO ? prev.speedMastery - 0.05 : prev.speedMastery;
  } else if (ratio <= FAST_RATIO) {
    target = 0.95;
  } else if (ratio <= 1.0) {
    target = 0.8;
  } else if (ratio <= SLOW_RATIO) {
    target = 0.55;
  } else {
    target = 0.35;
  }
  return clamp01(prev.speedMastery * 0.7 + target * 0.3);
}

export function applyAttempt(
  prev: SkillState,
  ev: AttemptEvidence,
): SkillState {
  const w = evidenceWeight(ev, prev.lastPracticedAt);
  const isIndependent = ev.hintsUsed.length === 0;

  // Beta update. Correct → alpha; incorrect → beta. Cap swing per attempt.
  const alphaGain = ev.correct ? w : 0;
  // Incorrect evidence uses a slightly damped weight to avoid wild swings.
  const betaGain = ev.correct ? 0 : Math.min(w, 1.3);

  const alpha = prev.alpha + alphaGain;
  const beta = prev.beta + betaGain;
  const knowledgeMastery = alpha / (alpha + beta);

  const ratio = ev.responseTimeMs / Math.max(1, prev.expectedResponseTimeMs);

  const outcome: RecentOutcome = {
    correct: ev.correct,
    independent: isIndependent,
    difficulty: ev.difficulty,
    responseTimeMs: ev.responseTimeMs,
    ratioToExpected: ratio,
    confidence: ev.confidence,
    at: ev.at,
  };
  const recentOutcomes = [...prev.recentOutcomes, outcome].slice(-RECENT_WINDOW);
  const recentAccuracy =
    recentOutcomes.filter((o) => o.correct).length / recentOutcomes.length;

  const day = isoDay(ev.at);
  const distinctPracticeDays = prev.distinctPracticeDays.includes(day)
    ? prev.distinctPracticeDays
    : [...prev.distinctPracticeDays, day];

  const totalAttempts = prev.totalAttempts + 1;
  const correctAttempts = prev.correctAttempts + (ev.correct ? 1 : 0);
  const independentCorrectAttempts =
    prev.independentCorrectAttempts +
    (ev.correct && isIndependent ? 1 : 0);
  const hintedAttempts = prev.hintedAttempts + (isIndependent ? 0 : 1);

  // Rolling average response time (EWMA).
  const averageResponseTimeMs = Math.round(
    prev.totalAttempts === 0
      ? ev.responseTimeMs
      : prev.averageResponseTimeMs * 0.7 + ev.responseTimeMs * 0.3,
  );

  // Retention strength grows on delayed-review success, decays on lapse.
  const daysSince = daysBetween(prev.lastPracticedAt, ev.at);
  const delayedSuccess = ev.correct && daysSince >= 1;
  let retentionStrength = prev.retentionStrength;
  if (delayedSuccess) {
    retentionStrength = clamp01(
      retentionStrength + 0.12 * retentionMultiplier(daysSince),
    );
  } else if (!ev.correct && ev.isReview) {
    retentionStrength = clamp01(retentionStrength - 0.15);
  }

  const speedMastery = updateSpeedMastery(prev, ev.correct, ratio);
  const confidenceCalibration = updateCalibration(
    prev.confidenceCalibration,
    ev.confidence,
    ev.correct,
  );

  const consecutiveCorrect = ev.correct ? prev.consecutiveCorrect + 1 : 0;
  const consecutiveIncorrect = ev.correct ? 0 : prev.consecutiveIncorrect + 1;

  const maxDifficultyCleared =
    ev.correct && isIndependent
      ? Math.max(prev.maxDifficultyCleared, ev.difficulty)
      : prev.maxDifficultyCleared;

  return {
    ...prev,
    alpha,
    beta,
    knowledgeMastery,
    speedMastery,
    retentionStrength,
    confidenceCalibration,
    totalAttempts,
    correctAttempts,
    independentCorrectAttempts,
    hintedAttempts,
    recentAccuracy,
    averageResponseTimeMs,
    lastPracticedAt: ev.at,
    consecutiveCorrect,
    consecutiveIncorrect,
    distinctPracticeDays,
    hadDelayedReviewSuccess:
      prev.hadDelayedReviewSuccess ||
      (delayedSuccess && daysSince >= 7 && isIndependent),
    maxDifficultyCleared,
    recentOutcomes,
  };
}

/** Smoothed accuracy estimate (Beta mean). */
export function masteryEstimate(state: SkillState): number {
  return state.alpha / (state.alpha + state.beta);
}

/**
 * Predicted probability the user answers a question of a given difficulty
 * correctly. Blends Beta mean with a difficulty adjustment vs. the skill's
 * current working difficulty.
 */
export function predictedSuccess(
  state: SkillState,
  difficulty: number,
): number {
  const base = masteryEstimate(state);
  const gap = difficulty - state.currentDifficulty;
  // Each difficulty level above current drops predicted success ~12%.
  return clamp01(base - gap * 0.12);
}
