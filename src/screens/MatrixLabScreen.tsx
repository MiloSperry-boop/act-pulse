import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw } from 'lucide-react';
import { generateMatrixQuestion } from '../content/generators/matrix';
import { QuestionView, type AnswerResult } from '../components/QuestionView';
import { recordAttempt } from '../services/progressService';
import { Card } from '../components/ui';

// A fixed pair for the lesson visualizer.
const A = [
  [2, 3],
  [1, 4],
];
const B = [
  [5, 1],
  [2, 6],
];

function dot(row: number[], col: number[]): number {
  return row.reduce((a, v, i) => a + v * col[i], 0);
}

export function MatrixLabScreen() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'lesson' | 'practice'>('lesson');

  return (
    <div className="runner">
      <div className="runner__top row-between" style={{ background: 'var(--bg)' }}>
        <button className="btn btn--sm btn--ghost" onClick={() => navigate(-1)}>
          <ArrowLeft size={18} /> Back
        </button>
        <strong>Matrix Lab</strong>
        <span style={{ width: 40 }} />
      </div>

      <div className="seg" style={{ margin: 'var(--sp-3) 0' }} role="tablist">
        <button
          role="tab"
          aria-selected={tab === 'lesson'}
          className={tab === 'lesson' ? 'is-active' : ''}
          onClick={() => setTab('lesson')}
        >
          Lesson
        </button>
        <button
          role="tab"
          aria-selected={tab === 'practice'}
          className={tab === 'practice' ? 'is-active' : ''}
          onClick={() => setTab('practice')}
        >
          Practice
        </button>
      </div>

      <div className="runner__body">
        {tab === 'lesson' ? <MultiplyLesson /> : <MatrixPractice />}
      </div>
    </div>
  );
}

function MultiplyLesson() {
  const [cell, setCell] = useState<[number, number]>([0, 0]);
  const [r, c] = cell;
  const row = A[r];
  const col = B.map((br) => br[c]);
  const value = dot(row, col);

  return (
    <div className="stack">
      <p className="muted text-sm">
        In AB, the entry in row {r + 1}, column {c + 1} is the dot product of{' '}
        <strong>row {r + 1} of A</strong> and <strong>column {c + 1} of B</strong>
        . Tap a result cell to see how it’s built.
      </p>

      <Card className="stack">
        <div className="row" style={{ gap: 'var(--sp-5)', flexWrap: 'wrap' }}>
          <div className="stack-sm">
            <span className="eyebrow">A</span>
            <HighlightMatrix values={A} highlightRow={r} />
          </div>
          <div className="stack-sm">
            <span className="eyebrow">B</span>
            <HighlightMatrix values={B} highlightCol={c} />
          </div>
        </div>

        <div className="divider" />

        <div className="stack-sm">
          <span className="eyebrow">Result AB — tap a cell</span>
          <div
            className="matrix-grid"
            style={{ gridTemplateColumns: 'repeat(2, auto)' }}
          >
            {[0, 1].flatMap((ri) =>
              [0, 1].map((ci) => {
                const v = dot(
                  A[ri],
                  B.map((br) => br[ci]),
                );
                const active = ri === r && ci === c;
                return (
                  <button
                    key={`${ri}-${ci}`}
                    className="matrix-cell"
                    style={{
                      background: active ? 'var(--accent)' : 'var(--surface-2)',
                      color: active ? 'var(--on-accent)' : undefined,
                      borderRadius: 6,
                      padding: '6px 10px',
                      fontWeight: 700,
                    }}
                    onClick={() => setCell([ri, ci])}
                  >
                    {v}
                  </button>
                );
              }),
            )}
          </div>
        </div>

        <div className="card card--tight" style={{ background: 'var(--accent-soft)' }}>
          <p className="mono text-sm">
            ({row[0]})({col[0]}) + ({row[1]})({col[1]}) = {row[0] * col[0]} +{' '}
            {row[1] * col[1]} = <strong>{value}</strong>
          </p>
        </div>
      </Card>

      <p className="text-xs faint">
        The number of columns of A must equal the number of rows of B, or the
        product is undefined.
      </p>
    </div>
  );
}

function HighlightMatrix({
  values,
  highlightRow,
  highlightCol,
}: {
  values: number[][];
  highlightRow?: number;
  highlightCol?: number;
}) {
  const cols = values[0].length;
  return (
    <div
      className="matrix-grid"
      style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}
    >
      {values.flatMap((row, ri) =>
        row.map((v, ci) => {
          const active = ri === highlightRow || ci === highlightCol;
          return (
            <span
              key={`${ri}-${ci}`}
              className="matrix-cell"
              style={{
                background: active ? 'var(--accent-soft)' : undefined,
                color: active ? 'var(--accent-strong)' : undefined,
                borderRadius: 4,
                fontWeight: active ? 700 : undefined,
              }}
            >
              {v}
            </span>
          );
        }),
      )}
    </div>
  );
}

function MatrixPractice() {
  const [seed, setSeed] = useState(1);
  const q = useMemo(() => generateMatrixQuestion(`matrix-lab:${seed}`), [seed]);
  const [answered, setAnswered] = useState(false);

  const onAnswered = async (r: AnswerResult) => {
    setAnswered(true);
    await recordAttempt({
      question: q,
      chosenChoiceId: r.chosenChoiceId,
      correct: r.correct,
      responseTimeMs: r.responseTimeMs,
      confidence: r.confidence,
      hintsUsed: r.hintsUsed,
      sessionId: null,
      isReview: false,
      inPassage: false,
    });
  };

  return (
    <div className="stack">
      <QuestionView
        key={q.id}
        question={q}
        index={0}
        total={1}
        showTimer={false}
        onAnswered={onAnswered}
        onContinue={() => {
          setAnswered(false);
          setSeed((s) => s + 1);
        }}
      />
      {!answered && (
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => setSeed((s) => s + 1)}
        >
          <RotateCcw size={16} /> New problem
        </button>
      )}
    </div>
  );
}
