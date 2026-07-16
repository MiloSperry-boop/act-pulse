import type { TodayDigest as Digest } from '../services/analytics';
import type { SectionId } from '../config/actBlueprint';
import { ProgressRing } from './ProgressRing';
import { Target, CheckCircle2, Sparkles } from 'lucide-react';

const SECTION_COLOR: Record<SectionId, string> = {
  english: 'var(--iris-500)',
  math: 'var(--coral-500)',
  reading: 'var(--mint-500)',
  science: 'var(--rose-500)',
};

/** Visual, at-a-glance summary of today's training. */
export function TodayDigest({ digest }: { digest: Digest }) {
  const goalPct = digest.goalMinutes
    ? Math.min(1, digest.minutes / digest.goalMinutes)
    : 0;
  const totalFocus = digest.focus.reduce((a, f) => a + f.questions, 0) || 1;

  return (
    <section className="today card" aria-label="Today's training summary">
      <div className="row-between" style={{ marginBottom: 'var(--sp-4)' }}>
        <div>
          <div className="eyebrow">Today</div>
          <h2 className="title">
            {digest.studied ? 'Your training so far' : 'Not started yet'}
          </h2>
        </div>
        {digest.minutes >= digest.goalMinutes && digest.studied && (
          <span className="chip chip--success">Goal met</span>
        )}
      </div>

      {digest.studied ? (
        <>
          <div className="today__grid">
            <div className="today__ring">
              <ProgressRing
                value={goalPct}
                size={104}
                stroke={9}
                label={`${digest.minutes}`}
                sublabel={`of ${digest.goalMinutes} min`}
              />
            </div>
            <div className="today__stats">
              <div className="today__stat">
                <Target size={16} aria-hidden style={{ color: 'var(--accent)' }} />
                <div>
                  <div className="today__stat-value">{digest.questions}</div>
                  <div className="text-xs faint">questions</div>
                </div>
              </div>
              <div className="today__stat">
                <CheckCircle2 size={16} aria-hidden style={{ color: 'var(--success)' }} />
                <div>
                  <div className="today__stat-value">
                    {Math.round(digest.accuracy * 100)}%
                  </div>
                  <div className="text-xs faint">accuracy</div>
                </div>
              </div>
            </div>
          </div>

          {digest.focus.length > 0 && (
            <div className="today__focus">
              <div className="eyebrow" style={{ marginBottom: 'var(--sp-2)' }}>
                What you focused on
              </div>
              <div
                className="today__bar"
                role="img"
                aria-label={digest.focus
                  .map((f) => `${f.label} ${f.questions}`)
                  .join(', ')}
              >
                {digest.focus.map((f) => (
                  <span
                    key={f.section}
                    style={{
                      width: `${(f.questions / totalFocus) * 100}%`,
                      background: SECTION_COLOR[f.section],
                    }}
                  />
                ))}
              </div>
              <div className="today__legend">
                {digest.focus.map((f) => (
                  <span key={f.section} className="today__legend-item">
                    <i style={{ background: SECTION_COLOR[f.section] }} />
                    {f.label}
                    <b>{f.questions}</b>
                  </span>
                ))}
              </div>
              {digest.topSkillLabel && (
                <p className="text-sm muted today__top">
                  <Sparkles size={14} aria-hidden style={{ color: 'var(--highlight)' }} />
                  Most practiced: <strong>{digest.topSkillLabel}</strong>
                </p>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="muted text-sm">
          You haven’t trained yet today. Even five focused minutes moves your
          plan forward — your time, questions, and focus will show up here.
        </p>
      )}
    </section>
  );
}
