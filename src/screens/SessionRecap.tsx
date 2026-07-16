import { useEffect, useState } from 'react';
import { CheckCircle2, Clock, Target, TrendingUp } from 'lucide-react';
import type { SessionMode } from '../data/models';
import { ProgressRing } from '../components/ProgressRing';
import { db } from '../data/db';
import { skillLabel } from '../engine/session';
import { masteryEstimate } from '../engine/adaptiveEngine';
import { getDueReviewCount } from '../services/analytics';

interface Props {
  answered: number;
  correct: number;
  totalTimeMs: number;
  skills: string[];
  mode: SessionMode;
  onDone: () => void;
  onReview: () => void;
}

export function SessionRecap({
  answered,
  correct,
  totalTimeMs,
  skills,
  onDone,
  onReview,
}: Props) {
  const [insight, setInsight] = useState<{
    strength: string;
    improve: string;
    tomorrow: string;
    dueReviews: number;
  } | null>(null);

  const accuracy = answered ? correct / answered : 0;
  const avgSec = answered ? Math.round(totalTimeMs / answered / 1000) : 0;

  useEffect(() => {
    (async () => {
      const states = await db.skillStates.bulkGet(skills);
      const present = states.filter(Boolean) as NonNullable<
        (typeof states)[number]
      >[];
      const sorted = [...present].sort(
        (a, b) => masteryEstimate(b) - masteryEstimate(a),
      );
      const strong = sorted[0];
      const weak = sorted[sorted.length - 1];
      const dueReviews = await getDueReviewCount();

      const strengthText = strong
        ? `Your ${skillLabel(strong.skillId)} looked strong${
            strong.recentAccuracy >= 0.8 ? ' — high accuracy this session.' : '.'
          }`
        : 'You built fresh evidence across several skills.';

      let improveText = 'Keep mixing question types to build durable mastery.';
      if (weak && weak.skillId !== strong?.skillId) {
        const types = weak.weaknessTypes[0];
        improveText =
          `Accuracy dipped on ${skillLabel(weak.skillId)}` +
          (types === 'careless_error_pattern'
            ? ' — a quick verification step could catch rushed misses.'
            : types === 'speed_gap'
              ? ' — you were slower than target; shortcuts will help.'
              : '.');
      }

      const tomorrow = weak
        ? `${skillLabel(weak.skillId)} and a spaced review`
        : 'a balanced adaptive mix';

      setInsight({
        strength: strengthText,
        improve: improveText,
        tomorrow,
        dueReviews,
      });
    })();
  }, [skills]);

  return (
    <div className="runner stack" style={{ gap: 'var(--sp-5)' }}>
      <div className="stack" style={{ alignItems: 'center', textAlign: 'center', marginTop: 'var(--sp-6)' }}>
        <ProgressRing
          value={accuracy}
          size={140}
          label={`${Math.round(accuracy * 100)}%`}
          sublabel="accuracy"
        />
        <h1 className="title-lg">Session complete</h1>
        <p className="muted">Nice work. Every answer sharpened your plan.</p>
      </div>

      <div className="grid-2">
        <div className="stat-tile">
          <span className="row faint text-xs"><CheckCircle2 size={14} /> Completed</span>
          <span className="stat-value">{answered}</span>
        </div>
        <div className="stat-tile">
          <span className="row faint text-xs"><Target size={14} /> Correct</span>
          <span className="stat-value">{correct}</span>
        </div>
        <div className="stat-tile">
          <span className="row faint text-xs"><Clock size={14} /> Avg time</span>
          <span className="stat-value">{avgSec}s</span>
        </div>
        <div className="stat-tile">
          <span className="row faint text-xs"><TrendingUp size={14} /> Reviews due</span>
          <span className="stat-value">{insight?.dueReviews ?? '—'}</span>
        </div>
      </div>

      {insight && (
        <div className="card stack-sm">
          <span className="eyebrow">Your takeaways</span>
          <p className="text-sm">
            <strong>Strength:</strong> {insight.strength}
          </p>
          <p className="text-sm">
            <strong>To improve:</strong> {insight.improve}
          </p>
          <p className="text-sm muted">
            Tomorrow’s likely focus: {insight.tomorrow}.
          </p>
        </div>
      )}

      <div className="stack-sm">
        <span className="eyebrow">Skills practiced</span>
        <div className="row" style={{ flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          {skills.map((s) => (
            <span key={s} className="chip">
              {skillLabel(s)}
            </span>
          ))}
        </div>
      </div>

      <div className="stack-sm">
        <button className="btn btn--primary btn--lg btn--block" onClick={onDone}>
          Done
        </button>
        <button className="btn btn--outline btn--block" onClick={onReview}>
          Review mistakes
        </button>
      </div>
    </div>
  );
}
