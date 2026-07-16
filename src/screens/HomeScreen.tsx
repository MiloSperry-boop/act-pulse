import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Timer,
  Zap,
  BookOpen,
  Sigma,
  Gauge,
  FlaskConical,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Bell } from 'lucide-react';
import { useAppStore } from '../state/appStore';
import { Card, Chip } from '../components/ui';
import { InstallGuide } from '../components/InstallGuide';
import { TodayDigest } from '../components/TodayDigest';
import { db } from '../data/db';
import {
  getDueReviewCount,
  getTodayDigest,
  getWeeklyActivity,
  type TodayDigest as Digest,
} from '../services/analytics';
import { recommendedDuration } from '../services/sessionService';
import {
  maybeFireDailyReminder,
  shouldShowReminderBanner,
} from '../services/notifications';
import { masteryEstimate } from '../engine/adaptiveEngine';
import { skillLabel } from '../engine/session';
import { SKILLS, INITIAL_WEAKNESS_SKILLS } from '../config/skills';

const QUICK_ACTIONS = [
  { mode: 'quick5', label: 'Quick 5', icon: Zap },
  { mode: 'english_clinic', label: 'English Clinic', icon: BookOpen },
  { mode: 'late_math', label: 'Late-Section Math', icon: Sigma },
  { mode: 'reading_speed', label: 'Reading Sprint', icon: Gauge },
  { mode: 'science_maintenance', label: 'Science', icon: FlaskConical },
] as const;

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const diff = new Date(dateStr).getTime() - Date.now();
  return Math.ceil(diff / 86400000);
}

export function HomeScreen() {
  const navigate = useNavigate();
  const profile = useAppStore((s) => s.profile);
  const settings = useAppStore((s) => s.settings);
  const [dueReviews, setDueReviews] = useState(0);
  const [weeklyMinutes, setWeeklyMinutes] = useState(0);
  const [topSkills, setTopSkills] = useState<string[]>([]);
  const [improvement, setImprovement] = useState<string | null>(null);
  const [digest, setDigest] = useState<Digest | null>(null);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    (async () => {
      setDueReviews(await getDueReviewCount());
      const week = await getWeeklyActivity();
      setWeeklyMinutes(Math.round(week.reduce((a, d) => a + d.minutes, 0)));

      const today = await getTodayDigest(profile.dailyMinutes);
      setDigest(today);

      const reminderCtx = {
        enabled: settings.studyReminders,
        preferredTime: profile.preferredTime,
        studiedToday: today.studied,
      };
      setShowReminder(shouldShowReminderBanner(reminderCtx));
      maybeFireDailyReminder(reminderCtx);

      const states = await db.skillStates.toArray();
      const byId = new Map(states.map((s) => [s.skillId, s]));
      // Priority = confirmed/possible weakness first, else self-reported.
      const ranked = SKILLS.map((sk) => {
        const st = byId.get(sk.id);
        const mastery = st ? masteryEstimate(st) : 0.5;
        const statusWeight =
          st?.weaknessStatus === 'confirmed'
            ? 2
            : st?.weaknessStatus === 'possible'
              ? 1.3
              : INITIAL_WEAKNESS_SKILLS.includes(sk.id)
                ? 1
                : 0.3;
        return { id: sk.id, score: statusWeight * (1 - mastery) };
      }).sort((a, b) => b.score - a.score);
      setTopSkills(ranked.slice(0, 3).map((r) => r.id));

      const improving = states
        .filter((s) => {
          const o = s.recentOutcomes;
          if (o.length < 4) return false;
          const h = Math.floor(o.length / 2);
          const oa = o.slice(0, h).filter((x) => x.correct).length / h;
          const na =
            o.slice(h).filter((x) => x.correct).length / (o.length - h);
          return na - oa > 0.2;
        })
        .sort((a, b) => b.recentAccuracy - a.recentAccuracy)[0];
      setImprovement(improving ? skillLabel(improving.skillId) : null);
    })();
  }, [profile.dailyMinutes, profile.preferredTime, settings.studyReminders]);

  const recMode = recommendedDuration(profile.dailyMinutes);
  const countdown = daysUntil(profile.testDate);
  const greeting = getGreeting();

  return (
    <div className="stack stagger" style={{ gap: 'var(--sp-5)' }}>
      <header className="stack-sm">
        <div className="eyebrow">{greeting}</div>
        <h1 className="title-lg">Let’s train.</h1>
        {countdown !== null && (
          <div className="row" style={{ gap: 'var(--sp-2)' }}>
            <Chip variant="warn">
              {countdown > 0
                ? `${countdown} days to test day`
                : countdown === 0
                  ? 'Test day is today'
                  : 'Test date passed'}
            </Chip>
          </div>
        )}
      </header>

      <InstallGuide />

      {showReminder && (
        <Card tight className="reminder-banner">
          <div className="row" style={{ gap: 'var(--sp-3)' }}>
            <span className="reminder-banner__icon">
              <Bell size={18} />
            </span>
            <div style={{ flex: 1 }}>
              <strong>Time to train</strong>
              <div className="text-xs faint">
                You haven’t practiced today. A short session keeps your streak.
              </div>
            </div>
            <button
              className="btn btn--sm btn--pulse"
              onClick={() => navigate('/session/daily')}
            >
              Start
            </button>
          </div>
        </Card>
      )}

      {/* Primary CTA */}
      <Card accent className="stack">
        <div className="row-between">
          <div>
            <div className="eyebrow">Recommended today</div>
            <h2 className="title">Adaptive Daily Session</h2>
            <p className="muted text-sm">
              ~{profile.dailyMinutes} min · tuned to your weakest skills
            </p>
          </div>
          <Timer size={30} color="var(--accent)" />
        </div>
        <button
          className="btn btn--pulse btn--lg btn--block"
          onClick={() => navigate('/session/daily')}
        >
          Start today’s session
        </button>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => navigate(`/session/${recMode}`)}
        >
          Or a focused {profile.dailyMinutes}-minute set
        </button>
      </Card>

      {/* Today digest */}
      {digest && <TodayDigest digest={digest} />}

      {/* Stats row */}
      <div className="grid-2">
        <div className="stat-tile">
          <span className="row faint text-xs">
            <Flame size={14} /> Streak
          </span>
          <span className="stat-value">{profile.streak}</span>
          <span className="text-xs faint">days in a row</span>
        </div>
        <div className="stat-tile">
          <span className="row faint text-xs">
            <Timer size={14} /> This week
          </span>
          <span className="stat-value">{weeklyMinutes}</span>
          <span className="text-xs faint">minutes trained</span>
        </div>
      </div>

      {/* Due reviews */}
      <Card tight>
        <button
          className="row-between"
          style={{ width: '100%', background: 'none' }}
          onClick={() => navigate('/review')}
        >
          <div className="row">
            <RefreshCw size={20} color="var(--accent)" />
            <div style={{ textAlign: 'left' }}>
              <strong>{dueReviews} reviews due</strong>
              <div className="text-xs faint">Spaced repetition keeps it sticky</div>
            </div>
          </div>
          <ChevronRight size={20} className="faint" />
        </button>
      </Card>

      {/* Priority skills */}
      <section className="stack-sm">
        <div className="eyebrow">Your top focus skills</div>
        <div className="stack-sm">
          {topSkills.map((id) => (
            <button
              key={id}
              className="card card--tight row-between"
              onClick={() => navigate(`/skill/${id}`)}
            >
              <span>{skillLabel(id)}</span>
              <ChevronRight size={18} className="faint" />
            </button>
          ))}
        </div>
        {improvement && (
          <p className="text-sm" style={{ color: 'var(--success)' }}>
            ↑ Improving: {improvement}
          </p>
        )}
      </section>

      {/* Quick actions */}
      <section className="stack-sm">
        <div className="eyebrow">Quick actions</div>
        <div className="row" style={{ flexWrap: 'wrap', gap: 'var(--sp-2)' }}>
          {QUICK_ACTIONS.map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              className="btn btn--sm btn--outline"
              onClick={() => navigate(`/session/${mode}`)}
            >
              <Icon size={16} /> {label}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}
