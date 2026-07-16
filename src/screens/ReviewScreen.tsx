import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { RefreshCw, NotebookPen, Bookmark, ArrowLeft } from 'lucide-react';
import { db } from '../data/db';
import type { Mistake, ReviewItem } from '../data/models';
import type { SectionId } from '../config/actBlueprint';
import type { ACTQuestion } from '../data/questionSchema';
import { getQuestionById } from '../content/questionBank';
import { QuestionView, type AnswerResult } from '../components/QuestionView';
import { recordAttempt } from '../services/progressService';
import { Card, Chip, EmptyState } from '../components/ui';
import { skillLabel } from '../engine/session';
import { SECTION_LABELS } from '../config/actBlueprint';
import { ERROR_REASON_LABELS } from '../data/models';

type Tab = 'due' | 'notebook' | 'saved';

export function ReviewScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('due');
  const [dueItems, setDueItems] = useState<ReviewItem[]>([]);
  const [mistakes, setMistakes] = useState<Mistake[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [running, setRunning] = useState<ACTQuestion[] | null>(null);
  const [sectionFilter, setSectionFilter] = useState<SectionId | 'all'>('all');

  const load = useCallback(async () => {
    const now = new Date().toISOString();
    const reviews = await db.reviewItems
      .where('status')
      .equals('scheduled')
      .toArray();
    setDueItems(reviews.filter((r) => r.dueAt <= now));
    const ms = await db.mistakes.reverse().sortBy('createdAt');
    setMistakes(ms.reverse());
    const saved = await db.savedQuestions.toArray();
    setSavedIds(saved.map((s) => s.questionId));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const startReview = () => {
    const qs = dueItems
      .map((r) => getQuestionById(r.questionId))
      .filter((q): q is ACTQuestion => Boolean(q));
    if (qs.length) setRunning(qs);
  };

  if (running) {
    return (
      <ReviewRunner
        questions={running}
        onExit={() => {
          setRunning(null);
          void load();
        }}
      />
    );
  }

  const filteredMistakes =
    sectionFilter === 'all'
      ? mistakes
      : mistakes.filter((m) => m.section === sectionFilter);

  return (
    <div className="stack" style={{ gap: 'var(--sp-4)' }}>
      <header className="stack-sm">
        <div className="eyebrow">Review</div>
        <h1 className="title-lg">Lock it in</h1>
      </header>

      <div className="seg" role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'due'}
          className={tab === 'due' ? 'is-active' : ''}
          onClick={() => setTab('due')}
        >
          Due ({dueItems.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === 'notebook'}
          className={tab === 'notebook' ? 'is-active' : ''}
          onClick={() => setTab('notebook')}
        >
          Notebook ({mistakes.length})
        </button>
        <button
          role="tab"
          aria-selected={tab === 'saved'}
          className={tab === 'saved' ? 'is-active' : ''}
          onClick={() => setTab('saved')}
        >
          Saved ({savedIds.length})
        </button>
      </div>

      {tab === 'due' && (
        <div className="stack">
          {dueItems.length === 0 ? (
            <EmptyState
              icon={<RefreshCw size={32} className="faint" />}
              title="No reviews due"
              message="Missed questions come back on a spaced schedule. Great job staying on top of it."
            />
          ) : (
            <>
              <Card accent className="stack-sm">
                <strong>{dueItems.length} items ready to review</strong>
                <p className="text-sm muted">
                  Delayed reviews are the strongest evidence of real mastery.
                </p>
                <button className="btn btn--primary btn--block" onClick={startReview}>
                  Start review session
                </button>
              </Card>
              {dueItems.map((r) => (
                <Card key={r.id} tight>
                  <div className="row-between">
                    <span>{skillLabel(r.skillId)}</span>
                    <Chip variant="accent">{SECTION_LABELS[r.section]}</Chip>
                  </div>
                </Card>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'notebook' && (
        <div className="stack">
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {(['all', 'english', 'math', 'reading', 'science'] as const).map(
              (s) => (
                <button
                  key={s}
                  className={`chip ${sectionFilter === s ? 'chip--accent' : ''}`}
                  onClick={() => setSectionFilter(s)}
                >
                  {s === 'all' ? 'All' : SECTION_LABELS[s]}
                </button>
              ),
            )}
          </div>
          {filteredMistakes.length === 0 ? (
            <EmptyState
              icon={<NotebookPen size={32} className="faint" />}
              title="No mistakes recorded"
              message="Every wrong answer is saved here automatically with its explanation."
            />
          ) : (
            filteredMistakes.map((m) => (
              <MistakeCard key={m.id} mistake={m} onChange={load} />
            ))
          )}
        </div>
      )}

      {tab === 'saved' && (
        <div className="stack">
          {savedIds.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={32} className="faint" />}
              title="No saved questions"
              message="Tap the bookmark on any question to keep it here."
            />
          ) : (
            savedIds.map((id) => {
              const q = getQuestionById(id);
              if (!q) return null;
              return (
                <Card key={id} tight>
                  <div className="row-between">
                    <span className="text-sm">{skillLabel(q.microSkill)}</span>
                    <Chip>{SECTION_LABELS[q.section]}</Chip>
                  </div>
                  <p className="text-sm muted" style={{ marginTop: 6 }}>
                    {q.prompt.slice(0, 90)}…
                  </p>
                </Card>
              );
            })
          )}
        </div>
      )}
      <button className="btn btn--ghost btn--sm" onClick={() => navigate('/train')}>
        Go to Train instead
      </button>
    </div>
  );
}

function MistakeCard({
  mistake,
  onChange,
}: {
  mistake: Mistake;
  onChange: () => void;
}) {
  const q = getQuestionById(mistake.questionId);
  const [notes, setNotes] = useState(mistake.notes);
  const [open, setOpen] = useState(false);

  const saveNotes = async () => {
    if (mistake.id != null) {
      await db.mistakes.update(mistake.id, {
        notes,
        updatedAt: new Date().toISOString(),
      });
      onChange();
    }
  };
  const resolve = async () => {
    if (mistake.id != null) {
      await db.mistakes.update(mistake.id, { reviewStatus: 'resolved' });
      onChange();
    }
  };

  return (
    <Card tight className="stack-sm">
      <div className="row-between">
        <span className="text-sm">{skillLabel(mistake.skillId)}</span>
        <div className="row" style={{ gap: 6 }}>
          <Chip variant={mistake.reviewStatus === 'resolved' ? 'success' : 'danger'}>
            {mistake.reviewStatus}
          </Chip>
          <Chip>D{mistake.difficulty}</Chip>
        </div>
      </div>
      {mistake.userErrorReason && (
        <span className="text-xs faint">
          Cause: {ERROR_REASON_LABELS[mistake.userErrorReason]}
        </span>
      )}
      <button
        className="btn btn--sm btn--ghost"
        style={{ justifyContent: 'flex-start' }}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? 'Hide details' : 'Show details'}
      </button>
      {open && q && (
        <div className="stack-sm">
          <p className="text-sm" style={{ whiteSpace: 'pre-line' }}>
            {q.prompt}
          </p>
          <p className="text-sm">
            <strong>Answer {q.correctChoiceId}.</strong> {q.explanation}
          </p>
          <textarea
            className="input"
            style={{ minHeight: 64, padding: 'var(--sp-3)' }}
            placeholder="Add a note to your future self…"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <div className="row" style={{ gap: 'var(--sp-2)' }}>
            <button className="btn btn--sm btn--outline" onClick={saveNotes}>
              Save note
            </button>
            {mistake.reviewStatus !== 'resolved' && (
              <button className="btn btn--sm btn--ghost" onClick={resolve}>
                Mark resolved
              </button>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

function ReviewRunner({
  questions,
  onExit,
}: {
  questions: ACTQuestion[];
  onExit: () => void;
}) {
  const [index, setIndex] = useState(0);
  const q = questions[index];

  const onAnswered = async (r: AnswerResult) => {
    await recordAttempt({
      question: q,
      chosenChoiceId: r.chosenChoiceId,
      correct: r.correct,
      responseTimeMs: r.responseTimeMs,
      confidence: r.confidence,
      hintsUsed: r.hintsUsed,
      sessionId: null,
      isReview: true,
      inPassage: Boolean(q.passageId),
    });
  };

  return (
    <div className="runner">
      <div className="runner__top row-between" style={{ background: 'var(--bg)' }}>
        <button className="btn btn--sm btn--ghost" onClick={onExit}>
          <ArrowLeft size={18} /> Exit
        </button>
        <span className="text-sm faint">
          Review {index + 1}/{questions.length}
        </span>
        <span style={{ width: 40 }} />
      </div>
      <div className="runner__body">
        <QuestionView
          key={q.id}
          question={q}
          index={index}
          total={questions.length}
          showTimer={false}
          onAnswered={onAnswered}
          onContinue={() => {
            if (index + 1 >= questions.length) onExit();
            else setIndex((i) => i + 1);
          }}
        />
      </div>
    </div>
  );
}
