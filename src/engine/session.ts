/** Session composition — turns a mode + context into an ordered question list. */

import type { ACTQuestion } from '../data/questionSchema';
import type { SessionMode } from '../data/models';
import type { SectionId } from '../config/actBlueprint';
import { SKILL_BY_ID } from '../config/skills';
import { selectQuestions, type SelectionContext } from './selection';
import { type RNG } from './rng';

export interface SessionConfig {
  mode: SessionMode;
  targetDurationMin: number;
  includeScience: boolean;
}

export interface SessionPlan {
  mode: SessionMode;
  section: SectionId | 'mixed';
  questionIds: string[];
  targetDurationMin: number;
  focused: boolean;
}

/** Rough question-count band per duration. */
export function questionCountForMinutes(min: number): number {
  if (min <= 5) return 6;
  if (min <= 10) return 10;
  if (min <= 15) return 15;
  if (min <= 20) return 20;
  return Math.round(min * 1.1);
}

/** Mode → candidate filter and metadata. */
interface ModeSpec {
  focused: boolean;
  section: SectionId | 'mixed';
  minutes?: number;
  filter: (q: ACTQuestion) => boolean;
}

function skillMatch(prefixes: string[]) {
  return (q: ACTQuestion) =>
    prefixes.some((p) => q.microSkill.startsWith(p));
}

export const MODE_SPECS: Record<SessionMode, ModeSpec> = {
  daily: { focused: false, section: 'mixed', filter: () => true },
  quick5: { focused: false, section: 'mixed', minutes: 5, filter: () => true },
  standard10: {
    focused: false,
    section: 'mixed',
    minutes: 10,
    filter: () => true,
  },
  focused15: {
    focused: false,
    section: 'mixed',
    minutes: 15,
    filter: () => true,
  },
  deep20: { focused: false, section: 'mixed', minutes: 20, filter: () => true },
  blueprint_mix: { focused: false, section: 'mixed', filter: () => true },
  diagnostic: { focused: false, section: 'mixed', filter: () => true },
  custom: { focused: false, section: 'mixed', filter: () => true },
  english_clinic: {
    focused: true,
    section: 'english',
    filter: (q) => q.section === 'english',
  },
  comma_clinic: {
    focused: true,
    section: 'english',
    filter: skillMatch(['eng.comma']),
  },
  writers_goal: {
    focused: true,
    section: 'english',
    filter: skillMatch(['eng.prod']),
  },
  sva: {
    focused: true,
    section: 'english',
    filter: skillMatch(['eng.usage.sva']),
  },
  matrix_lab: {
    focused: true,
    section: 'math',
    filter: skillMatch(['math.nq.matrix']),
  },
  late_math: {
    focused: true,
    section: 'math',
    filter: (q) => q.section === 'math' && q.difficulty >= 4,
  },
  reading_speed: {
    focused: true,
    section: 'reading',
    filter: (q) => q.section === 'reading',
  },
  passage_mapping: {
    focused: true,
    section: 'reading',
    filter: (q) => q.section === 'reading',
  },
  science_maintenance: {
    focused: true,
    section: 'science',
    filter: (q) => q.section === 'science',
  },
  full_section: {
    focused: false,
    section: 'mixed',
    filter: () => true,
  },
};

/**
 * Build a session plan. For adaptive modes this follows the phase structure:
 * warm-up review → primary weakness → secondary weakness → challenge →
 * blueprint maintenance, then fills to the target count.
 */
export function buildSession(
  config: SessionConfig,
  candidates: ACTQuestion[],
  ctx: SelectionContext,
  rng: RNG,
): SessionPlan {
  const spec = MODE_SPECS[config.mode];
  const count = questionCountForMinutes(config.targetDurationMin);

  const pool = candidates.filter(
    (q) =>
      spec.filter(q) && (config.includeScience || q.section !== 'science'),
  );

  // Focused modes: straight weighted selection within the pool.
  if (spec.focused || config.mode === 'full_section') {
    const qs = selectQuestions(pool, ctx, count, rng, {
      focusedMode: spec.focused,
    });
    return {
      mode: config.mode,
      section: spec.section,
      questionIds: qs.map((q) => q.id),
      targetDurationMin: config.targetDurationMin,
      focused: spec.focused,
    };
  }

  // Adaptive mix — phase-based composition.
  const chosen: ACTQuestion[] = [];
  const used = new Set<string>();
  const take = (subset: ACTQuestion[], n: number, focused = false) => {
    const picks = selectQuestions(
      subset.filter((q) => !used.has(q.id)),
      ctx,
      n,
      rng,
      { focusedMode: focused },
    );
    for (const p of picks) {
      if (chosen.length < count && !used.has(p.id)) {
        chosen.push(p);
        used.add(p.id);
      }
    }
  };

  const dueSkills = new Set(
    [...ctx.reviewItemsBySkill.entries()]
      .filter(([, items]) => items.some((i) => i.status === 'scheduled'))
      .map(([skillId]) => skillId),
  );
  const reviewPool = pool.filter((q) => dueSkills.has(q.microSkill));
  const weaknessSkills = new Set(
    [...ctx.skillStates.values()]
      .filter(
        (s) =>
          s.weaknessStatus === 'confirmed' || s.weaknessStatus === 'possible',
      )
      .map((s) => s.skillId),
  );
  const weaknessPool = pool.filter((q) => weaknessSkills.has(q.microSkill));
  const challengePool = pool.filter((q) => q.difficulty >= 4);

  // Phase 1: warm-up reviews (~1-2, part of the 20-25% review budget).
  take(reviewPool.length ? reviewPool : pool, Math.max(1, Math.round(count * 0.1)));
  // Phase 2 & 3: primary + secondary weakness (~40-45%).
  take(
    weaknessPool.length ? weaknessPool : pool,
    Math.max(2, Math.round(count * 0.42)),
  );
  // Phase 4: challenge (~15%).
  take(
    challengePool.length ? challengePool : pool,
    Math.max(1, Math.round(count * 0.15)),
  );
  // Phase 5: blueprint maintenance / remaining reviews (~15-20%).
  take(reviewPool.length ? reviewPool : pool, Math.round(count * 0.13));
  // Fill remainder with general adaptive picks (exploration + maintenance).
  take(pool, count - chosen.length);

  return {
    mode: config.mode,
    section: 'mixed',
    questionIds: chosen.slice(0, count).map((q) => q.id),
    targetDurationMin: config.targetDurationMin,
    focused: false,
  };
}

/** Diagnostic composition: broad coverage with the reported weaknesses. */
export function buildDiagnostic(
  candidates: ACTQuestion[],
  includeScience: boolean,
  rng: RNG,
): string[] {
  const bySection = (section: SectionId, n: number) => {
    const pool = candidates.filter((q) => q.section === section);
    // Spread difficulty: sort into buckets and interleave.
    const sorted = [...pool].sort((a, b) => a.difficulty - b.difficulty);
    const step = Math.max(1, Math.floor(sorted.length / n));
    const out: ACTQuestion[] = [];
    for (let i = 0; i < sorted.length && out.length < n; i += step) {
      out.push(sorted[i]);
    }
    // top-up
    for (const q of shuffleLite(pool, rng)) {
      if (out.length >= n) break;
      if (!out.includes(q)) out.push(q);
    }
    return out.slice(0, n);
  };

  const eng = bySection('english', 10);
  const math = bySection('math', 10);
  const read = bySection('reading', 4);
  const sci = includeScience ? bySection('science', 4) : [];
  return [...eng, ...math, ...read, ...sci].map((q) => q.id);
}

function shuffleLite<T>(arr: T[], rng: RNG): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function skillLabel(skillId: string): string {
  return SKILL_BY_ID[skillId]?.label ?? skillId;
}
