import Dexie, { type Table } from 'dexie';
import type {
  Attempt,
  AppSettings,
  ContentVersion,
  DailyActivity,
  Mistake,
  ReviewItem,
  SavedQuestion,
  SessionRecord,
  SkillState,
  UserProfile,
} from './models';

export const DEFAULT_PROFILE: UserProfile = {
  id: 'me',
  createdAt: new Date(0).toISOString(),
  onboardingComplete: false,
  testDate: null,
  targetScore: null,
  dailyMinutes: 15,
  preferredTime: '17:00',
  includeScience: true,
  selfReportedWeaknesses: [],
  streak: 0,
  longestStreak: 0,
  lastActiveDate: null,
  readinessIndex: 0,
};

export const DEFAULT_SETTINGS: AppSettings = {
  id: 'settings',
  theme: 'system',
  reduceMotion: false,
  soundEffects: false,
  showTimer: true,
  installGuideDismissed: false,
  updatedAt: new Date(0).toISOString(),
};

export class ActPulseDB extends Dexie {
  userProfile!: Table<UserProfile, string>;
  settings!: Table<AppSettings, string>;
  attempts!: Table<Attempt, number>;
  skillStates!: Table<SkillState, string>;
  reviewItems!: Table<ReviewItem, number>;
  sessions!: Table<SessionRecord, string>;
  mistakes!: Table<Mistake, number>;
  savedQuestions!: Table<SavedQuestion, number>;
  dailyActivity!: Table<DailyActivity, string>;
  contentVersions!: Table<ContentVersion, string>;

  constructor() {
    super('act-pulse');

    // Version 1 — initial schema.
    this.version(1).stores({
      userProfile: 'id',
      settings: 'id',
      attempts: '++id, questionId, skillId, section, sessionId, at, correct',
      skillStates: 'skillId, section, weaknessStatus, nextReviewAt',
      reviewItems: '++id, skillId, questionId, section, dueAt, status',
      sessions: 'id, mode, startedAt, completedAt',
      mistakes: '++id, questionId, skillId, section, reviewStatus, createdAt',
      savedQuestions: '++id, questionId, createdAt',
      dailyActivity: 'date',
      contentVersions: 'id',
    });
  }
}

export const db = new ActPulseDB();

/** Ensure singleton rows exist. Idempotent. */
export async function ensureSeedRows(): Promise<void> {
  await db.transaction(
    'rw',
    db.userProfile,
    db.settings,
    db.contentVersions,
    async () => {
      const profile = await db.userProfile.get('me');
      if (!profile) {
        await db.userProfile.put({
          ...DEFAULT_PROFILE,
          createdAt: new Date().toISOString(),
        });
      }
      const settings = await db.settings.get('settings');
      if (!settings) {
        await db.settings.put({
          ...DEFAULT_SETTINGS,
          updatedAt: new Date().toISOString(),
        });
      }
    },
  );
}
