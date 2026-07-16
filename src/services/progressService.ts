/**
 * The core write path. Recording an attempt updates: the attempt log, the
 * skill state (mastery/weakness/difficulty), review scheduling, the mistake
 * notebook, and daily activity + streak.
 */

import { db } from '../data/db';
import type {
  Attempt,
  ConfidenceLevel,
  ErrorReason,
  HintKind,
  Mistake,
  SkillState,
} from '../data/models';
import type { ACTQuestion } from '../data/questionSchema';
import { SKILL_BY_ID } from '../config/skills';
import {
  applyAttempt,
  createSkillState,
  type AttemptEvidence,
} from '../engine/adaptiveEngine';
import {
  adjustDifficulty,
  classifyStatus,
  diagnoseWeaknessTypes,
} from '../engine/weakness';
import {
  advanceReview,
  computeNextReviewAt,
  scheduleNewReview,
} from '../engine/spacedRepetition';

export interface RecordAttemptInput {
  question: ACTQuestion;
  chosenChoiceId: string | null;
  correct: boolean;
  responseTimeMs: number;
  confidence: ConfidenceLevel;
  hintsUsed: HintKind[];
  sessionId: string | null;
  isReview: boolean;
  inPassage: boolean;
  now?: string;
}

export async function getOrCreateSkillState(
  skillId: string,
): Promise<SkillState> {
  const existing = await db.skillStates.get(skillId);
  if (existing) return existing;
  const skill = SKILL_BY_ID[skillId];
  const fresh = createSkillState(skillId, skill?.section ?? 'english');
  await db.skillStates.put(fresh);
  return fresh;
}

function todayKey(iso: string): string {
  return iso.slice(0, 10);
}

/** Records a single answered question and cascades all downstream updates. */
export async function recordAttempt(
  input: RecordAttemptInput,
): Promise<{ skillState: SkillState }> {
  const now = input.now ?? new Date().toISOString();
  const q = input.question;
  const skillId = q.microSkill;

  const prev = await getOrCreateSkillState(skillId);

  // Determine the review interval (days) if this is a review.
  let reviewIntervalDays: number | null = null;
  const dueReviews = await db.reviewItems
    .where('skillId')
    .equals(skillId)
    .and((r) => r.status === 'scheduled')
    .toArray();
  const matchingReview =
    dueReviews.find((r) => r.questionId === q.id) ?? dueReviews[0];
  if (input.isReview && matchingReview && prev.lastPracticedAt) {
    reviewIntervalDays =
      (new Date(now).getTime() - new Date(prev.lastPracticedAt).getTime()) /
      (1000 * 60 * 60 * 24);
  }

  const evidence: AttemptEvidence = {
    correct: input.correct,
    difficulty: q.difficulty,
    responseTimeMs: input.responseTimeMs,
    hintsUsed: input.hintsUsed,
    confidence: input.confidence,
    isReview: input.isReview,
    reviewIntervalDays,
    at: now,
  };

  let next = applyAttempt(prev, evidence);
  next = {
    ...next,
    expectedResponseTimeMs: q.expectedSeconds * 1000,
    currentDifficulty: adjustDifficulty(next),
  };
  next.weaknessStatus = classifyStatus(next);
  next.weaknessTypes = diagnoseWeaknessTypes(next);
  next.nextReviewAt = computeNextReviewAt(next, now);

  const attempt: Attempt = {
    questionId: q.id,
    skillId,
    section: q.section,
    sessionId: input.sessionId,
    correct: input.correct,
    chosenChoiceId: input.chosenChoiceId,
    correctChoiceId: q.correctChoiceId,
    responseTimeMs: input.responseTimeMs,
    expectedSeconds: q.expectedSeconds,
    difficulty: q.difficulty,
    confidence: input.confidence,
    hintsUsed: input.hintsUsed,
    isReview: input.isReview,
    reviewIntervalDays,
    inPassage: input.inPassage,
    at: now,
  };

  await db.transaction(
    'rw',
    db.attempts,
    db.skillStates,
    db.reviewItems,
    db.mistakes,
    db.dailyActivity,
    async () => {
      await db.attempts.add(attempt);
      await db.skillStates.put(next);

      // Review scheduling.
      if (input.isReview && matchingReview?.id != null) {
        await db.reviewItems.update(
          matchingReview.id,
          advanceReview(
            matchingReview,
            {
              correct: input.correct,
              hintsUsed: input.hintsUsed,
              intervalDays: reviewIntervalDays ?? 0,
            },
            now,
          ),
        );
      } else if (!input.correct) {
        // Missed a new question → schedule a spaced review.
        await db.reviewItems.add(
          scheduleNewReview(skillId, q.id, q.section, now),
        );
      }

      // Mistake notebook.
      if (!input.correct) {
        const mistake: Mistake = {
          questionId: q.id,
          skillId,
          section: q.section,
          userChoiceId: input.chosenChoiceId,
          correctChoiceId: q.correctChoiceId,
          difficulty: q.difficulty,
          responseTimeMs: input.responseTimeMs,
          confidence: input.confidence,
          hintsUsed: input.hintsUsed,
          userErrorReason: null,
          predictedErrorReason: next.weaknessTypes[0] ?? null,
          notes: '',
          reviewStatus: 'open',
          nextReviewAt: next.nextReviewAt,
          createdAt: now,
          updatedAt: now,
        };
        await db.mistakes.add(mistake);
      }

      // Daily activity.
      const key = todayKey(now);
      const day = (await db.dailyActivity.get(key)) ?? {
        date: key,
        minutes: 0,
        questions: 0,
        correct: 0,
        sessionsCompleted: 0,
        reviewsCompleted: 0,
      };
      day.questions += 1;
      day.correct += input.correct ? 1 : 0;
      day.minutes += input.responseTimeMs / 60000;
      if (input.isReview) day.reviewsCompleted += 1;
      await db.dailyActivity.put(day);
    },
  );

  return { skillState: next };
}

/** Attach the user's self-reported error reason to the most recent mistake. */
export async function setMistakeReason(
  questionId: string,
  reason: ErrorReason,
  now = new Date().toISOString(),
): Promise<void> {
  const mistakes = await db.mistakes
    .where('questionId')
    .equals(questionId)
    .reverse()
    .sortBy('createdAt');
  const latest = mistakes[mistakes.length - 1];
  if (latest?.id != null) {
    await db.mistakes.update(latest.id, {
      userErrorReason: reason,
      updatedAt: now,
    });
  }
}

/** Update the streak based on activity today vs. the last active date. */
export async function bumpStreak(
  now = new Date().toISOString(),
): Promise<{ streak: number }> {
  const profile = await db.userProfile.get('me');
  if (!profile) return { streak: 0 };
  const today = todayKey(now);
  if (profile.lastActiveDate === today) {
    return { streak: profile.streak };
  }
  const yesterday = todayKey(
    new Date(new Date(now).getTime() - 86400000).toISOString(),
  );
  const streak =
    profile.lastActiveDate === yesterday ? profile.streak + 1 : 1;
  const longestStreak = Math.max(profile.longestStreak, streak);
  await db.userProfile.update('me', {
    streak,
    longestStreak,
    lastActiveDate: today,
  });
  return { streak };
}
