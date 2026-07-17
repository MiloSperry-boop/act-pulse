# Summit

**Adaptive daily ACT training** — an independent, offline-first Progressive Web App that behaves like a personal ACT coach. It finds the skills you struggle with, adapts every future session to them, and reviews your mistakes with spaced repetition. No account, no backend, no subscription — all progress is stored locally on your device.

> **Disclaimer:** Summit is an independent ACT-aligned study tool. It is not affiliated with, endorsed by, or sponsored by ACT Education Corp. ACT is a registered trademark of ACT Education Corp. All practice content is original and is **not** official ACT material.

---

## Highlights

- **Adaptive engine** — a Beta-distribution mastery model per micro-skill, weighted by difficulty, hint use, response speed, confidence, and spaced-review interval. One early mistake never tanks a skill; a weakness is only *confirmed* after repeated evidence across days.
- **Weakness diagnosis** — distinguishes knowledge, recognition, application, speed, retention, and careless-error patterns, then prescribes a matched intervention.
- **Daily adaptive sessions** in ~5 / 10 / 15 / 20 minutes, composed in phases: retrieval warm-up → primary weakness → secondary weakness → challenge → blueprint maintenance → correction loop → recap.
- **Spaced repetition** with a 0 / 1 / 3 / 7 / 14 / 30-day schedule; delayed correct reviews count as stronger evidence than same-session repeats.
- **Specialized modes** — Comma Clinic, Subject-Verb Agreement (8-level progression), Writer's Goal, an interactive Matrix Lab, Late-Section Math, Reading Speed, Passage Mapping, and Science Maintenance.
- **Current ("Enhanced") ACT blueprint** — 50 English / 45 Math / 36 Reading, current timing, optional Science, field-test questions handled internally. No legacy 75/60/40 counts anywhere.
- **Original content** — authored questions plus deterministic procedural generators (matrices, subject-verb agreement, algebra, functions, probability, statistics) whose answers are computed and validated programmatically.
- **Installable PWA** — Add to Home Screen on iPhone Safari, full offline use after first load, safe-area aware, light/dark themes, reduced-motion support, and an in-app update banner.
- **Your data stays yours** — export/import as JSON, clear progress, and a downloadable `.ics` daily reminder (a static PWA can't send background push, so we hand you a real calendar event instead of faking it).

---

## Tech stack

React · TypeScript · Vite · vite-plugin-pwa · React Router (HashRouter) · Dexie (IndexedDB) · Zod · Zustand · Lucide · Vitest · React Testing Library · ESLint · Prettier · GitHub Actions · GitHub Pages.

No backend, no SSR, no runtime AI, no API keys. It runs entirely as a static site.

---

## Getting started

```bash
npm install
npm run dev          # http://localhost:5173
```

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Preview the production build |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Watch mode |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc -b` (project references) |
| `node scripts/gen-icons.mjs` | Regenerate PWA icons |

---

## Project structure

```
src/
  config/         actBlueprint.ts (single source of truth), skills.ts (micro-skill taxonomy)
  data/           Zod question schema, Dexie DB + migrations, domain models, export/import
  engine/         adaptiveEngine, weakness, spacedRepetition, selection, session, rng (all pure & tested)
  content/        authored questions, procedural generators, reading passages, science sets, validation
  services/       progressService (write path), sessionService, analytics, reminders
  state/          Zustand app store + theme
  components/      QuestionView, Calculator, Stimulus, BottomNav, ProgressRing, UpdateBanner, InstallGuide…
  screens/        Home, Train, Review, Progress, Settings, Onboarding, Session runner, Matrix Lab, Skill detail, Inspector
  styles/         design tokens + global CSS
scripts/          gen-icons.mjs (dependency-free PNG icon generator)
```

### How the adaptive loop works

1. Every answered question flows through `progressService.recordAttempt`, which updates the skill's Beta state, re-classifies weakness status and difficulty, schedules reviews, appends to the mistake notebook, and records daily activity.
2. `sessionService.buildSelectionContext` reads live state and computes per-category blueprint gaps.
3. `engine/selection` scores each candidate question:
   `priority = 0.35·weakness + 0.25·reviewDue + 0.15·uncertainty + 0.15·blueprintGap + 0.10·exploration`,
   then does weighted, constraint-aware selection (no repeats, no more than 3 of one skill in a row).
4. `engine/session` arranges the picks into the phase structure for the chosen mode/duration.

---

## Content

The initial bank ships original, ACT-aligned questions across all four sections plus procedural generators that produce effectively unlimited matrix, subject-verb-agreement, and core-math items. Every question is validated (exactly four choices, one best answer, full explanation, distractor explanations, skill tags, difficulty, expected time, calculator policy) — the suite fails if any question is malformed.

A hidden **Question Bank Inspector** (Settings → About → *Open question bank inspector*, or `/#/inspector`) lets you search, filter, view answers/tags, and run validation in development.

All content is described as *ACT-aligned, original practice content — not official ACT questions.* No copyrighted ACT passages or questions are included.

---

## Install on iPhone (Add to Home Screen)

1. Open the deployed site in **Safari**.
2. Tap the **Share** button.
3. Choose **Add to Home Screen**.
4. Open **Summit** from your Home Screen — it runs full-screen and works offline.

---

## Deployment (GitHub Pages)

The app is configured for a GitHub **project site** at `https://USERNAME.github.io/act-pulse/`.

- The Vite `base` path is derived from `GITHUB_REPOSITORY` at build time, so it works both locally (`/`) and on Pages (`/act-pulse/`) with no hardcoding.
- `HashRouter` means refreshing any nested screen never 404s on Pages.

**To deploy:**

1. Push this repository to GitHub with the default branch `main`.
2. In the repo, go to **Settings → Pages** and set **Source: GitHub Actions**.
3. The included [`deploy.yml`](.github/workflows/deploy.yml) workflow runs on every push to `main`: it checks out, installs with `npm ci`, type-checks, lints, tests, builds, configures Pages, uploads the artifact, and deploys with the official Pages action (with the required `pages: write` / `id-token: write` permissions).
4. Your site appears at `https://USERNAME.github.io/act-pulse/`.

[`ci.yml`](.github/workflows/ci.yml) runs the same type-check / lint / test / build on pushes and PRs.

### Pushing this repository

```bash
git init
git add -A
git commit -m "Initial commit: Summit"
git branch -M main

# With the GitHub CLI authenticated (gh auth status):
gh repo create act-pulse --public --source=. --remote=origin --push

# Or manually:
git remote add origin https://github.com/USERNAME/act-pulse.git
git push -u origin main
```

Then enable **Settings → Pages → Source: GitHub Actions** once.

---

## Privacy

Summit stores everything (profile, settings, attempts, skill states, reviews, mistakes, sessions) locally in your browser's IndexedDB. Nothing is sent to any server. Export your data any time from **Settings → Your data → Export**, and import it on another device.

---

## Roadmap notes

The service worker and data model are structured so optional Web Push could be added later through a backend, but no backend is required or implemented in this release. Writing is intentionally out of scope for the initial version.

---

## License

[MIT](LICENSE). ACT is a registered trademark of ACT Education Corp; Summit is independent and unaffiliated.
