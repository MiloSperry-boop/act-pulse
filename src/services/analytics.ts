/** Read-side analytics for the Progress screen and Home dashboard. */

import { db } from '../data/db';
import type { Attempt, DailyActivity, SkillState } from '../data/models';
import { masteryEstimate } from '../engine/adaptiveEngine';
import { SKILL_BY_ID, type Skill } from '../config/skills';
import {
  CATEGORY_TARGETS,
  categoryMidpoint,
  SECTION_LABELS,
  type SectionId,
} from '../config/actBlueprint';

export interface SkillSummary {
  skill: Skill;
  state: SkillState;
  mastery: number;
}

export interface ProgressSnapshot {
  totalAttempts: number;
  overallAccuracy: number;
  recentAccuracy: number;
  averageResponseSec: number;
  masteryBySection: { section: SectionId; label: string; mastery: number }[];
  strongest: SkillSummary[];
  weakest: SkillSummary[];
  improving: SkillSummary[];
  declining: SkillSummary[];
  dueReviews: number;
  readinessIndex: number;
  calibration: {
    confidentCorrect: number;
    confidentWrong: number;
    guessingCorrect: number;
    total: number;
  };
  errorPattern: { type: string; count: number }[];
  weeklyActivity: DailyActivity[];
  blueprintCoverage: BlueprintCoverageRow[];
}

export interface BlueprintCoverageRow {
  categoryId: string;
  label: string;
  section: SectionId;
  targetPct: number;
  actualPct: number;
  status: 'under' | 'on_target' | 'over';
}

function isoDay(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function getWeeklyActivity(
  now = new Date(),
): Promise<DailyActivity[]> {
  const days: DailyActivity[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getTime() - i * 86400000);
    const key = isoDay(d);
    const rec = await db.dailyActivity.get(key);
    days.push(
      rec ?? {
        date: key,
        minutes: 0,
        questions: 0,
        correct: 0,
        sessionsCompleted: 0,
        reviewsCompleted: 0,
      },
    );
  }
  return days;
}

/** Readiness index (0..100): weighted blend of mastery, coverage, consistency. */
export function computeReadiness(
  states: SkillState[],
  weeklyActivity: DailyActivity[],
): number {
  if (states.length === 0) return 0;
  const avgMastery =
    states.reduce((a, s) => a + masteryEstimate(s), 0) / states.length;

  const practicedSkills = states.filter((s) => s.totalAttempts >= 3).length;
  const coverage = Math.min(1, practicedSkills / 20);

  const activeDays = weeklyActivity.filter((d) => d.questions > 0).length;
  const consistency = activeDays / 7;

  const raw = avgMastery * 0.6 + coverage * 0.25 + consistency * 0.15;
  return Math.round(raw * 100);
}

export function readinessLabel(index: number): string {
  if (index < 25) return 'Developing';
  if (index < 45) return 'Building';
  if (index < 65) return 'Approaching target';
  if (index < 82) return 'Strong';
  return 'Consistent';
}

function trend(state: SkillState): number {
  const o = state.recentOutcomes;
  if (o.length < 4) return 0;
  const half = Math.floor(o.length / 2);
  const older = o.slice(0, half);
  const newer = o.slice(half);
  const oa = older.filter((x) => x.correct).length / older.length;
  const na = newer.filter((x) => x.correct).length / newer.length;
  return na - oa;
}

export async function getProgressSnapshot(): Promise<ProgressSnapshot> {
  const [states, attempts, mistakes, reviews, weeklyActivity] =
    await Promise.all([
      db.skillStates.toArray(),
      db.attempts.toArray(),
      db.mistakes.toArray(),
      db.reviewItems.where('status').equals('scheduled').toArray(),
      getWeeklyActivity(),
    ]);

  const totalAttempts = attempts.length;
  const correct = attempts.filter((a) => a.correct).length;
  const overallAccuracy = totalAttempts ? correct / totalAttempts : 0;
  const recent = attempts.slice(-30);
  const recentAccuracy = recent.length
    ? recent.filter((a) => a.correct).length / recent.length
    : 0;
  const averageResponseSec = totalAttempts
    ? attempts.reduce((a, x) => a + x.responseTimeMs, 0) / totalAttempts / 1000
    : 0;

  // Mastery by section.
  const sectionAgg = new Map<SectionId, { sum: number; n: number }>();
  for (const s of states) {
    const agg = sectionAgg.get(s.section) ?? { sum: 0, n: 0 };
    agg.sum += masteryEstimate(s);
    agg.n += 1;
    sectionAgg.set(s.section, agg);
  }
  const masteryBySection = (
    ['english', 'math', 'reading', 'science'] as SectionId[]
  ).map((section) => {
    const agg = sectionAgg.get(section);
    return {
      section,
      label: SECTION_LABELS[section],
      mastery: agg && agg.n ? agg.sum / agg.n : 0,
    };
  });

  const summaries: SkillSummary[] = states
    .filter((s) => SKILL_BY_ID[s.skillId])
    .map((s) => ({
      skill: SKILL_BY_ID[s.skillId],
      state: s,
      mastery: masteryEstimate(s),
    }));

  const withData = summaries.filter((s) => s.state.totalAttempts >= 2);
  const strongest = [...withData]
    .sort((a, b) => b.mastery - a.mastery)
    .slice(0, 5);
  const weakest = [...withData]
    .sort((a, b) => a.mastery - b.mastery)
    .slice(0, 5);
  const improving = [...withData]
    .filter((s) => trend(s.state) > 0.15)
    .sort((a, b) => trend(b.state) - trend(a.state))
    .slice(0, 5);
  const declining = [...withData]
    .filter((s) => trend(s.state) < -0.15)
    .sort((a, b) => trend(a.state) - trend(b.state))
    .slice(0, 5);

  // Calibration.
  const calibration = {
    confidentCorrect: attempts.filter(
      (a) => a.confidence === 'confident' && a.correct,
    ).length,
    confidentWrong: attempts.filter(
      (a) => a.confidence === 'confident' && !a.correct,
    ).length,
    guessingCorrect: attempts.filter(
      (a) => a.confidence === 'guessing' && a.correct,
    ).length,
    total: attempts.length,
  };

  // Error pattern from mistake notebook.
  const errorMap = new Map<string, number>();
  for (const m of mistakes) {
    const key = m.userErrorReason ?? m.predictedErrorReason ?? 'unclassified';
    errorMap.set(key, (errorMap.get(key) ?? 0) + 1);
  }
  const errorPattern = [...errorMap.entries()]
    .map(([type, count]) => ({ type, count }))
    .sort((a, b) => b.count - a.count);

  // Blueprint coverage.
  const catCounts = new Map<string, number>();
  const recentAtt = attempts.slice(-120);
  for (const a of recentAtt) {
    const cat = SKILL_BY_ID[a.skillId]?.categoryId;
    if (cat) catCounts.set(cat, (catCounts.get(cat) ?? 0) + 1);
  }
  const bySection = new Map<SectionId, number>();
  for (const a of recentAtt) {
    const sec = SKILL_BY_ID[a.skillId]?.section;
    if (sec) bySection.set(sec, (bySection.get(sec) ?? 0) + 1);
  }
  const blueprintCoverage: BlueprintCoverageRow[] = CATEGORY_TARGETS.map(
    (t) => {
      const sectionTotal = bySection.get(t.section) ?? 0;
      const actualPct = sectionTotal
        ? ((catCounts.get(t.id) ?? 0) / sectionTotal) * 100
        : 0;
      const targetPct = categoryMidpoint(t);
      let status: BlueprintCoverageRow['status'] = 'on_target';
      if (sectionTotal >= 4) {
        if (actualPct < targetPct - 8) status = 'under';
        else if (actualPct > targetPct + 10) status = 'over';
      }
      return {
        categoryId: t.id,
        label: t.label,
        section: t.section,
        targetPct: Math.round(targetPct),
        actualPct: Math.round(actualPct),
        status,
      };
    },
  );

  const readinessIndex = computeReadiness(states, weeklyActivity);

  return {
    totalAttempts,
    overallAccuracy,
    recentAccuracy,
    averageResponseSec,
    masteryBySection,
    strongest,
    weakest,
    improving,
    declining,
    dueReviews: reviews.filter((r) => r.dueAt <= new Date().toISOString())
      .length,
    readinessIndex,
    calibration,
    errorPattern,
    weeklyActivity,
    blueprintCoverage,
  };
}

export interface FocusSlice {
  section: SectionId;
  label: string;
  questions: number;
  correct: number;
}

export interface TodayDigest {
  date: string;
  minutes: number;
  goalMinutes: number;
  questions: number;
  correct: number;
  accuracy: number;
  reviewsCompleted: number;
  sessionsCompleted: number;
  focus: FocusSlice[]; // sections practiced today, most-practiced first
  topSkillLabel: string | null;
  studied: boolean;
}

/** A visual, at-a-glance summary of what happened today. */
export async function getTodayDigest(
  goalMinutes: number,
  now = new Date(),
): Promise<TodayDigest> {
  const date = isoDay(now);
  const startOfDay = date + 'T00:00:00.000Z';

  const [day, attempts] = await Promise.all([
    db.dailyActivity.get(date),
    db.attempts.where('at').aboveOrEqual(startOfDay).toArray(),
  ]);

  const todaysAttempts = attempts.filter((a) => a.at.slice(0, 10) === date);

  const bySection = new Map<SectionId, FocusSlice>();
  const skillCount = new Map<string, number>();
  for (const a of todaysAttempts) {
    const sec = SKILL_BY_ID[a.skillId]?.section;
    if (sec) {
      const slice = bySection.get(sec) ?? {
        section: sec,
        label: SECTION_LABELS[sec],
        questions: 0,
        correct: 0,
      };
      slice.questions += 1;
      slice.correct += a.correct ? 1 : 0;
      bySection.set(sec, slice);
    }
    skillCount.set(a.skillId, (skillCount.get(a.skillId) ?? 0) + 1);
  }

  const focus = [...bySection.values()].sort(
    (a, b) => b.questions - a.questions,
  );
  const topSkillId =
    [...skillCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const topSkillLabel = topSkillId
    ? (SKILL_BY_ID[topSkillId]?.label ?? null)
    : null;

  const questions = day?.questions ?? todaysAttempts.length;
  const correct =
    day?.correct ?? todaysAttempts.filter((a) => a.correct).length;

  return {
    date,
    minutes: Math.round(day?.minutes ?? 0),
    goalMinutes,
    questions,
    correct,
    accuracy: questions ? correct / questions : 0,
    reviewsCompleted: day?.reviewsCompleted ?? 0,
    sessionsCompleted: day?.sessionsCompleted ?? 0,
    focus,
    topSkillLabel,
    studied: (day?.questions ?? 0) > 0,
  };
}

export async function getDueReviewCount(
  now = new Date().toISOString(),
): Promise<number> {
  const reviews = await db.reviewItems
    .where('status')
    .equals('scheduled')
    .toArray();
  return reviews.filter((r) => r.dueAt <= now).length;
}

export function recentAttemptsForSkill(
  attempts: Attempt[],
  skillId: string,
): Attempt[] {
  return attempts.filter((a) => a.skillId === skillId).slice(-20);
}
