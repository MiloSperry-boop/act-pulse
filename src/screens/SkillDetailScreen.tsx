import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { db } from '../data/db';
import type { SkillState } from '../data/models';
import { SKILL_BY_ID } from '../config/skills';
import { masteryEstimate } from '../engine/adaptiveEngine';
import { WEAKNESS_TYPE_ADVICE } from '../engine/weakness';
import { Card, Bar, Chip } from '../components/ui';
import { SECTION_LABELS } from '../config/actBlueprint';

const STATUS_LABEL: Record<string, string> = {
  insufficient_data: 'Gathering evidence',
  possible: 'Possible weakness',
  confirmed: 'Confirmed weakness',
  improving: 'Improving',
  stable: 'Stable',
  mastered: 'Mastered',
};

export function SkillDetailScreen() {
  const { skillId = '' } = useParams();
  const navigate = useNavigate();
  const skill = SKILL_BY_ID[skillId];
  const [state, setState] = useState<SkillState | null>(null);

  useEffect(() => {
    void db.skillStates.get(skillId).then((s) => setState(s ?? null));
  }, [skillId]);

  if (!skill) {
    return (
      <div className="screen">
        <p className="muted">Unknown skill.</p>
      </div>
    );
  }

  const mastery = state ? masteryEstimate(state) : 0;
  const nextAction = state?.weaknessTypes[0]
    ? WEAKNESS_TYPE_ADVICE[state.weaknessTypes[0]]
    : 'Keep practicing in mixed sessions to build evidence.';

  const focusMode = skillId.startsWith('eng.comma')
    ? 'comma_clinic'
    : skillId.startsWith('eng.usage.sva')
      ? 'sva'
      : skillId.startsWith('eng.prod')
        ? 'writers_goal'
        : skillId.startsWith('math.nq.matrix')
          ? 'matrix_lab'
          : skill.section === 'math'
            ? 'late_math'
            : skill.section === 'reading'
              ? 'reading_speed'
              : skill.section === 'science'
                ? 'science_maintenance'
                : 'english_clinic';

  return (
    <div className="screen stack" style={{ gap: 'var(--sp-4)' }}>
      <button className="btn btn--sm btn--ghost" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={18} /> Back
      </button>

      <header className="stack-sm">
        <div className="row" style={{ gap: 'var(--sp-2)' }}>
          <Chip variant="accent">{SECTION_LABELS[skill.section]}</Chip>
          <Chip>{skill.subcategory}</Chip>
        </div>
        <h1 className="title-lg">{skill.label}</h1>
      </header>

      {!state || state.totalAttempts === 0 ? (
        <Card className="stack-sm">
          <p className="muted">No practice data yet for this skill.</p>
          <button
            className="btn btn--primary btn--block"
            onClick={() =>
              navigate(focusMode === 'matrix_lab' ? '/matrix-lab' : `/session/${focusMode}`)
            }
          >
            Practice now
          </button>
        </Card>
      ) : (
        <>
          <Card className="stack">
            <div className="row-between">
              <span className="eyebrow">Status</span>
              <Chip
                variant={
                  state.weaknessStatus === 'mastered'
                    ? 'success'
                    : state.weaknessStatus === 'confirmed'
                      ? 'danger'
                      : 'warn'
                }
              >
                {STATUS_LABEL[state.weaknessStatus]}
              </Chip>
            </div>
            <Metric label="Knowledge mastery" value={mastery} />
            <Metric label="Speed mastery" value={state.speedMastery} />
            <Metric label="Retention strength" value={state.retentionStrength} />
          </Card>

          <div className="grid-2">
            <Tile label="Attempts" value={`${state.totalAttempts}`} />
            <Tile
              label="Recent accuracy"
              value={`${Math.round(state.recentAccuracy * 100)}%`}
            />
            <Tile
              label="Avg time"
              value={`${Math.round(state.averageResponseTimeMs / 1000)}s`}
            />
            <Tile
              label="Working difficulty"
              value={`${state.currentDifficulty.toFixed(1)}`}
            />
          </div>

          {state.weaknessTypes.length > 0 && (
            <Card className="stack-sm" style={{ background: 'var(--highlight-soft)' }}>
              <span className="eyebrow">Diagnosis</span>
              <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
                {state.weaknessTypes.map((t) => (
                  <Chip key={t} variant="warn">
                    {t.replace(/_/g, ' ')}
                  </Chip>
                ))}
              </div>
            </Card>
          )}

          <Card className="stack-sm" style={{ background: 'var(--accent-soft)' }}>
            <span className="eyebrow">Recommended next action</span>
            <p className="text-sm">{nextAction}</p>
          </Card>

          <button
            className="btn btn--primary btn--block"
            onClick={() =>
              navigate(focusMode === 'matrix_lab' ? '/matrix-lab' : `/session/${focusMode}`)
            }
          >
            Practice this skill
          </button>
        </>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="stack-sm">
      <div className="row-between text-sm">
        <span>{label}</span>
        <span className="faint">{Math.round(value * 100)}%</span>
      </div>
      <Bar value={value} />
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-tile">
      <span className="faint text-xs">{label}</span>
      <span className="stat-value" style={{ fontSize: 'var(--text-xl)' }}>
        {value}
      </span>
    </div>
  );
}
