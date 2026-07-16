import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Flag,
  Bookmark,
  Lightbulb,
  Calculator as CalcIcon,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react';
import type { ACTQuestion } from '../data/questionSchema';
import type { ConfidenceLevel, ErrorReason, HintKind } from '../data/models';
import { ERROR_REASON_LABELS } from '../data/models';
import { getPassageById } from '../content/questionBank';
import { skillLabel } from '../engine/session';
import { SECTION_LABELS } from '../config/actBlueprint';
import { PassageView, StimulusView } from './Stimulus';
import { Calculator } from './Calculator';
import { Chip } from './ui';

export interface AnswerResult {
  chosenChoiceId: string | null;
  correct: boolean;
  responseTimeMs: number;
  confidence: ConfidenceLevel;
  hintsUsed: HintKind[];
}

interface QuestionViewProps {
  question: ACTQuestion;
  index: number;
  total: number;
  lessonMode?: boolean;
  showTimer: boolean;
  onAnswered: (result: AnswerResult) => void;
  onContinue: () => void;
  onFlag?: () => void;
  onSave?: () => void;
  onErrorReason?: (reason: ErrorReason) => void;
  saved?: boolean;
}

const CONFIDENCE: { id: ConfidenceLevel; label: string }[] = [
  { id: 'guessing', label: 'Guessing' },
  { id: 'unsure', label: 'Unsure' },
  { id: 'confident', label: 'Confident' },
];

export function QuestionView({
  question,
  index,
  total,
  showTimer,
  onAnswered,
  onContinue,
  onFlag,
  onSave,
  onErrorReason,
  saved = false,
}: QuestionViewProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceLevel>('unsure');
  const [submitted, setSubmitted] = useState(false);
  const [hintsUsed, setHintsUsed] = useState<HintKind[]>([]);
  const [showHint, setShowHint] = useState(0);
  const [showCalc, setShowCalc] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(Date.now());

  const passage = question.passageId
    ? getPassageById(question.passageId)
    : undefined;

  // Reset per question.
  useEffect(() => {
    setSelected(null);
    setConfidence('unsure');
    setSubmitted(false);
    setHintsUsed([]);
    setShowHint(0);
    setShowCalc(false);
    setElapsed(0);
    startRef.current = Date.now();
  }, [question.id]);

  // Timer tick (kept isolated so it doesn't re-render the passage).
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(t);
  }, [submitted, question.id]);

  const correct = selected === question.correctChoiceId;

  const useHint = () => {
    const next = question.hints[showHint];
    if (!next) return;
    setShowHint((n) => n + 1);
    setHintsUsed((h) => [...h, next.kind]);
  };

  const submit = () => {
    if (!selected) return;
    const responseTimeMs = Date.now() - startRef.current;
    setSubmitted(true);
    onAnswered({
      chosenChoiceId: selected,
      correct: selected === question.correctChoiceId,
      responseTimeMs,
      confidence,
      hintsUsed,
    });
  };

  const timeStr = useMemo(() => {
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }, [elapsed]);

  return (
    <div className="stack">
      {/* Header meta */}
      <div className="row-between">
        <div className="row" style={{ gap: 'var(--sp-2)' }}>
          <Chip variant="accent">{SECTION_LABELS[question.section]}</Chip>
          <Chip>D{question.difficulty}</Chip>
        </div>
        <div className="row" style={{ gap: 'var(--sp-2)' }}>
          {showTimer && (
            <span className="row faint text-sm" aria-label="Elapsed time">
              <Clock size={15} /> {timeStr}
            </span>
          )}
          {onFlag && (
            <button className="btn btn--sm btn--ghost" onClick={onFlag} aria-label="Flag question">
              <Flag size={17} />
            </button>
          )}
          {onSave && (
            <button
              className="btn btn--sm btn--ghost"
              onClick={onSave}
              aria-label={saved ? 'Saved' : 'Save question'}
              style={{ color: saved ? 'var(--highlight)' : undefined }}
            >
              <Bookmark size={17} fill={saved ? 'currentColor' : 'none'} />
            </button>
          )}
        </div>
      </div>

      <div className="text-xs faint">{skillLabel(question.microSkill)}</div>

      {passage && <PassageView passage={passage} />}
      {question.stimulus && <StimulusView stimulus={question.stimulus} />}

      <p style={{ fontSize: 'var(--text-lg)', whiteSpace: 'pre-line' }}>
        {question.prompt}
      </p>

      {/* Choices */}
      <div className="stack-sm" role="radiogroup" aria-label="Answer choices">
        {question.choices.map((c) => {
          const isSelected = selected === c.id;
          const isCorrect = c.id === question.correctChoiceId;
          let cls = 'choice';
          if (submitted) {
            if (isCorrect) cls += ' is-correct';
            else if (isSelected) cls += ' is-wrong';
          } else if (isSelected) {
            cls += ' is-selected';
          }
          return (
            <button
              key={c.id}
              className={cls}
              role="radio"
              aria-checked={isSelected}
              disabled={submitted}
              onClick={() => setSelected(c.id)}
            >
              <span className="choice__key">{c.id}</span>
              <span style={{ whiteSpace: 'pre-line' }}>{c.text}</span>
              {submitted && isCorrect && (
                <CheckCircle2 size={18} style={{ marginLeft: 'auto', color: 'var(--success)' }} />
              )}
              {submitted && isSelected && !isCorrect && (
                <XCircle size={18} style={{ marginLeft: 'auto', color: 'var(--danger)' }} />
              )}
            </button>
          );
        })}
      </div>

      {/* Pre-submit controls */}
      {!submitted && (
        <div className="stack">
          <div className="stack-sm">
            <span className="text-xs faint">How confident are you?</span>
            <div className="seg" role="radiogroup" aria-label="Confidence">
              {CONFIDENCE.map((c) => (
                <button
                  key={c.id}
                  className={confidence === c.id ? 'is-active' : ''}
                  role="radio"
                  aria-checked={confidence === c.id}
                  onClick={() => setConfidence(c.id)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="row" style={{ gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            {question.hints.length > 0 && showHint < question.hints.length && (
              <button className="btn btn--sm btn--outline" onClick={useHint}>
                <Lightbulb size={16} /> Hint ({showHint + 1}/{question.hints.length})
              </button>
            )}
            {question.calculatorAllowed && (
              <button
                className="btn btn--sm btn--outline"
                onClick={() => setShowCalc((v) => !v)}
              >
                <CalcIcon size={16} /> Calculator
              </button>
            )}
          </div>

          {showHint > 0 && (
            <div className="card card--tight stack-sm">
              {question.hints.slice(0, showHint).map((h, i) => (
                <div key={i} className="row" style={{ alignItems: 'flex-start' }}>
                  <Lightbulb size={16} style={{ marginTop: 3, color: 'var(--highlight)' }} />
                  <span className="text-sm">{h.text}</span>
                </div>
              ))}
            </div>
          )}

          {showCalc && <Calculator onClose={() => setShowCalc(false)} />}

          <button
            className="btn btn--primary btn--lg btn--block"
            disabled={!selected}
            onClick={submit}
          >
            Submit
          </button>
        </div>
      )}

      {/* Post-submit feedback */}
      {submitted && (
        <Feedback
          question={question}
          correct={correct}
          chosen={selected}
          hintsUsed={hintsUsed}
          onContinue={onContinue}
          onErrorReason={onErrorReason}
          lastQuestion={index + 1 >= total}
        />
      )}
    </div>
  );
}

function Feedback({
  question,
  correct,
  chosen,
  hintsUsed,
  onContinue,
  onErrorReason,
  lastQuestion,
}: {
  question: ACTQuestion;
  correct: boolean;
  chosen: string | null;
  hintsUsed: HintKind[];
  onContinue: () => void;
  onErrorReason?: (reason: ErrorReason) => void;
  lastQuestion: boolean;
}) {
  const [reason, setReason] = useState<ErrorReason | null>(null);
  return (
    <div className="stack">
      <div
        className="card"
        style={{
          borderColor: correct ? 'var(--success)' : 'var(--danger)',
          background: correct ? 'var(--success-soft)' : 'var(--danger-soft)',
        }}
      >
        <div className="row" style={{ gap: 'var(--sp-2)' }}>
          {correct ? (
            <CheckCircle2 color="var(--success)" />
          ) : (
            <XCircle color="var(--danger)" />
          )}
          <strong>
            {correct
              ? hintsUsed.length
                ? 'Correct (with a hint)'
                : 'Correct'
              : 'Not quite'}
          </strong>
        </div>
        <p className="text-sm" style={{ marginTop: 'var(--sp-2)' }}>
          Correct answer: <strong>{question.correctChoiceId}</strong>
        </p>
      </div>

      <div className="stack-sm">
        <span className="eyebrow">Explanation</span>
        <p className="text-sm">{question.explanation}</p>
      </div>

      {chosen && chosen !== question.correctChoiceId &&
        question.distractorExplanations[chosen] && (
          <div className="stack-sm">
            <span className="eyebrow">Why your choice was tempting</span>
            <p className="text-sm muted">
              {question.distractorExplanations[chosen]}
            </p>
          </div>
        )}

      <details>
        <summary className="text-sm" style={{ cursor: 'pointer', fontWeight: 600 }}>
          Why the other choices are wrong
        </summary>
        <div className="stack-sm" style={{ marginTop: 'var(--sp-2)' }}>
          {Object.entries(question.distractorExplanations).map(([id, text]) => (
            <p key={id} className="text-sm muted">
              <strong>{id}:</strong> {text}
            </p>
          ))}
        </div>
      </details>

      <div className="card card--tight stack-sm" style={{ background: 'var(--accent-soft)' }}>
        <span className="eyebrow">Rule / concept</span>
        <p className="text-sm">{question.conceptSummary}</p>
        {question.strategyTip && (
          <p className="text-sm muted">Strategy: {question.strategyTip}</p>
        )}
      </div>

      {!correct && onErrorReason && (
        <div className="stack-sm">
          <span className="eyebrow">What caused this mistake?</span>
          <div className="stack-sm">
            {(Object.keys(ERROR_REASON_LABELS) as ErrorReason[]).map((r) => (
              <button
                key={r}
                className={`btn btn--sm btn--outline ${reason === r ? 'is-selected' : ''}`}
                style={{
                  justifyContent: 'flex-start',
                  borderColor: reason === r ? 'var(--accent)' : undefined,
                  background: reason === r ? 'var(--accent-soft)' : undefined,
                }}
                onClick={() => {
                  setReason(r);
                  onErrorReason(r);
                }}
              >
                {ERROR_REASON_LABELS[r]}
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="btn btn--primary btn--lg btn--block" onClick={onContinue}>
        {lastQuestion ? 'Finish session' : 'Continue'}
      </button>
    </div>
  );
}
