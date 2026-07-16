import { z } from 'zod';
import { db } from './db';

export const EXPORT_SCHEMA_VERSION = 1;

const ExportEnvelopeSchema = z.object({
  schemaVersion: z.number().int(),
  app: z.literal('act-pulse'),
  exportedAt: z.string(),
  profile: z.array(z.any()),
  settings: z.array(z.any()),
  attempts: z.array(z.any()),
  skillStates: z.array(z.any()),
  reviewItems: z.array(z.any()),
  mistakes: z.array(z.any()),
  sessions: z.array(z.any()),
  savedQuestions: z.array(z.any()),
  dailyActivity: z.array(z.any()),
});

export type ExportEnvelope = z.infer<typeof ExportEnvelopeSchema>;

export async function exportAllData(): Promise<ExportEnvelope> {
  const [
    profile,
    settings,
    attempts,
    skillStates,
    reviewItems,
    mistakes,
    sessions,
    savedQuestions,
    dailyActivity,
  ] = await Promise.all([
    db.userProfile.toArray(),
    db.settings.toArray(),
    db.attempts.toArray(),
    db.skillStates.toArray(),
    db.reviewItems.toArray(),
    db.mistakes.toArray(),
    db.sessions.toArray(),
    db.savedQuestions.toArray(),
    db.dailyActivity.toArray(),
  ]);

  return {
    schemaVersion: EXPORT_SCHEMA_VERSION,
    app: 'act-pulse',
    exportedAt: new Date().toISOString(),
    profile,
    settings,
    attempts,
    skillStates,
    reviewItems,
    mistakes,
    sessions,
    savedQuestions,
    dailyActivity,
  };
}

export interface ImportResult {
  ok: boolean;
  message: string;
  counts?: Record<string, number>;
}

export function parseExport(raw: unknown): ExportEnvelope {
  const parsed = ExportEnvelopeSchema.parse(raw);
  if (parsed.schemaVersion > EXPORT_SCHEMA_VERSION) {
    throw new Error(
      `This file was exported from a newer version of ACT Pulse (schema ${parsed.schemaVersion}).`,
    );
  }
  return parsed;
}

/** Replaces all local data with the imported envelope. Caller confirms first. */
export async function importAllData(env: ExportEnvelope): Promise<ImportResult> {
  try {
    await db.transaction(
      'rw',
      [
        db.userProfile,
        db.settings,
        db.attempts,
        db.skillStates,
        db.reviewItems,
        db.mistakes,
        db.sessions,
        db.savedQuestions,
        db.dailyActivity,
      ],
      async () => {
        await Promise.all([
          db.userProfile.clear(),
          db.settings.clear(),
          db.attempts.clear(),
          db.skillStates.clear(),
          db.reviewItems.clear(),
          db.mistakes.clear(),
          db.sessions.clear(),
          db.savedQuestions.clear(),
          db.dailyActivity.clear(),
        ]);
        await Promise.all([
          db.userProfile.bulkPut(env.profile),
          db.settings.bulkPut(env.settings),
          db.attempts.bulkPut(env.attempts),
          db.skillStates.bulkPut(env.skillStates),
          db.reviewItems.bulkPut(env.reviewItems),
          db.mistakes.bulkPut(env.mistakes),
          db.sessions.bulkPut(env.sessions),
          db.savedQuestions.bulkPut(env.savedQuestions),
          db.dailyActivity.bulkPut(env.dailyActivity),
        ]);
      },
    );
    return {
      ok: true,
      message: 'Import complete. Your progress has been restored.',
      counts: {
        attempts: env.attempts.length,
        skillStates: env.skillStates.length,
        mistakes: env.mistakes.length,
        sessions: env.sessions.length,
      },
    };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : 'Import failed.',
    };
  }
}

export async function clearAllProgress(): Promise<void> {
  await db.transaction(
    'rw',
    [
      db.attempts,
      db.skillStates,
      db.reviewItems,
      db.mistakes,
      db.sessions,
      db.savedQuestions,
      db.dailyActivity,
    ],
    async () => {
      await Promise.all([
        db.attempts.clear(),
        db.skillStates.clear(),
        db.reviewItems.clear(),
        db.mistakes.clear(),
        db.sessions.clear(),
        db.savedQuestions.clear(),
        db.dailyActivity.clear(),
      ]);
    },
  );
}
