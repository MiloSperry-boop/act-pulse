import type { Passage, QuestionStimulus } from '../data/questionSchema';

export function MatrixView({
  name,
  values,
}: {
  name?: string;
  values: number[][];
}) {
  const cols = values[0]?.length ?? 0;
  return (
    <div className="row" style={{ gap: 'var(--sp-2)', alignItems: 'center' }}>
      {name && <strong className="mono">{name} =</strong>}
      <div
        className="matrix-grid"
        style={{ gridTemplateColumns: `repeat(${cols}, auto)` }}
        role="img"
        aria-label={`Matrix ${name ?? ''} with values ${values
          .map((r) => r.join(' '))
          .join('; ')}`}
      >
        {values.flatMap((row, r) =>
          row.map((v, c) => (
            <span key={`${r}-${c}`} className="matrix-cell">
              {v}
            </span>
          )),
        )}
      </div>
    </div>
  );
}

export function DataTable({ stimulus }: { stimulus: QuestionStimulus }) {
  if (!stimulus.columns || !stimulus.rows) return null;
  return (
    <figure className="stack-sm" style={{ margin: 0 }}>
      {stimulus.title && <figcaption className="eyebrow">{stimulus.title}</figcaption>}
      <div style={{ overflowX: 'auto' }}>
        <table className="data-table">
          <thead>
            <tr>
              {stimulus.columns.map((c) => (
                <th key={c} scope="col">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {stimulus.rows.map((row, i) => (
              <tr key={i}>
                {row.map((cell, j) => (
                  <td key={j}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {stimulus.caption && (
        <figcaption className="text-xs faint">{stimulus.caption}</figcaption>
      )}
    </figure>
  );
}

export function StimulusView({ stimulus }: { stimulus: QuestionStimulus }) {
  if (stimulus.kind === 'matrix' && stimulus.matrices) {
    return (
      <div className="card card--tight stack">
        {stimulus.matrices.map((m, i) => (
          <MatrixView key={i} name={m.name} values={m.values} />
        ))}
      </div>
    );
  }
  if (stimulus.kind === 'table') {
    return (
      <div className="card card--tight">
        <DataTable stimulus={stimulus} />
      </div>
    );
  }
  if (stimulus.caption) {
    return <p className="muted text-sm">{stimulus.caption}</p>;
  }
  return null;
}

export function PassageView({ passage }: { passage: Passage }) {
  return (
    <div className="stack-sm">
      <div className="eyebrow">{passage.title}</div>
      <div className="passage prose">
        {passage.paragraphs.map((p, i) => (
          <p key={p.id}>
            <span className="faint mono text-xs" style={{ marginRight: 6 }}>
              {i + 1}
            </span>
            {p.text}
          </p>
        ))}
      </div>
      {passage.stimulus && <StimulusView stimulus={passage.stimulus} />}
      <div className="text-xs faint">{passage.attribution}</div>
    </div>
  );
}
