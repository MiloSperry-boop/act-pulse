import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import type { ACTQuestion } from '../data/questionSchema';
import type { ErrorReason, SessionMode, SessionRecord } from '../data/models';
import {
  prepareSession,
  completeSession,
  durationForMode,
} from '../services/sessionService';
import {
  recordAttempt,
  bumpStreak,
  setMistakeReason,
} from '../services/progressService';
import { db } from '../data/db';
import { useAppStore } from '../state/appStore';
import { QuestionView, type AnswerResult } from '../components/QuestionView';
import { ProgressRing } from '../components/ProgressRing';
import { SessionRecap } from './SessionRecap';

const MODE_TITLES: Partial<Record<SessionMode, string>> = {
  daily: "Today's session",
  quick5: 'Quick 5',
  standard10: 'Standard 10',
  focused15: 'Focused 15',
  deep20: 'Deep Practice 20',
  english_clinic: 'English Clinic',
  comma_clinic: 'Comma Clinic',
  writers_goal: "Writer's Goal",
  sva: 'Subject-Verb Agreement',
  late_math: 'Late-Section Math',
  reading_speed: 'Reading Speed',
  passage_mapping: 'Passage Mapping',
  science_maintenance: 'Science Maintenance',
  blueprint_mix: 'ACT Blueprint Mix',
  full_section: 'Full Section Simulation',
  diagnostic: 'Diagnostic',
};

interface RecapData {
  answered: number;
  correct: number;
  totalTimeMs: number;
  skills: string[];
  mode: SessionMode;
}

export function SessionScreen() {
  const { mode = 'daily' } = useParams<{ mode: string }>();
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);

  const [loading, setLoading] = useState(true);
  const [record, setRecord] = useState<SessionRecord | null>(null);
  const [questions, setQuestions] = useState<ACTQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<AnswerResult[]>([]);
  const [recap, setRecap] = useState<RecapData | null>(null);
  const [saved, setSaved] = useState<Set<string>>(new Set());

  const sessionMode = mode as SessionMode;
  const duration = useMemo(
    () => durationForMode(sessionMode, profile.dailyMinutes),
    [sessionMode, profile.dailyMinutes],
  );

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    prepareSession(sessionMode, duration, profile.includeScience)
      .then(({ record, questions }) => {
        if (cancelled) return;
        setRecord(record);
        setQuestions(questions);
        setIndex(0);
        setResults([]);
        setRecap(null);
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionMode]);

  const current = questions[index];

  const handleAnswered = useCallback(
    async (result: AnswerResult) => {
      if (!current || !record) return;
      setResults((r) => [...r, result]);
      await recordAttempt({
        question: current,
        chosenChoiceId: result.chosenChoiceId,
        correct: result.correct,
        responseTimeMs: result.responseTimeMs,
        confidence: result.confidence,
        hintsUsed: result.hintsUsed,
        sessionId: record.id,
        isReview: false,
        inPassage: Boolean(current.passageId),
      });
    },
    [current, record],
  );

  const handleErrorReason = useCallback(
    async (reason: ErrorReason) => {
      if (!current) return;
      await setMistakeReason(current.id, reason);
    },
    [current],
  );

  const handleContinue = useCallback(async () => {
    if (!record) return;
    if (index + 1 >= questions.length) {
      // Finish.
      const answered = results.length;
      const correct = results.filter((r) => r.correct).length;
      const totalTimeMs = results.reduce((a, r) => a + r.responseTimeMs, 0);
      await completeSession(record, answered, correct, totalTimeMs);
      await bumpStreak();
      setRecap({
        answered,
        correct,
        totalTimeMs,
        skills: Array.from(new Set(questions.map((q) => q.microSkill))),
        mode: sessionMode,
      });
    } else {
      setIndex((i) => i + 1);
    }
  }, [record, index, questions, results, sessionMode]);

  const handleSave = useCallback(async () => {
    if (!current) return;
    setSaved((s) => new Set(s).add(current.id));
    await db.savedQuestions.add({
      questionId: current.id,
      note: '',
      createdAt: new Date().toISOString(),
    });
  }, [current]);

  if (loading) {
    return (
      <div className="runner" style={{ placeContent: 'center', alignItems: 'center' }}>
        <div className="pulse-dot" />
        <p className="muted" style={{ marginTop: 'var(--sp-4)' }}>
          Building your adaptive session…
        </p>
      </div>
    );
  }

  if (recap) {
    return (
      <SessionRecap
        {...recap}
        onDone={() => navigate('/')}
        onReview={() => navigate('/review')}
      />
    );
  }

  if (!current) {
    return (
      <div className="runner" style={{ placeContent: 'center', alignItems: 'center', textAlign: 'center' }}>
        <p className="muted">
          No questions are available for this mode yet. Try the Adaptive Daily
          Mix.
        </p>
        <button className="btn btn--primary" style={{ marginTop: 'var(--sp-4)' }} onClick={() => navigate('/train')}>
          Back to Train
        </button>
      </div>
    );
  }

  return (
    <div className="runner">
      <div className="runner__top stack-sm" style={{ background: 'var(--bg)', paddingBottom: 'var(--sp-2)' }}>
        <div className="row-between">
          <button
            className="btn btn--sm btn--ghost"
            onClick={() => navigate(-1)}
            aria-label="Exit session"
          >
            <ArrowLeft size={18} /> Exit
          </button>
          <span className="text-sm faint">
            {MODE_TITLES[sessionMode] ?? 'Session'} · {index + 1}/{questions.length}
          </span>
          <div style={{ width: 60 }}>
            <ProgressRing
              value={(index) / questions.length}
              size={34}
              stroke={4}
            />
          </div>
        </div>
        <div className="session-progress" aria-hidden>
          <span style={{ width: `${(index / questions.length) * 100}%` }} />
        </div>
      </div>

      <div className="runner__body">
        <QuestionView
          key={current.id}
          question={current}
          index={index}
          total={questions.length}
          showTimer={settings.showTimer}
          onAnswered={handleAnswered}
          onContinue={handleContinue}
          onErrorReason={handleErrorReason}
          onSave={handleSave}
          saved={saved.has(current.id)}
        />
      </div>
    </div>
  );
}
