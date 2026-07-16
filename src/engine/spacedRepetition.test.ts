import { describe, it, expect } from 'vitest';
import {
  advanceReview,
  isDue,
  nextIntervalIndex,
  scheduleNewReview,
} from './spacedRepetition';

describe('spaced repetition', () => {
  it('schedules a new review for the first interval (1 day out)', () => {
    const item = scheduleNewReview(
      'eng.comma.intro',
      'q1',
      'english',
      '2026-07-16T10:00:00.000Z',
    );
    expect(item.intervalIndex).toBe(1);
    expect(new Date(item.dueAt).getTime()).toBeGreaterThan(
      Date.parse('2026-07-16T10:00:00.000Z'),
    );
  });

  it('advances the interval on an independent correct review', () => {
    expect(nextIntervalIndex(2, { correct: true, hintsUsed: [], intervalDays: 3 })).toBe(3);
  });

  it('does not advance when a hint was needed', () => {
    expect(
      nextIntervalIndex(3, { correct: true, hintsUsed: ['concept'], intervalDays: 7 }),
    ).toBe(3);
  });

  it('steps back on an incorrect review', () => {
    expect(nextIntervalIndex(4, { correct: false, hintsUsed: [], intervalDays: 14 })).toBe(2);
  });

  it('never steps the index below 1', () => {
    expect(nextIntervalIndex(1, { correct: false, hintsUsed: [], intervalDays: 1 })).toBe(1);
  });

  it('advanceReview increases retention on success and moves the due date', () => {
    const item = scheduleNewReview('s', 'q', 'math', '2026-07-16T10:00:00.000Z');
    const advanced = advanceReview(
      item,
      { correct: true, hintsUsed: [], intervalDays: 1 },
      '2026-07-17T10:00:00.000Z',
    );
    expect(advanced.retentionStrength).toBeGreaterThan(item.retentionStrength);
    expect(advanced.intervalIndex).toBe(2);
    expect(advanced.lastReviewedAt).toBe('2026-07-17T10:00:00.000Z');
  });

  it('isDue is true only once the due time has passed', () => {
    const item = scheduleNewReview('s', 'q', 'math', '2026-07-16T10:00:00.000Z');
    expect(isDue(item, '2026-07-16T10:00:00.000Z')).toBe(false);
    expect(isDue(item, '2026-07-20T10:00:00.000Z')).toBe(true);
  });
});
