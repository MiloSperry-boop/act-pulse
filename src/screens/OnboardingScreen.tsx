import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mountain, ChevronRight } from 'lucide-react';
import { useAppStore } from '../state/appStore';
import { db } from '../data/db';
import { createSkillState } from '../engine/adaptiveEngine';
import { SKILL_BY_ID } from '../config/skills';

const PRESELECTED = [
  'eng.comma.intro',
  'eng.prod.writersgoal',
  'eng.prod.purpose',
  'eng.usage.sva.intervening',
  'math.nq.matrix.multiply',
  'math.ies.multistep',
  'read.speed.efficiency',
];

const SKILL_CHOICES: { id: string; label: string }[] = [
  { id: 'eng.comma.intro', label: 'Commas' },
  { id: 'eng.prod.writersgoal', label: "Writer's goal" },
  { id: 'eng.prod.purpose', label: 'Passage purpose & summary' },
  { id: 'eng.usage.sva.intervening', label: 'Subject-verb agreement' },
  { id: 'math.nq.matrix.multiply', label: 'Matrices' },
  { id: 'math.ies.multistep', label: 'Difficult multistep math' },
  { id: 'read.speed.efficiency', label: 'Reading speed' },
];

export function OnboardingScreen() {
  const navigate = useNavigate();
  const updateProfile = useAppStore((s) => s.updateProfile);
  const [step, setStep] = useState(0);

  const [testDate, setTestDate] = useState('');
  const [target, setTarget] = useState('');
  const [minutes, setMinutes] = useState(15);
  const [science, setScience] = useState(true);
  const [weaknesses, setWeaknesses] = useState<string[]>(PRESELECTED);

  const toggle = (id: string) =>
    setWeaknesses((w) =>
      w.includes(id) ? w.filter((x) => x !== id) : [...w, id],
    );

  const finish = async (startDiagnostic: boolean) => {
    // Seed skill states for reported weaknesses so they surface immediately.
    for (const id of weaknesses) {
      const skill = SKILL_BY_ID[id];
      if (!skill) continue;
      const existing = await db.skillStates.get(id);
      if (!existing) {
        const st = createSkillState(id, skill.section);
        st.weaknessStatus = 'possible';
        st.currentDifficulty = 2;
        await db.skillStates.put(st);
      }
    }
    await updateProfile({
      onboardingComplete: true,
      testDate: testDate || null,
      targetScore: target ? Number(target) : null,
      dailyMinutes: minutes,
      includeScience: science,
      selfReportedWeaknesses: weaknesses,
      createdAt: new Date().toISOString(),
    });
    navigate(startDiagnostic ? '/session/diagnostic' : '/');
  };

  return (
    <div className="runner stack" style={{ gap: 'var(--sp-5)' }}>
      <header className="stack-sm" style={{ marginTop: 'var(--sp-4)' }}>
        <div className="row" style={{ gap: 'var(--sp-2)' }}>
          <Mountain color="var(--accent)" />
          <strong>Summit</strong>
        </div>
        <p className="faint text-sm">Adaptive daily ACT training</p>
      </header>

      <div className="onboard-dots">
        {[0, 1, 2, 3].map((i) => (
          <span key={i} className={i === step ? 'is-active' : ''} />
        ))}
      </div>

      {step === 0 && (
        <div className="stack" style={{ flex: 1 }}>
          <h1 className="title-lg">Let’s set your goal</h1>
          <div className="field">
            <label htmlFor="td">When are you taking the ACT?</label>
            <input
              id="td"
              type="date"
              className="input"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="tg">Target score (optional)</label>
            <input
              id="tg"
              type="number"
              min={1}
              max={36}
              className="input"
              placeholder="e.g. 30"
              value={target}
              onChange={(e) => setTarget(e.target.value)}
            />
          </div>
          <div className="field">
            <label htmlFor="mn">Minutes per day</label>
            <select
              id="mn"
              className="select"
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
            >
              {[5, 10, 15, 20, 30].map((m) => (
                <option key={m} value={m}>
                  {m} minutes
                </option>
              ))}
            </select>
          </div>
          <p className="text-xs faint">Every detail is optional — you can skip.</p>
        </div>
      )}

      {step === 1 && (
        <div className="stack" style={{ flex: 1 }}>
          <h1 className="title-lg">Optional Science</h1>
          <p className="muted">
            The Science section is optional on the ACT. Include it in your
            training?
          </p>
          <div className="stack-sm">
            <button
              className={`card ${science ? 'card--accent' : ''}`}
              onClick={() => setScience(true)}
            >
              <strong>Yes, include Science</strong>
              <div className="text-sm muted">Recommended for general prep</div>
            </button>
            <button
              className={`card ${!science ? 'card--accent' : ''}`}
              onClick={() => setScience(false)}
            >
              <strong>No, skip Science</strong>
              <div className="text-sm muted">Focus on the Composite sections</div>
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="stack" style={{ flex: 1 }}>
          <h1 className="title-lg">What feels hardest?</h1>
          <p className="muted">
            We’ll start here, then adapt to what your answers actually show.
          </p>
          <div className="stack-sm">
            {SKILL_CHOICES.map((c) => (
              <button
                key={c.id}
                className={`card card--tight row-between ${
                  weaknesses.includes(c.id) ? 'card--accent' : ''
                }`}
                onClick={() => toggle(c.id)}
              >
                <span>{c.label}</span>
                <span
                  className="choice__key"
                  style={{
                    background: weaknesses.includes(c.id)
                      ? 'var(--accent)'
                      : undefined,
                    color: weaknesses.includes(c.id)
                      ? 'var(--on-accent)'
                      : undefined,
                  }}
                >
                  {weaknesses.includes(c.id) ? '✓' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="stack" style={{ flex: 1 }}>
          <h1 className="title-lg">Start smart</h1>
          <p className="muted">
            A 15-minute diagnostic personalizes your question selection. It does
            not estimate an official ACT score.
          </p>
          <button
            className="btn btn--primary btn--lg btn--block"
            onClick={() => finish(true)}
          >
            Take the 15-minute diagnostic
          </button>
          <button
            className="btn btn--outline btn--block"
            onClick={() => finish(false)}
          >
            Skip — begin with my profile
          </button>
        </div>
      )}

      {step < 3 && (
        <div className="runner__footer">
          <button
            className="btn btn--primary btn--lg btn--block"
            onClick={() => setStep((s) => s + 1)}
          >
            Continue <ChevronRight size={18} />
          </button>
          {step > 0 && (
            <button
              className="btn btn--ghost btn--block"
              onClick={() => setStep((s) => s - 1)}
            >
              Back
            </button>
          )}
        </div>
      )}
    </div>
  );
}
