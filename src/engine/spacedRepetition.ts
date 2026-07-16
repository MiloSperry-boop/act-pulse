/** Spaced-repetition scheduling for skills and mistakes. */

import type { ReviewItem, SkillState } from '../data/models';
import { REVIEW_INTERVALS_DAYS } from './constants';
import { strongestHint } from './adaptiveEngine';
import type { HintKind } from '../data/models';

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

export interface ReviewOutcome {
  correct: boolean;
  hintsUsed: HintKind[];
  intervalDays: number; // actual days since last review
}

/**
 * Given the current interval index and the outcome, return the next index.
 * - Incorrect → step back toward a shorter interval.
 * - Correct with hints → repeat sooner (stay or half-step).
 * - Correct independently → advance.
 */
export function nextIntervalIndex(
  currentIndex: number,
  outcome: ReviewOutcome,
): number {
  const max = REVIEW_INTERVALS_DAYS.length - 1;
  if (!outcome.correct) {
    return Math.max(1, currentIndex - 2);
  }
  const hint = strongestHint(outcome.hintsUsed);
  if (hint !== 'none') {
    // Correct but needed help: don't advance.
    return Math.min(max, Math.max(1, currentIndex));
  }
  return Math.min(max, currentIndex + 1);
}

/** Create a fresh review item scheduled for the first spaced interval. */
export function scheduleNewReview(
  skillId: string,
  questionId: string,
  section: ReviewItem['section'],
  now: string,
): ReviewItem {
  const intervalIndex = 1; // first real interval = 1 day
  return {
    skillId,
    questionId,
    section,
    intervalIndex,
    dueAt: addDays(now, REVIEW_INTERVALS_DAYS[intervalIndex]),
    lastReviewedAt: null,
    status: 'scheduled',
    retentionStrength: 0.3,
    createdAt: now,
  };
}

/** Advance an existing review item after it is answered. */
export function advanceReview(
  item: ReviewItem,
  outcome: ReviewOutcome,
  now: string,
): ReviewItem {
  const nextIndex = nextIntervalIndex(item.intervalIndex, outcome);
  const days = REVIEW_INTERVALS_DAYS[nextIndex];
  const retentionStrength = outcome.correct
    ? Math.min(1, item.retentionStrength + 0.15)
    : Math.max(0, item.retentionStrength - 0.2);
  return {
    ...item,
    intervalIndex: nextIndex,
    dueAt: addDays(now, days),
    lastReviewedAt: now,
    status: 'scheduled',
    retentionStrength,
  };
}

export function isDue(item: ReviewItem, now: string): boolean {
  return item.status === 'scheduled' && item.dueAt <= now;
}

/** Compute the next review time for a skill state (used on the skill card). */
export function computeNextReviewAt(
  state: SkillState,
  now: string,
): string {
  // Weaker skills come back sooner.
  const acc = state.recentAccuracy;
  const idx = acc < 0.6 ? 1 : acc < 0.8 ? 2 : 3;
  return addDays(now, REVIEW_INTERVALS_DAYS[idx]);
}
