import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProgressSnapshot,
  readinessLabel,
  type ProgressSnapshot,
} from '../services/analytics';
import { ProgressRing } from '../components/ProgressRing';
import { Card, Bar, Chip, EmptyState } from '../components/ui';
import { BarChart3 } from 'lucide-react';

export function ProgressScreen() {
  const navigate = useNavigate();
  const [snap, setSnap] = useState<ProgressSnapshot | null>(null);

  useEffect(() => {
    void getProgressSnapshot().then(setSnap);
  }, []);

  if (!snap) {
    return (
      <div className="stack" style={{ alignItems: 'center', marginTop: 'var(--sp-8)' }}>
        <div className="pulse-dot" />
      </div>
    );
  }

  if (snap.totalAttempts === 0) {
    return (
      <div className="stack">
        <header className="stack-sm">
          <div className="eyebrow">Progress</div>
          <h1 className="title-lg">Your data starts here</h1>
        </header>
        <EmptyState
          icon={<BarChart3 size={32} className="faint" />}
          title="No practice yet"
          message="Finish a session and your mastery, speed, and blueprint coverage will appear here."
        />
        <button className="btn btn--primary btn--block" onClick={() => navigate('/session/daily')}>
          Start a session
        </button>
      </div>
    );
  }

  const maxErr = Math.max(1, ...snap.errorPattern.map((e) => e.count));
  const activeDays = snap.weeklyActivity.filter((d) => d.questions > 0).length;
  const maxMinutes = Math.max(1, ...snap.weeklyActivity.map((d) => d.minutes));

  return (
    <div className="stack" style={{ gap: 'var(--sp-5)' }}>
      <header className="stack-sm">
        <div className="eyebrow">Progress</div>
        <h1 className="title-lg">Where you stand</h1>
      </header>

      {/* Readiness */}
      <Card accent className="row" style={{ gap: 'var(--sp-5)' }}>
        <ProgressRing
          value={snap.readinessIndex / 100}
          size={110}
          label={`${snap.readinessIndex}`}
          sublabel="/ 100"
        />
        <div className="stack-sm">
          <div className="eyebrow">Practice readiness</div>
          <strong style={{ fontSize: 'var(--text-xl)' }}>
            {readinessLabel(snap.readinessIndex)}
          </strong>
          <p className="text-xs faint">
            An internal index — not an official ACT score.
          </p>
        </div>
      </Card>

      {/* Accuracy / speed tiles */}
      <div className="grid-2">
        <div className="stat-tile">
          <span className="faint text-xs">Overall accuracy</span>
          <span className="stat-value">
            {Math.round(snap.overallAccuracy * 100)}%
          </span>
        </div>
        <div className="stat-tile">
          <span className="faint text-xs">Recent accuracy</span>
          <span className="stat-value">
            {Math.round(snap.recentAccuracy * 100)}%
          </span>
        </div>
        <div className="stat-tile">
          <span className="faint text-xs">Avg response</span>
          <span className="stat-value">
            {Math.round(snap.averageResponseSec)}s
          </span>
        </div>
        <div className="stat-tile">
          <span className="faint text-xs">Questions done</span>
          <span className="stat-value">{snap.totalAttempts}</span>
        </div>
      </div>

      {/* Weekly heatmap */}
      <section className="stack-sm">
        <div className="eyebrow">This week ({activeDays}/7 active days)</div>
        <div className="heat">
          {snap.weeklyActivity.map((d) => {
            const intensity = d.minutes / maxMinutes;
            return (
              <div
                key={d.date}
                className="heat__cell"
                style={{
                  background:
                    d.questions > 0
                      ? `color-mix(in srgb, var(--accent) ${20 + intensity * 70}%, var(--surface-2))`
                      : undefined,
                  color: intensity > 0.5 ? 'var(--on-accent)' : undefined,
                }}
                title={`${d.date}: ${Math.round(d.minutes)} min`}
              >
                {new Date(d.date + 'T00:00').toLocaleDateString(undefined, {
                  weekday: 'narrow',
                })}
              </div>
            );
          })}
        </div>
      </section>

      {/* Mastery by section */}
      <section className="stack-sm">
        <div className="eyebrow">Mastery by section</div>
        {snap.masteryBySection.map((s) => (
          <div key={s.section} className="stack-sm">
            <div className="row-between text-sm">
              <span>{s.label}</span>
              <span className="faint">{Math.round(s.mastery * 100)}%</span>
            </div>
            <Bar value={s.mastery} />
          </div>
        ))}
      </section>

      {/* Weakest / strongest */}
      <div className="grid-2" style={{ gap: 'var(--sp-4)' }}>
        <section className="stack-sm">
          <div className="eyebrow">Weakest</div>
          {snap.weakest.length === 0 && <p className="text-sm faint">—</p>}
          {snap.weakest.map((s) => (
            <button
              key={s.skill.id}
              className="card card--tight text-sm"
              style={{ textAlign: 'left' }}
              onClick={() => navigate(`/skill/${s.skill.id}`)}
            >
              {s.skill.label}
              <div className="faint text-xs">{Math.round(s.mastery * 100)}%</div>
            </button>
          ))}
        </section>
        <section className="stack-sm">
          <div className="eyebrow">Strongest</div>
          {snap.strongest.length === 0 && <p className="text-sm faint">—</p>}
          {snap.strongest.map((s) => (
            <button
              key={s.skill.id}
              className="card card--tight text-sm"
              style={{ textAlign: 'left' }}
              onClick={() => navigate(`/skill/${s.skill.id}`)}
            >
              {s.skill.label}
              <div className="faint text-xs">{Math.round(s.mastery * 100)}%</div>
            </button>
          ))}
        </section>
      </div>

      {(snap.improving.length > 0 || snap.declining.length > 0) && (
        <section className="stack-sm">
          <div className="eyebrow">Trends</div>
          <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
            {snap.improving.map((s) => (
              <Chip key={s.skill.id} variant="success">
                ↑ {s.skill.label}
              </Chip>
            ))}
            {snap.declining.map((s) => (
              <Chip key={s.skill.id} variant="danger">
                ↓ {s.skill.label}
              </Chip>
            ))}
          </div>
        </section>
      )}

      {/* Confidence calibration */}
      <Card className="stack-sm">
        <div className="eyebrow">Confidence calibration</div>
        <p className="text-sm">
          Confident &amp; correct:{' '}
          <strong>{snap.calibration.confidentCorrect}</strong> · Confident but
          wrong: <strong>{snap.calibration.confidentWrong}</strong>
        </p>
        {snap.calibration.confidentWrong >= 3 && (
          <p className="text-sm muted">
            You’re sometimes confidently incorrect — slow down to verify before
            committing.
          </p>
        )}
      </Card>

      {/* Error patterns */}
      {snap.errorPattern.length > 0 && (
        <section className="stack-sm">
          <div className="eyebrow">Error patterns</div>
          {snap.errorPattern.slice(0, 6).map((e) => (
            <div key={e.type} className="stack-sm">
              <div className="row-between text-sm">
                <span>{humanizeError(e.type)}</span>
                <span className="faint">{e.count}</span>
              </div>
              <Bar value={e.count / maxErr} />
            </div>
          ))}
        </section>
      )}

      {/* Blueprint coverage */}
      <section className="stack-sm">
        <div className="eyebrow">ACT blueprint coverage</div>
        <p className="text-xs faint">
          Your recent practice mix vs. the real test distribution.
        </p>
        {snap.blueprintCoverage.map((b) => (
          <div key={b.categoryId} className="row-between text-sm">
            <span>{b.label}</span>
            <Chip
              variant={
                b.status === 'under'
                  ? 'warn'
                  : b.status === 'over'
                    ? 'accent'
                    : 'success'
              }
            >
              {b.status === 'under'
                ? 'under-practiced'
                : b.status === 'over'
                  ? 'oversampled'
                  : 'on target'}
            </Chip>
          </div>
        ))}
      </section>
    </div>
  );
}

function humanizeError(type: string): string {
  const map: Record<string, string> = {
    knowledge_gap: 'Knowledge gap',
    recognition_gap: 'Recognition gap',
    application_gap: 'Application gap',
    speed_gap: 'Speed gap',
    retention_gap: 'Retention gap',
    careless_error_pattern: 'Careless errors',
    unknown_concept: "Didn't know concept",
    not_recognized: "Didn't recognize it",
    no_start: "Didn't know how to start",
    misread_question: 'Misread question',
    wrong_elimination: 'Wrong elimination',
    algebra_error: 'Algebra error',
    arithmetic_error: 'Arithmetic error',
    rushed: 'Rushed',
    ran_out_of_time: 'Ran out of time',
    guessed: 'Guessed',
    not_sure: 'Not sure',
    unclassified: 'Unclassified',
  };
  return map[type] ?? type;
}
