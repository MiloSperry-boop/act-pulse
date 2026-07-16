/** Builds sessions from live DB state and persists session records. */

import { db } from '../data/db';
import type { SessionMode, SessionRecord, SkillState } from '../data/models';
import type { ReviewItem } from '../data/models';
import { getApprovedQuestions, getQuestionById } from '../content/questionBank';
import type { ACTQuestion } from '../data/questionSchema';
import {
  buildSession,
  buildDiagnostic,
  MODE_SPECS,
  questionCountForMinutes,
} from '../engine/session';
import type { SelectionContext } from '../engine/selection';
import { mulberry32, hashSeed } from '../engine/rng';
import { CATEGORY_TARGETS, categoryMidpoint } from '../config/actBlueprint';
import { SKILL_BY_ID } from '../config/skills';

export async function buildSelectionContext(
  now: string,
  includeScience: boolean,
): Promise<SelectionContext> {
  const [skillStates, reviewItems, attempts] = await Promise.all([
    db.skillStates.toArray(),
    db.reviewItems.where('status').equals('scheduled').toArray(),
    db.attempts.toArray(),
  ]);

  const skillMap = new Map<string, SkillState>(
    skillStates.map((s) => [s.skillId, s]),
  );
  const reviewBySkill = new Map<string, ReviewItem[]>();
  for (const r of reviewItems) {
    const arr = reviewBySkill.get(r.skillId) ?? [];
    arr.push(r);
    reviewBySkill.set(r.skillId, arr);
  }

  // Blueprint gap: compare recent practice distribution vs. target midpoints.
  const recentAttempts = attempts.slice(-120);
  const catCounts = new Map<string, number>();
  for (const a of recentAttempts) {
    const cat = SKILL_BY_ID[a.skillId]?.categoryId;
    if (cat) catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
  }
  const total = recentAttempts.length || 1;
  const blueprintGap = new Map<string, number>();
  for (const t of CATEGORY_TARGETS) {
    const share = (catCounts.get(t.id) ?? 0) / total;
    // Section-relative target; approximate with midpoint / 100 across section.
    const target = categoryMidpoint(t) / 100 / sectionCategoryCount(t.section);
    const gap = target - share; // >0 means under-practiced
    blueprintGap.set(t.id, Math.max(0, gap * 4));
  }

  const seen = new Set(recentAttempts.slice(-40).map((a) => a.questionId));

  return {
    skillStates: skillMap,
    reviewItemsBySkill: reviewBySkill,
    blueprintGap,
    seenQuestionIds: seen,
    now,
    includeScience,
  };
}

function sectionCategoryCount(section: string): number {
  return CATEGORY_TARGETS.filter((c) => c.section === section).length || 1;
}

export interface PreparedSession {
  record: SessionRecord;
  questions: ACTQuestion[];
}

let seedCounter = 1;

export async function prepareSession(
  mode: SessionMode,
  durationMin: number,
  includeScience: boolean,
  now = new Date().toISOString(),
): Promise<PreparedSession> {
  const ctx = await buildSelectionContext(now, includeScience);
  const candidates = getApprovedQuestions();
  const rng = mulberry32(hashSeed(`${mode}:${now}:${seedCounter++}`));

  let questionIds: string[];
  const spec = MODE_SPECS[mode];

  if (mode === 'diagnostic') {
    questionIds = buildDiagnostic(candidates, includeScience, rng);
  } else {
    const plan = buildSession(
      { mode, targetDurationMin: durationMin, includeScience },
      candidates,
      ctx,
      rng,
    );
    questionIds = plan.questionIds;
  }

  const questions = questionIds
    .map((id) => getQuestionById(id))
    .filter((q): q is ACTQuestion => Boolean(q));

  const record: SessionRecord = {
    id: `sess_${hashSeed(`${mode}:${now}:${seedCounter}`).toString(36)}`,
    mode,
    section: spec?.section ?? 'mixed',
    startedAt: now,
    completedAt: null,
    questionIds: questions.map((q) => q.id),
    answered: 0,
    correct: 0,
    totalTimeMs: 0,
    skillsPracticed: Array.from(new Set(questions.map((q) => q.microSkill))),
    targetDurationMin: durationMin,
  };

  await db.sessions.put(record);
  return { record, questions };
}

export async function completeSession(
  record: SessionRecord,
  answered: number,
  correct: number,
  totalTimeMs: number,
  now = new Date().toISOString(),
): Promise<void> {
  await db.sessions.update(record.id, {
    completedAt: now,
    answered,
    correct,
    totalTimeMs,
  });
  const key = now.slice(0, 10);
  const day = (await db.dailyActivity.get(key)) ?? {
    date: key,
    minutes: 0,
    questions: 0,
    correct: 0,
    sessionsCompleted: 0,
    reviewsCompleted: 0,
  };
  day.sessionsCompleted += 1;
  await db.dailyActivity.put(day);
}

export function recommendedDuration(dailyMinutes: number): SessionMode {
  if (dailyMinutes <= 5) return 'quick5';
  if (dailyMinutes <= 10) return 'standard10';
  if (dailyMinutes <= 15) return 'focused15';
  return 'deep20';
}

export function durationForMode(mode: SessionMode, fallback = 10): number {
  const map: Partial<Record<SessionMode, number>> = {
    quick5: 5,
    standard10: 10,
    focused15: 15,
    deep20: 20,
    diagnostic: 15,
  };
  return map[mode] ?? fallback;
}

export { questionCountForMinutes };
