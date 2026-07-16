import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Upload,
  Trash2,
  CalendarPlus,
  Info,
  Share,
} from 'lucide-react';
import { useAppStore } from '../state/appStore';
import { Card, Toggle } from '../components/ui';
import {
  exportAllData,
  parseExport,
  importAllData,
  clearAllProgress,
} from '../data/exportImport';
import { buildDailyReminderIcs, downloadText } from '../services/reminders';
import { getContentStats, QUESTION_BANK_VERSION } from '../content/questionBank';
import { ACT_BLUEPRINT } from '../config/actBlueprint';

export function SettingsScreen() {
  const navigate = useNavigate();
  const { profile, settings, updateProfile, updateSettings } = useAppStore();
  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const stats = getContentStats();

  const doExport = async () => {
    const data = await exportAllData();
    downloadText(
      `act-pulse-backup-${new Date().toISOString().slice(0, 10)}.json`,
      JSON.stringify(data, null, 2),
      'application/json',
    );
    setMsg('Progress exported.');
  };

  const doImport = async (file: File) => {
    try {
      const text = await file.text();
      const env = parseExport(JSON.parse(text));
      if (!confirm('Import will replace all current progress. Continue?')) return;
      const res = await importAllData(env);
      setMsg(res.message);
      if (res.ok) {
        await useAppStore.getState().refresh();
      }
    } catch (e) {
      setMsg(e instanceof Error ? e.message : 'Import failed.');
    }
  };

  const doClear = async () => {
    if (!confirm('This permanently deletes all progress. Continue?')) return;
    await clearAllProgress();
    setMsg('Progress cleared.');
  };

  const addReminder = () => {
    const ics = buildDailyReminderIcs(profile.preferredTime ?? '17:00');
    downloadText('act-pulse-reminder.ics', ics, 'text/calendar');
    setMsg('Calendar reminder downloaded — open it to add a daily event.');
  };

  return (
    <div className="stack" style={{ gap: 'var(--sp-5)' }}>
      <header className="stack-sm">
        <div className="eyebrow">Settings</div>
        <h1 className="title-lg">Preferences</h1>
      </header>

      {msg && (
        <Card tight style={{ background: 'var(--accent-soft)' }}>
          <span className="text-sm">{msg}</span>
        </Card>
      )}

      {/* Study plan */}
      <section className="stack">
        <div className="eyebrow">Study plan</div>
        <div className="field">
          <label htmlFor="testdate">Test date</label>
          <input
            id="testdate"
            type="date"
            className="input"
            value={profile.testDate ?? ''}
            onChange={(e) => updateProfile({ testDate: e.target.value || null })}
          />
        </div>
        <div className="field">
          <label htmlFor="target">Target score (personal goal, optional)</label>
          <input
            id="target"
            type="number"
            min={1}
            max={36}
            className="input"
            placeholder="e.g. 30"
            value={profile.targetScore ?? ''}
            onChange={(e) =>
              updateProfile({
                targetScore: e.target.value ? Number(e.target.value) : null,
              })
            }
          />
        </div>
        <div className="field">
          <label htmlFor="minutes">Daily practice minutes</label>
          <select
            id="minutes"
            className="select"
            value={profile.dailyMinutes}
            onChange={(e) =>
              updateProfile({ dailyMinutes: Number(e.target.value) })
            }
          >
            {[5, 10, 15, 20, 30].map((m) => (
              <option key={m} value={m}>
                {m} minutes
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="time">Preferred practice time</label>
          <input
            id="time"
            type="time"
            className="input"
            value={profile.preferredTime ?? '17:00'}
            onChange={(e) => updateProfile({ preferredTime: e.target.value })}
          />
        </div>
        <Row
          label="Include optional Science"
          checked={profile.includeScience}
          onChange={(v) => updateProfile({ includeScience: v })}
        />
        <button className="btn btn--outline btn--block" onClick={addReminder}>
          <CalendarPlus size={18} /> Add daily calendar reminder (.ics)
        </button>
        <p className="text-xs faint">
          A static app can’t send background notifications on its own, so ACT
          Pulse gives you a real calendar event instead. On iPhone, open the
          downloaded file to add it to Calendar.
        </p>
      </section>

      {/* Appearance */}
      <section className="stack">
        <div className="eyebrow">Appearance & behavior</div>
        <div className="field">
          <label htmlFor="theme">Theme</label>
          <select
            id="theme"
            className="select"
            value={settings.theme}
            onChange={(e) =>
              updateSettings({ theme: e.target.value as typeof settings.theme })
            }
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <Row
          label="Show question timer"
          checked={settings.showTimer}
          onChange={(v) => updateSettings({ showTimer: v })}
        />
        <Row
          label="Reduced motion"
          checked={settings.reduceMotion}
          onChange={(v) => updateSettings({ reduceMotion: v })}
        />
        <Row
          label="Sound effects"
          checked={settings.soundEffects}
          onChange={(v) => updateSettings({ soundEffects: v })}
        />
      </section>

      {/* Data */}
      <section className="stack">
        <div className="eyebrow">Your data</div>
        <button className="btn btn--outline btn--block" onClick={doExport}>
          <Download size={18} /> Export progress (JSON)
        </button>
        <button
          className="btn btn--outline btn--block"
          onClick={() => fileRef.current?.click()}
        >
          <Upload size={18} /> Import progress
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void doImport(f);
            e.target.value = '';
          }}
        />
        <button className="btn btn--danger btn--block" onClick={doClear}>
          <Trash2 size={18} /> Clear all progress
        </button>
        <button
          className="btn btn--ghost btn--block"
          onClick={() => {
            void updateProfile({ onboardingComplete: false });
            navigate('/onboarding');
          }}
        >
          Reset onboarding
        </button>
      </section>

      {/* Install */}
      <Card className="stack-sm">
        <div className="row">
          <Share size={18} />
          <strong>Install on iPhone</strong>
        </div>
        <ol className="text-sm muted" style={{ paddingLeft: 'var(--sp-4)' }}>
          <li>Open the site in Safari.</li>
          <li>Tap the Share button.</li>
          <li>Select “Add to Home Screen.”</li>
          <li>Open ACT Pulse from your Home Screen.</li>
        </ol>
      </Card>

      {/* About */}
      <Card className="stack-sm">
        <div className="row">
          <Info size={18} />
          <strong>About</strong>
        </div>
        <p className="text-sm muted">
          ACT Pulse is an independent, offline-first study coach. All progress is
          stored locally on your device — no account, no server, no tracking.
        </p>
        <p className="text-xs faint">
          ACT Pulse is an independent ACT-aligned study tool. It is not
          affiliated with, endorsed by, or sponsored by ACT Education Corp. ACT
          is a registered trademark of ACT Education Corp.
        </p>
        <div className="divider" />
        <div className="text-xs faint stack-sm">
          <span>Question bank version: {QUESTION_BANK_VERSION}</span>
          <span>ACT blueprint: {ACT_BLUEPRINT.label}</span>
          <span>
            Content: {stats.total} questions ({stats.authored} authored,{' '}
            {stats.generated} generated), {stats.passages} passages
          </span>
        </div>
        <button
          className="btn btn--ghost btn--sm"
          onClick={() => navigate('/inspector')}
        >
          Open question bank inspector
        </button>
      </Card>
    </div>
  );
}

function Row({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="row-between">
      <span className="text-sm">{label}</span>
      <Toggle label={label} checked={checked} onChange={onChange} />
    </div>
  );
}
