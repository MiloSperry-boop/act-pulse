import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Card } from '../components/ui';
import { useAppStore } from '../state/appStore';

interface ModeCard {
  mode: string;
  route?: string;
  title: string;
  desc: string;
  approx: string;
  science?: boolean;
}

const GROUPS: { heading: string; items: ModeCard[] }[] = [
  {
    heading: 'Adaptive sessions',
    items: [
      { mode: 'daily', title: 'Adaptive Daily Mix', desc: 'Weaknesses, reviews, a challenge, and maintenance', approx: '~15 min' },
      { mode: 'quick5', title: 'Quick 5 Minutes', desc: 'A short, sharp set', approx: '5–7 Q' },
      { mode: 'standard10', title: 'Standard 10 Minutes', desc: 'A balanced daily set', approx: '9–12 Q' },
      { mode: 'focused15', title: 'Focused 15 Minutes', desc: 'Deeper adaptive practice', approx: '13–17 Q' },
      { mode: 'deep20', title: 'Deep Practice 20 Minutes', desc: 'A full training block', approx: '17–22 Q' },
    ],
  },
  {
    heading: 'English clinics',
    items: [
      { mode: 'english_clinic', title: 'English Clinic', desc: 'Mixed grammar and rhetoric', approx: 'English' },
      { mode: 'comma_clinic', title: 'Comma Clinic', desc: 'Contrast-based comma drills', approx: 'Punctuation' },
      { mode: 'writers_goal', title: "Writer's Goal", desc: 'Purpose, add/delete, relevance', approx: 'Rhetoric' },
      { mode: 'sva', title: 'Subject-Verb Agreement', desc: 'Level 1–8 progression', approx: 'Usage' },
    ],
  },
  {
    heading: 'Math labs',
    items: [
      { mode: 'matrix_lab', route: '/matrix-lab', title: 'Matrix Lab', desc: 'Interactive matrix practice', approx: 'Number & Quantity' },
      { mode: 'late_math', title: 'Late-Section Math', desc: 'Difficult, multistep problems', approx: 'Difficulty 4–5' },
    ],
  },
  {
    heading: 'Reading & Science',
    items: [
      { mode: 'reading_speed', title: 'Reading Speed', desc: 'Comprehension-gated pacing', approx: 'Reading' },
      { mode: 'passage_mapping', title: 'Passage Mapping', desc: 'Label paragraph functions', approx: 'Reading' },
      { mode: 'science_maintenance', title: 'Science Maintenance', desc: 'Data, design, viewpoints', approx: 'Science', science: true },
    ],
  },
  {
    heading: 'Simulations',
    items: [
      { mode: 'blueprint_mix', title: 'ACT Blueprint Mix', desc: 'Matches the real test distribution', approx: 'Mixed' },
      { mode: 'full_section', title: 'Full Section Simulation', desc: 'Current counts and timing', approx: 'Timed' },
    ],
  },
];

export function TrainScreen() {
  const navigate = useNavigate();
  const includeScience = useAppStore((s) => s.profile.includeScience);

  return (
    <div className="stack" style={{ gap: 'var(--sp-5)' }}>
      <header className="stack-sm">
        <div className="eyebrow">Train</div>
        <h1 className="title-lg">Choose your session</h1>
      </header>

      {GROUPS.map((g) => (
        <section key={g.heading} className="stack-sm">
          <div className="eyebrow">{g.heading}</div>
          <div className="stack-sm">
            {g.items
              .filter((it) => includeScience || !it.science)
              .map((it) => (
                <Card
                  key={it.mode}
                  tight
                  role="button"
                  tabIndex={0}
                  onClick={() =>
                    navigate(it.route ?? `/session/${it.mode}`)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter')
                      navigate(it.route ?? `/session/${it.mode}`);
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="row-between">
                    <div>
                      <strong>{it.title}</strong>
                      <div className="text-sm muted">{it.desc}</div>
                    </div>
                    <div className="row" style={{ gap: 'var(--sp-2)' }}>
                      <span className="chip">{it.approx}</span>
                      <ChevronRight size={18} className="faint" />
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
