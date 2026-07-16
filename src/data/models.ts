/** Runtime domain models persisted in IndexedDB (Dexie). */

import type { SectionId } from '../config/actBlueprint';
import type { Difficulty } from './questionSchema';

export type ConfidenceLevel = 'guessing' | 'unsure' | 'confident';

export type HintKind = 'concept' | 'starting_step' | 'partial_setup';

export type WeaknessType =
  | 'knowledge_gap'
  | 'recognition_gap'
  | 'application_gap'
  | 'speed_gap'
  | 'retention_gap'
  | 'careless_error_pattern';

export type WeaknessStatus =
  | 'insufficient_data'
  | 'possible'
  | 'confirmed'
  | 'improving'
  | 'stable'
  | 'mastered';

export type ErrorReason =
  | 'unknown_concept'
  | 'not_recognized'
  | 'no_start'
  | 'misread_question'
  | 'wrong_elimination'
  | 'algebra_error'
  | 'arithmetic_error'
  | 'rushed'
  | 'ran_out_of_time'
  | 'guessed'
  | 'not_sure';

export const ERROR_REASON_LABELS: Record<ErrorReason, string> = {
  unknown_concept: 'I did not know the rule or concept',
  not_recognized: 'I knew it but did not recognize it',
  no_start: 'I did not know how to start',
  misread_question: 'I misunderstood the question',
  wrong_elimination: 'I eliminated an answer incorrectly',
  algebra_error: 'I made an algebra mistake',
  arithmetic_error: 'I made an arithmetic mistake',
  rushed: 'I rushed',
  ran_out_of_time: 'I ran out of time',
  guessed: 'I guessed',
  not_sure: 'I am not sure',
};

export interface SkillState {
  skillId: string;
  section: SectionId;
  alpha: number;
  beta: number;
  knowledgeMastery: number; // 0..1
  speedMastery: number; // 0..1
  retentionStrength: number; // 0..1
  confidenceCalibration: number; // -1..1 (negative = overconfident)
  totalAttempts: number;
  correctAttempts: number;
  independentCorrectAttempts: number;
  hintedAttempts: number;
  recentAccuracy: number; // 0..1 over recent window
  averageResponseTimeMs: number;
  expectedResponseTimeMs: number;
  currentDifficulty: number; // 1..5 (float allowed)
  lastPracticedAt: string | null;
  nextReviewAt: string | null;
  consecutiveCorrect: number;
  consecutiveIncorrect: number;
  distinctPracticeDays: string[]; // ISO date strings (yyyy-mm-dd)
  hadDelayedReviewSuccess: boolean;
  maxDifficultyCleared: number;
  weaknessStatus: WeaknessStatus;
  weaknessTypes: WeaknessType[];
  /** Rolling window of recent outcomes for trend/speed logic. */
  recentOutcomes: RecentOutcome[];
}

export interface RecentOutcome {
  correct: boolean;
  independent: boolean;
  difficulty: number;
  responseTimeMs: number;
  ratioToExpected: number;
  confidence: ConfidenceLevel;
  at: string;
}

export interface Attempt {
  id?: number;
  questionId: string;
  skillId: string;
  section: SectionId;
  sessionId: string | null;
  correct: boolean;
  chosenChoiceId: string | null;
  correctChoiceId: string;
  responseTimeMs: number;
  expectedSeconds: number;
  difficulty: Difficulty | number;
  confidence: ConfidenceLevel;
  hintsUsed: HintKind[];
  isReview: boolean;
  reviewIntervalDays: number | null;
  inPassage: boolean;
  at: string;
}

export interface ReviewItem {
  id?: number;
  skillId: string;
  questionId: string;
  section: SectionId;
  intervalIndex: number; // index into review schedule
  dueAt: string;
  lastReviewedAt: string | null;
  status: 'scheduled' | 'done' | 'lapsed';
  retentionStrength: number;
  createdAt: string;
}

export interface Mistake {
  id?: number;
  questionId: string;
  skillId: string;
  section: SectionId;
  userChoiceId: string | null;
  correctChoiceId: string;
  difficulty: Difficulty | number;
  responseTimeMs: number;
  confidence: ConfidenceLevel;
  hintsUsed: HintKind[];
  userErrorReason: ErrorReason | null;
  predictedErrorReason: WeaknessType | null;
  notes: string;
  reviewStatus: 'open' | 'reviewing' | 'resolved';
  nextReviewAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SavedQuestion {
  id?: number;
  questionId: string;
  note: string;
  createdAt: string;
}

export type SessionMode =
  | 'daily'
  | 'quick5'
  | 'standard10'
  | 'focused15'
  | 'deep20'
  | 'english_clinic'
  | 'comma_clinic'
  | 'writers_goal'
  | 'sva'
  | 'matrix_lab'
  | 'late_math'
  | 'reading_speed'
  | 'passage_mapping'
  | 'science_maintenance'
  | 'blueprint_mix'
  | 'full_section'
  | 'diagnostic'
  | 'custom';

export interface SessionRecord {
  id: string;
  mode: SessionMode;
  section: SectionId | 'mixed';
  startedAt: string;
  completedAt: string | null;
  questionIds: string[];
  answered: number;
  correct: number;
  totalTimeMs: number;
  skillsPracticed: string[];
  targetDurationMin: number;
}

export interface DailyActivity {
  date: string; // yyyy-mm-dd
  minutes: number;
  questions: number;
  correct: number;
  sessionsCompleted: number;
  reviewsCompleted: number;
}

export interface UserProfile {
  id: 'me';
  createdAt: string;
  onboardingComplete: boolean;
  testDate: string | null;
  targetScore: number | null;
  dailyMinutes: number;
  preferredTime: string | null; // "HH:mm"
  includeScience: boolean;
  selfReportedWeaknesses: string[];
  streak: number;
  longestStreak: number;
  lastActiveDate: string | null;
  readinessIndex: number; // 0..100
}

export interface AppSettings {
  id: 'settings';
  theme: 'system' | 'light' | 'dark';
  reduceMotion: boolean;
  soundEffects: boolean;
  showTimer: boolean;
  installGuideDismissed: boolean;
  updatedAt: string;
}

export interface ContentVersion {
  id: 'content';
  questionBankVersion: string;
  blueprintVersion: string;
  installedAt: string;
}
