/**
 * Centralized configuration for the current ("Enhanced") ACT format.
 *
 * This is the single source of truth for section counts and timing. The rest of
 * the app must read timing/question counts from here — never hardcode legacy
 * values (75 English, 60 Math, required Science in the Composite, etc.).
 */

export type SectionId = 'english' | 'math' | 'reading' | 'science';

export interface SectionBlueprint {
  totalQuestions: number;
  scoredQuestions: number;
  fieldTestQuestions: number;
  minutes: number;
  calculatorAllowed: boolean;
  optional?: boolean;
}

export const ACT_BLUEPRINT = {
  id: 'act-enhanced-2026',
  label: 'Enhanced ACT, verified 2026',
  lastVerified: '2026-07-16',
  compositeSections: ['english', 'math', 'reading'] as SectionId[],
  sections: {
    english: {
      totalQuestions: 50,
      scoredQuestions: 40,
      fieldTestQuestions: 10,
      minutes: 35,
      calculatorAllowed: false,
    },
    math: {
      totalQuestions: 45,
      scoredQuestions: 41,
      fieldTestQuestions: 4,
      minutes: 50,
      calculatorAllowed: true,
    },
    reading: {
      totalQuestions: 36,
      scoredQuestions: 27,
      fieldTestQuestions: 9,
      minutes: 40,
      calculatorAllowed: false,
    },
    science: {
      optional: true,
      totalQuestions: 40,
      scoredQuestions: 34,
      fieldTestQuestions: 6,
      minutes: 40,
      calculatorAllowed: false,
    },
  } satisfies Record<SectionId, SectionBlueprint>,
} as const;

export const BLUEPRINT_VERSION = ACT_BLUEPRINT.id;

export const SECTION_LABELS: Record<SectionId, string> = {
  english: 'English',
  math: 'Math',
  reading: 'Reading',
  science: 'Science',
};

export const SECTION_ORDER: SectionId[] = [
  'english',
  'math',
  'reading',
  'science',
];

/** Section-level per-question pace, derived from the blueprint (informational). */
export function secondsPerQuestion(section: SectionId): number {
  const s = ACT_BLUEPRINT.sections[section];
  return Math.round((s.minutes * 60) / s.totalQuestions);
}

/**
 * Reporting-category blueprint targets (percentage of scored operational
 * questions). Ranges are stored as [min, max]; a nominal midpoint is derived.
 */
export interface CategoryTarget {
  id: string;
  section: SectionId;
  label: string;
  /** Percent range of the section this reporting category should occupy. */
  range: [number, number];
}

export const CATEGORY_TARGETS: CategoryTarget[] = [
  // English
  {
    id: 'eng.production',
    section: 'english',
    label: 'Production of Writing',
    range: [38, 43],
  },
  {
    id: 'eng.knowledge',
    section: 'english',
    label: 'Knowledge of Language',
    range: [18, 23],
  },
  {
    id: 'eng.conventions',
    section: 'english',
    label: 'Conventions of Standard English',
    range: [38, 43],
  },
  // Math
  {
    id: 'math.higher',
    section: 'math',
    label: 'Preparing for Higher Math',
    range: [78, 82],
  },
  {
    id: 'math.essential',
    section: 'math',
    label: 'Integrating Essential Skills',
    range: [18, 22],
  },
  // Reading
  {
    id: 'read.key',
    section: 'reading',
    label: 'Key Ideas and Details',
    range: [44, 52],
  },
  {
    id: 'read.craft',
    section: 'reading',
    label: 'Craft and Structure',
    range: [26, 33],
  },
  {
    id: 'read.integration',
    section: 'reading',
    label: 'Integration of Knowledge and Ideas',
    range: [19, 26],
  },
  // Science
  {
    id: 'sci.data',
    section: 'science',
    label: 'Interpretation of Data',
    range: [38, 50],
  },
  {
    id: 'sci.investigation',
    section: 'science',
    label: 'Scientific Investigation',
    range: [18, 32],
  },
  {
    id: 'sci.evaluation',
    section: 'science',
    label: 'Evaluation of Models, Inferences & Results',
    range: [24, 38],
  },
];

export function categoryMidpoint(t: CategoryTarget): number {
  return (t.range[0] + t.range[1]) / 2;
}

export function categoriesForSection(section: SectionId): CategoryTarget[] {
  return CATEGORY_TARGETS.filter((c) => c.section === section);
}
