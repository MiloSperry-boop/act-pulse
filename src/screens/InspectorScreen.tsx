import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getAllQuestions, getContentStats } from '../content/questionBank';
import { validateAll } from '../content/validate';
import { Card, Chip } from '../components/ui';
import { SECTION_LABELS } from '../config/actBlueprint';
import { skillLabel } from '../engine/session';

/** Developer-only content inspector. Reachable from Settings > About. */
export function InspectorScreen() {
  const navigate = useNavigate();
  const all = useMemo(() => getAllQuestions(), []);
  const stats = useMemo(() => getContentStats(), []);
  const issues = useMemo(() => validateAll(all), [all]);
  const [query, setQuery] = useState('');
  const [section, setSection] = useState('all');

  const filtered = all.filter((q) => {
    if (section !== 'all' && q.section !== section) return false;
    if (!query) return true;
    const hay = `${q.id} ${q.microSkill} ${q.prompt}`.toLowerCase();
    return hay.includes(query.toLowerCase());
  });

  return (
    <div className="screen stack" style={{ gap: 'var(--sp-4)' }}>
      <button className="btn btn--sm btn--ghost" onClick={() => navigate(-1)} style={{ alignSelf: 'flex-start' }}>
        <ArrowLeft size={18} /> Back
      </button>
      <header className="stack-sm">
        <div className="eyebrow">Developer</div>
        <h1 className="title-lg">Question Bank Inspector</h1>
      </header>

      <Card className="stack-sm">
        {issues.length === 0 ? (
          <div className="row" style={{ color: 'var(--success)' }}>
            <CheckCircle2 size={18} /> All {all.length} questions pass validation
          </div>
        ) : (
          <div className="stack-sm" style={{ color: 'var(--danger)' }}>
            <div className="row">
              <AlertTriangle size={18} /> {issues.length} validation issue(s)
            </div>
            {issues.slice(0, 20).map((i, n) => (
              <span key={n} className="text-xs mono">
                {i.questionId}: {i.message}
              </span>
            ))}
          </div>
        )}
      </Card>

      <div className="grid-2">
        <div className="stat-tile">
          <span className="faint text-xs">Total</span>
          <span className="stat-value">{stats.total}</span>
        </div>
        <div className="stat-tile">
          <span className="faint text-xs">Passages</span>
          <span className="stat-value">{stats.passages}</span>
        </div>
      </div>

      <div className="stack-sm">
        <div className="eyebrow">By section</div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(stats.bySection).map(([s, n]) => (
            <Chip key={s}>
              {SECTION_LABELS[s as keyof typeof SECTION_LABELS] ?? s}: {n}
            </Chip>
          ))}
        </div>
        <div className="eyebrow">By difficulty</div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
          {Object.entries(stats.byDifficulty)
            .sort()
            .map(([d, n]) => (
              <Chip key={d}>D{d}: {n}</Chip>
            ))}
        </div>
      </div>

      <input
        className="input"
        placeholder="Search id, skill, prompt…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <div className="row" style={{ flexWrap: 'wrap', gap: 6 }}>
        {['all', 'english', 'math', 'reading', 'science'].map((s) => (
          <button
            key={s}
            className={`chip ${section === s ? 'chip--accent' : ''}`}
            onClick={() => setSection(s)}
          >
            {s === 'all' ? 'All' : SECTION_LABELS[s as keyof typeof SECTION_LABELS]}
          </button>
        ))}
      </div>

      <div className="stack-sm">
        {filtered.slice(0, 60).map((q) => (
          <Card key={q.id} tight className="stack-sm">
            <div className="row-between">
              <span className="mono text-xs">{q.id}</span>
              <div className="row" style={{ gap: 4 }}>
                <Chip>{SECTION_LABELS[q.section]}</Chip>
                <Chip>D{q.difficulty}</Chip>
                <Chip variant={q.sourceType === 'original_authored' ? 'success' : 'default'}>
                  {q.sourceType === 'original_authored' ? 'authored' : 'gen'}
                </Chip>
              </div>
            </div>
            <span className="text-xs faint">{skillLabel(q.microSkill)}</span>
            <p className="text-sm" style={{ whiteSpace: 'pre-line' }}>
              {q.prompt}
            </p>
            <span className="text-xs" style={{ color: 'var(--success)' }}>
              ✓ {q.correctChoiceId}
            </span>
          </Card>
        ))}
        <p className="text-xs faint">
          Showing {Math.min(filtered.length, 60)} of {filtered.length}.
        </p>
      </div>
    </div>
  );
}
