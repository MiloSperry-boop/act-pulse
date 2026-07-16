import { create } from 'zustand';
import {
  db,
  ensureSeedRows,
  DEFAULT_PROFILE,
  DEFAULT_SETTINGS,
} from '../data/db';
import type { AppSettings, UserProfile } from '../data/models';

interface AppState {
  hydrated: boolean;
  profile: UserProfile;
  settings: AppSettings;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (patch: Partial<UserProfile>) => Promise<void>;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
}

export function applyTheme(settings: AppSettings): void {
  const root = document.documentElement;
  if (settings.theme === 'system') {
    root.removeAttribute('data-theme');
  } else {
    root.setAttribute('data-theme', settings.theme);
  }
  root.setAttribute('data-reduce-motion', String(settings.reduceMotion));
  // Standalone detection for iOS safe-area tuning.
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    // @ts-expect-error iOS Safari legacy flag
    window.navigator.standalone === true;
  root.classList.toggle('is-standalone', standalone);
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrated: false,
  profile: DEFAULT_PROFILE,
  settings: DEFAULT_SETTINGS,

  init: async () => {
    await ensureSeedRows();
    const [profile, settings] = await Promise.all([
      db.userProfile.get('me'),
      db.settings.get('settings'),
    ]);
    const p = profile ?? DEFAULT_PROFILE;
    const s = settings ?? DEFAULT_SETTINGS;
    applyTheme(s);
    set({ profile: p, settings: s, hydrated: true });
  },

  refresh: async () => {
    const [profile, settings] = await Promise.all([
      db.userProfile.get('me'),
      db.settings.get('settings'),
    ]);
    if (profile) set({ profile });
    if (settings) {
      applyTheme(settings);
      set({ settings });
    }
  },

  updateProfile: async (patch) => {
    const next = { ...get().profile, ...patch };
    await db.userProfile.put(next);
    set({ profile: next });
  },

  updateSettings: async (patch) => {
    const next = {
      ...get().settings,
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    await db.settings.put(next);
    applyTheme(next);
    set({ settings: next });
  },
}));
