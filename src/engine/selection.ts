/**
 * Question selection: priority scoring + weighted selection with constraints.
 * Pure and deterministic given an RNG.
 */

import type { ACTQuestion } from '../data/questionSchema';
import type { ReviewItem, SkillState } from '../data/models';
import type { SectionId } from '../config/actBlueprint';
import { masteryEstimate } from './adaptiveEngine';
import { SKILL_BY_ID } from '../config/skills';
import {
  type RNG,
  weightedSampleWithoutReplacement,
  shuffle,
} from './rng';

export interface SelectionContext {
  skillStates: Map<string, SkillState>;
  reviewItemsBySkill: Map<string, ReviewItem[]>;
  /** blueprint gap per category id: >0 means under-practiced. */
  blueprintGap: Map<string, number>;
  seenQuestionIds: Set<string>;
  now: string;
  includeScience: boolean;
}

/** Weakness weight increases as mastery decreases. */
export function weaknessWeight(state: SkillState | undefined): number {
  if (!state) return 0.5; // unknown skill → moderately worth exploring
  const m = masteryEstimate(state);
  const statusBoost =
    state.weaknessStatus === 'confirmed'
      ? 1.0
      : state.weaknessStatus === 'possible'
        ? 0.6
        : state.weaknessStatus === 'improving'
          ? 0.3
          : 0;
  return Math.min(1, (1 - m) + statusBoost * 0.5);
}

/** Review-due weight increases with overdue-ness. */
export function reviewDueWeight(
  items: ReviewItem[] | undefined,
  now: string,
): number {
  if (!items || items.length === 0) return 0;
  let best = 0;
  for (const it of items) {
    if (it.status !== 'scheduled') continue;
    const overdueMs = new Date(now).getTime() - new Date(it.dueAt).getTime();
    if (overdueMs >= 0) {
      const overdueDays = overdueMs / (1000 * 60 * 60 * 24);
      best = Math.max(best, Math.min(1, 0.5 + overdueDays * 0.1));
    }
  }
  return best;
}

/** Uncertainty weight: highest when we have little evidence. */
export function uncertaintyWeight(state: SkillState | undefined): number {
  if (!state) return 1;
  const n = state.totalAttempts;
  return Math.max(0, 1 - n / 6);
}

export function blueprintGapWeight(
  categoryId: string,
  gap: Map<string, number>,
): number {
  const g = gap.get(categoryId) ?? 0;
  return Math.max(0, Math.min(1, g));
}

/** Composite priority for a single question. */
export function questionPriority(
  q: ACTQuestion,
  ctx: SelectionContext,
): number {
  const state = ctx.skillStates.get(q.microSkill);
  const skill = SKILL_BY_ID[q.microSkill];
  const w = weaknessWeight(state);
  const r = reviewDueWeight(ctx.reviewItemsBySkill.get(q.microSkill), ctx.now);
  const u = uncertaintyWeight(state);
  const b = skill ? blueprintGapWeight(skill.categoryId, ctx.blueprintGap) : 0;
  const exploration = ctx.seenQuestionIds.has(q.id) ? 0.02 : 0.2;

  let score =
    w * 0.35 + r * 0.25 + u * 0.15 + b * 0.15 + exploration * 0.1;

  // Down-weight questions already seen this cycle.
  if (ctx.seenQuestionIds.has(q.id)) score *= 0.25;
  return Math.max(0.001, score);
}

export interface SelectConstraints {
  maxPerSkillConsecutive?: number;
  focusedMode?: boolean;
  targetDifficulty?: number;
}

/**
 * Weighted, constraint-aware selection of `count` questions from `candidates`.
 * Enforces: no duplicate question, no more than N of one micro-skill in a row.
 */
export function selectQuestions(
  candidates: ACTQuestion[],
  ctx: SelectionContext,
  count: number,
  rng: RNG,
  constraints: SelectConstraints = {},
): ACTQuestion[] {
  const maxConsecutive = constraints.maxPerSkillConsecutive ?? 3;
  const pool = candidates.filter(
    (q) => ctx.includeScience || q.section !== 'science',
  );

  // Weighted sample a generous superset, then order with constraints.
  const superset = weightedSampleWithoutReplacement(
    rng,
    pool,
    (q) => questionPriority(q, ctx),
    Math.min(pool.length, count * 3),
  );

  const chosen: ACTQuestion[] = [];
  const usedIds = new Set<string>();
  let consecutiveSkill: string | null = null;
  let consecutiveCount = 0;

  const ordered = constraints.focusedMode ? superset : shuffle(rng, superset);
  // Sort by priority desc for a stable base, then apply constraints.
  ordered.sort((a, b) => questionPriority(b, ctx) - questionPriority(a, ctx));

  for (const q of ordered) {
    if (chosen.length >= count) break;
    if (usedIds.has(q.id)) continue;
    if (
      !constraints.focusedMode &&
      q.microSkill === consecutiveSkill &&
      consecutiveCount >= maxConsecutive
    ) {
      continue;
    }
    chosen.push(q);
    usedIds.add(q.id);
    if (q.microSkill === consecutiveSkill) {
      consecutiveCount++;
    } else {
      consecutiveSkill = q.microSkill;
      consecutiveCount = 1;
    }
  }

  // Backfill if constraints left us short.
  if (chosen.length < count) {
    for (const q of ordered) {
      if (chosen.length >= count) break;
      if (!usedIds.has(q.id)) {
        chosen.push(q);
        usedIds.add(q.id);
      }
    }
  }
  return chosen;
}

export function sectionOf(q: ACTQuestion): SectionId {
  return q.section;
}
