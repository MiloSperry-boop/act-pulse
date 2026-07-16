import { describe, it, expect, beforeEach } from 'vitest';
import { db, ensureSeedRows } from './db';
import {
  exportAllData,
  parseExport,
  importAllData,
  clearAllProgress,
} from './exportImport';
import { buildDailyReminderIcs } from '../services/reminders';

describe('export / import round-trip', () => {
  beforeEach(async () => {
    await db.delete();
    await db.open();
    await ensureSeedRows();
  });

  it('exports a valid envelope that re-parses', async () => {
    const env = await exportAllData();
    expect(env.app).toBe('act-pulse');
    expect(() => parseExport(env)).not.toThrow();
  });

  it('restores attempts on import', async () => {
    await db.attempts.add({
      questionId: 'q1',
      skillId: 'eng.comma.intro',
      section: 'english',
      sessionId: null,
      correct: true,
      chosenChoiceId: 'A',
      correctChoiceId: 'A',
      responseTimeMs: 12000,
      expectedSeconds: 35,
      difficulty: 2,
      confidence: 'confident',
      hintsUsed: [],
      isReview: false,
      reviewIntervalDays: null,
      inPassage: false,
      at: '2026-07-16T10:00:00.000Z',
    });
    const env = await exportAllData();
    await clearAllProgress();
    expect(await db.attempts.count()).toBe(0);
    const res = await importAllData(env);
    expect(res.ok).toBe(true);
    expect(await db.attempts.count()).toBe(1);
  });

  it('rejects an envelope from a newer schema version', () => {
    expect(() =>
      parseExport({
        schemaVersion: 999,
        app: 'act-pulse',
        exportedAt: 'now',
        profile: [],
        settings: [],
        attempts: [],
        skillStates: [],
        reviewItems: [],
        mistakes: [],
        sessions: [],
        savedQuestions: [],
        dailyActivity: [],
      }),
    ).toThrow();
  });
});

describe('reminder .ics generation', () => {
  it('produces a valid daily recurring VEVENT', () => {
    const ics = buildDailyReminderIcs('17:30');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('RRULE:FREQ=DAILY');
    expect(ics).toContain('BEGIN:VEVENT');
    expect(ics).toContain('END:VCALENDAR');
  });
});
