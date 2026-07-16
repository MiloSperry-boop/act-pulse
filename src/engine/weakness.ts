/** Weakness detection, diagnosis, and adaptive difficulty adjustment. */

import type { SkillState, WeaknessStatus, WeaknessType } from '../data/models';
import { masteryEstimate } from './adaptiveEngine';
import {
  CONFIRMED_WEAKNESS_MAX_ACCURACY,
  CONFIRMED_WEAKNESS_MIN_ATTEMPTS,
  MASTERED_MIN_ACCURACY,
  MASTERED_MIN_ATTEMPTS,
  MASTERED_MIN_DISTINCT_DAYS,
  SLOW_RATIO,
  TARGET_SUCCESS_HIGH,
  TARGET_SUCCESS_LOW,
} from './constants';

function recentMissesAcrossDays(state: SkillState): number {
  const missDays = new Set(
    state.recentOutcomes.filter((o) => !o.correct).map((o) => o.at.slice(0, 10)),
  );
  return missDays.size;
}

function avgRatio(state: SkillState): number {
  if (state.recentOutcomes.length === 0) return 1;
  const sum = state.recentOutcomes.reduce((a, o) => a + o.ratioToExpected, 0);
  return sum / state.recentOutcomes.length;
}

function recentMisses(state: SkillState): number {
  return state.recentOutcomes.filter((o) => !o.correct).length;
}

/** Determine mastery/weakness status from accumulated evidence. */
export function classifyStatus(state: SkillState): WeaknessStatus {
  const attempts = state.totalAttempts;
  if (attempts < 3) return 'insufficient_data';

  const acc = state.recentAccuracy;
  const beta = masteryEstimate(state);
  const missesAcrossDays = recentMissesAcrossDays(state);
  const ratio = avgRatio(state);

  // Mastered — strong, durable, multi-day, cleared harder items.
  if (
    attempts >= MASTERED_MIN_ATTEMPTS &&
    acc >= MASTERED_MIN_ACCURACY &&
    state.distinctPracticeDays.length >= MASTERED_MIN_DISTINCT_DAYS &&
    state.maxDifficultyCleared >= 3 &&
    ratio <= SLOW_RATIO
  ) {
    return 'mastered';
  }

  // Confirmed weakness conditions (any one).
  const confirmedByAccuracy =
    attempts >= CONFIRMED_WEAKNESS_MIN_ATTEMPTS &&
    acc < CONFIRMED_WEAKNESS_MAX_ACCURACY;
  const confirmedByDays = recentMisses(state) >= 3 && missesAcrossDays >= 2;
  const confirmedBySpeed = ratio > 1.4 && acc < 0.85 && attempts >= 4;
  if (confirmedByAccuracy || confirmedByDays || confirmedBySpeed) {
    // If the trend is up recently, mark improving instead.
    if (isImproving(state)) return 'improving';
    return 'confirmed';
  }

  // Possible weakness.
  const possible =
    (attempts >= 3 && acc < 0.6) ||
    recentMisses(state) >= 2 ||
    ratio > SLOW_RATIO ||
    state.hintedAttempts >= 2;
  if (possible) return isImproving(state) ? 'improving' : 'possible';

  if (beta >= 0.8) return 'stable';
  return 'stable';
}

function isImproving(state: SkillState): boolean {
  const o = state.recentOutcomes;
  if (o.length < 4) return false;
  const half = Math.floor(o.length / 2);
  const older = o.slice(0, half);
  const newer = o.slice(half);
  const olderAcc = older.filter((x) => x.correct).length / older.length;
  const newerAcc = newer.filter((x) => x.correct).length / newer.length;
  return newerAcc - olderAcc >= 0.25 && newerAcc >= 0.6;
}

/** Diagnose likely weakness types. Multiple can apply. */
export function diagnoseWeaknessTypes(
  state: SkillState,
  passageContextMissRate?: number,
  isolatedContextAccuracy?: number,
): WeaknessType[] {
  const types: WeaknessType[] = [];
  const acc = state.recentAccuracy;
  const ratio = avgRatio(state);
  const outcomes = state.recentOutcomes;

  // Knowledge gap: misses at both easy and hard, low confidence, hints help.
  const easyMiss = outcomes.some((o) => o.difficulty <= 2 && !o.correct);
  const hardMiss = outcomes.some((o) => o.difficulty >= 4 && !o.correct);
  const lowConf = outcomes.filter((o) => o.confidence !== 'confident').length;
  if ((easyMiss && hardMiss) || (acc < 0.5 && lowConf >= outcomes.length / 2)) {
    types.push('knowledge_gap');
  }

  // Speed gap: high accuracy but consistently slow.
  if (acc >= 0.8 && ratio > SLOW_RATIO) types.push('speed_gap');

  // Careless-error pattern: fast, confident, inconsistent errors.
  const fastConfidentWrong = outcomes.filter(
    (o) => !o.correct && o.confidence === 'confident' && o.ratioToExpected < 0.9,
  ).length;
  if (fastConfidentWrong >= 1 && acc >= 0.55 && acc < 0.9) {
    types.push('careless_error_pattern');
  }

  // Application gap: easy correct, complex/passage wrong.
  const easyCorrect = outcomes.filter((o) => o.difficulty <= 2 && o.correct);
  const hardWrong = outcomes.filter((o) => o.difficulty >= 3 && !o.correct);
  if (easyCorrect.length >= 2 && hardWrong.length >= 2) {
    types.push('application_gap');
  }
  if (
    typeof passageContextMissRate === 'number' &&
    typeof isolatedContextAccuracy === 'number' &&
    isolatedContextAccuracy >= 0.8 &&
    passageContextMissRate >= 0.4
  ) {
    types.push('recognition_gap');
  }

  // Retention gap: same-day fine, delayed reviews fail.
  const delayedFails = outcomes.filter(
    (o) => !o.correct && o.ratioToExpected >= 0,
  );
  if (
    state.retentionStrength < 0.35 &&
    state.hadDelayedReviewSuccess === false &&
    delayedFails.length >= 1 &&
    acc >= 0.6
  ) {
    types.push('retention_gap');
  }

  return Array.from(new Set(types));
}

/**
 * Adjust the skill's working difficulty toward the 70–85% success band.
 * Returns the new difficulty (1..5, float allowed).
 */
export function adjustDifficulty(state: SkillState): number {
  const last5 = state.recentOutcomes.slice(-5);
  let d = state.currentDifficulty;

  if (last5.length >= 3) {
    const acc = last5.filter((o) => o.correct).length / last5.length;
    const independent = last5.every((o) => o.independent);
    const ratio = avgRatio(state);

    if (acc >= TARGET_SUCCESS_HIGH && independent && ratio <= 1.1) {
      // Do not jump on a single lucky answer — require the whole window.
      d = Math.min(5, d + 0.5);
    } else if (acc <= 0.4) {
      d = Math.max(1, d - 0.5);
    } else if (acc < TARGET_SUCCESS_LOW) {
      d = Math.max(1, d - 0.25);
    }
  }
  return Math.round(d * 2) / 2; // snap to nearest 0.5
}

/** Human-readable coaching message from the diagnosis. */
export const WEAKNESS_TYPE_ADVICE: Record<WeaknessType, string> = {
  knowledge_gap:
    'Review the underlying rule with a short lesson, then try a guided example before returning to mixed practice.',
  recognition_gap:
    'You know the rule in isolation but miss it inside passages. Practice spotting when the rule applies in mixed drills.',
  application_gap:
    'Simple versions are solid; complexity trips you up. Build up gradually with multistep versions.',
  speed_gap:
    'Accuracy is strong but pace is slow. Do timed sets at the same difficulty and learn recognition shortcuts.',
  retention_gap:
    'It fades between sessions. Shorter, spaced reviews with varied examples will help it stick.',
  careless_error_pattern:
    'Fast, confident misses. Add a one-line verification step and watch for words like NOT, EXCEPT, and least.',
};
