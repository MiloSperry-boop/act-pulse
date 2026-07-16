/** Tunable constants for the adaptive engine. Centralized for testability. */

import type { HintKind } from '../data/models';

export const PRIOR_ALPHA = 2;
export const PRIOR_BETA = 2;

/** Evidence weight by question difficulty (1..5). */
export const DIFFICULTY_WEIGHT: Record<number, number> = {
  1: 0.7,
  2: 0.9,
  3: 1.0,
  4: 1.2,
  5: 1.4,
};

/** Multiplier applied to evidence based on the strongest hint used. */
export const HINT_MULTIPLIER: Record<HintKind | 'none', number> = {
  none: 1.0,
  concept: 0.85,
  starting_step: 0.65,
  partial_setup: 0.4,
};

/** Retention multiplier by days since the skill was last practiced. */
export function retentionMultiplier(daysSince: number): number {
  if (daysSince < 1) return 0.8; // same session / same day
  if (daysSince < 3) return 1.0;
  if (daysSince < 7) return 1.1;
  if (daysSince < 14) return 1.25;
  return 1.4;
}

/** Rolling window size for "recent" accuracy. */
export const RECENT_WINDOW = 8;

/** Spaced-repetition intervals (days). Index 0 = same-session transfer. */
export const REVIEW_INTERVALS_DAYS = [0, 1, 3, 7, 14, 30];

/** Target success band for adaptive difficulty. */
export const TARGET_SUCCESS_LOW = 0.7;
export const TARGET_SUCCESS_HIGH = 0.85;

/** A response is "slow" beyond this ratio of expected time. */
export const SLOW_RATIO = 1.4;
/** A response is "fast" below this ratio of expected time. */
export const FAST_RATIO = 0.6;

/** Mastery thresholds. */
export const MASTERED_MIN_ATTEMPTS = 8;
export const MASTERED_MIN_ACCURACY = 0.85;
export const MASTERED_MIN_DISTINCT_DAYS = 3;

export const CONFIRMED_WEAKNESS_MIN_ATTEMPTS = 6;
export const CONFIRMED_WEAKNESS_MAX_ACCURACY = 0.7;
