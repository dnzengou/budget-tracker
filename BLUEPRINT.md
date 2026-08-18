# NestEgg — Product Blueprint

**Version:** 0.3.0
**Updated:** 2026-08-10
**Live site:** _pending Vercel wiring_
**Repo:** https://github.com/dnzengou/budget-tracker

AI-adjacent, privacy-first budget and expense tracker. All data lives in the
visitor's browser (localStorage); no backend, no accounts, no telemetry.

---

## Product

Single-page app for tracking household income and expenses across one or more
"members" of a nest. Auto-categorization from note text, deterministic rule-based
insights (budget pressure, month-over-month swings, savings rate, recurring load),
CSV import/export.

Two in-browser roles gate the UI:

- **Admin** — full read/write (add, delete, import, reset).
- **Guest** — read-only.

Roles are a UX gate, not an authentication boundary — the app has no server.

### Login credentials

| Role   | Username label | Password (default) | Env override           |
| ------ | -------------- | ------------------ | ---------------------- |
| Admin  | any            | `admin123`         | `VITE_ADMIN_PASSWORD`  |
| Guest  | any            | `guest`            | `VITE_GUEST_PASSWORD`  |

Username is a display label only — only the password is compared. Passwords
are inlined into the client bundle at build time (Vite `import.meta.env`), so
anyone who reads the shipped JavaScript can retrieve them. Treat them as
access hints, not secrets. Rotate by setting the `VITE_*` variables in Vercel
and redeploying.

Admins retrieve the current pair by clicking the **🔑 key icon** in the app
header (`src/components/CredentialsDialog.tsx`); the dialog exposes copy
buttons for both rows.

---

## Stack

- **UI:** React 19 + Vite 7 + TypeScript 5.9 (strict)
- **Styling:** Tailwind 3.4 + shadcn/ui components (Radix primitives)
- **Charts:** recharts
- **State:** `useReducer` + Context (`src/lib/store.tsx`), persisted to
  `localStorage['nestegg-v1']` (excluding `auth`)
- **Router:** react-router v7 (single `/` route today)
- **Deploy:** Vercel (auto-detect Vite preset, `git push` triggers build)

---

## Distribution Channels

| Channel | Status | Path |
| ------- | ------ | ---- |
| Vercel (production web) | ✅ | `git push origin main` → auto build → CDN |
| GitHub Actions CI       | ✅ | `.github/workflows/ci.yml` — lint + build on PR + main |
| CodeQL scanning         | ✅ | `.github/workflows/codeql.yml` — weekly + on PR |
| Dependabot updates      | ✅ | `.github/dependabot.yml` — grouped, weekly |
| Embedded Claude skills  | ✅ | `.claude/skills/*/SKILL.md` — 9 skills discoverable by Claude Code |
| Vendored dev tooling    | ✅ | `tools/claude-skills-sdk/`, `tools/evoforge/` — excluded via `.vercelignore` |
| PWA (installable)       | 🔲 | manifest + service worker + offline shell |
| Native shell (Tauri)    | 🔲 | desktop/mobile bundles, sync via file export |

---

## Roadmap

### Shipped

- ✅ Onboarding: individual vs household mode, currency, members
- ✅ Add / delete / edit transactions with recurring flag
- ✅ Auto-categorization from note keywords (type-aware, v0.2.0)
- ✅ Budgets per category with pressure insights
- ✅ Dashboard: income/spending/net/savings-rate + 6-month trend + category pie
- ✅ CSV import + export (round-trip)
- ✅ Insights: budget breach, month-over-month, top-lever, savings rate,
  recurring-charges audit
- ✅ Local-time month keys (v0.2.0, fixes UTC drift for negative-offset users)
- ✅ Security headers via `vercel.json` (CSP, XFO, XCTO, HSTS, Referrer)
- ✅ localStorage privilege-escalation fix — `auth` no longer persisted (v0.2.0)
- ✅ CI, CodeQL, Dependabot, `SECURITY.md` (v0.2.0)
- ✅ Removed `kimi-plugin-inspect-react` (unreachable private mirror broke
  Vercel `npm install`, v0.2.x hotfix, PR #12)
- ✅ Vendored `claude-skills-sdk` + `evoforge` under `tools/`, mirrored their
  skill prompts into `.claude/skills/` (v0.3.0, PR #12)
- ✅ Admin **Login credentials** dialog + copy-to-clipboard toasts;
  `<Toaster />` mounted globally in `App.tsx` (v0.3.0, PR #16)
- ✅ Currency list extended to 14 codes — added SEK, RWF, KES, XAF
  (v0.3.0, PR #16)
- ✅ README + BLUEPRINT sections documenting credential retrieval + rotation
  (v0.3.0)

### Next up

- 🔲 Chunk-budget: split recharts + radix vendor bundle (currently 849 KB /
  252 KB gzip after credentials dialog — up from 810 / 241; kafcade v2.7 flag)
- 🔲 CSV importer: quoted-note support (`"note, with comma"`) + skipped-row
  count feedback (E audit P1)
- 🔲 Zod schema validation for `load()` output (E audit P1)
- 🔲 Debounce `localStorage.setItem` on rapid dispatch (E audit P2)
- 🔲 Stable keys on list rows (Insights, Dashboard `<Cell>`, Onboarding people)
- 🔲 Delete dead `src/components/ui/sidebar.tsx` + `src/hooks/use-mobile.ts`
- 🔲 Password hashing (SubtleCrypto SHA-256) + rate limiting on login attempts
- 🔲 PWA: manifest + offline shell + install prompt
- 🔲 Multi-language (i18n) — string extraction pass

---

## Architecture

```
src/
  main.tsx              — Vite entry, mounts BrowserRouter + App
  App.tsx               — StoreProvider wrapper + single Home route + Toaster mount
  pages/
    Home.tsx            — auth gate + tabs shell (Dashboard/Transactions/Budgets/Insights)
  sections/
    AddTransaction.tsx  — dialog for new tx
    Budgets.tsx         — per-category budget editor
    Dashboard.tsx       — stat cards + 6-month bars + category pie
    Insights.tsx        — deterministic rule engine output
    Onboarding.tsx      — first-run mode/currency/members setup
    Transactions.tsx    — search/filter list + CSV import/export
  lib/
    store.tsx           — reducer + Context + selective localStorage persistence
    categories.ts       — keyword → category mapping (type-aware)
    csv.ts              — round-trip serialize/parse
    insights.ts         — deterministic rule engine
    money.ts            — cents math, formatting, local-time month keys, CURRENCIES (14 ISO codes)
    utils.ts            — cn() and generic helpers
  components/
    CredentialsDialog.tsx — admin-only key-icon dialog exposing both role passwords + copy buttons
    ui/                 — shadcn/ui components (Radix wrappers) incl. sonner Toaster
  types/                — shared TS types

.claude/skills/         — 9 embedded skills (arm, rrss, kafca, kafcade, devflow, evolve,
                          evolved-skillopt-v2/v3-agentic/v4-bio), each as `<name>/SKILL.md`
tools/
  claude-skills-sdk/    — vendored ARM/RRSS/KafCa/KafCade/DevFlow/Evolve SDK snapshot
  evoforge/             — vendored EvoForge platform snapshot (Agno + SuperAGI + MetaClaw)
  README.md             — layout + refresh procedure
.vercelignore           — excludes tools/ and .claude/ from the Vercel build upload
```

---

## Changelog

### v0.3.0 — 2026-08-10

**Fix (Vercel deployment) — PR #12:**
- Removed `kimi-plugin-inspect-react` devDependency. Its tarball was pinned to
  a private mirror (`npm.mirrors.msh.team`) unreachable from Vercel's build
  network, causing `npm install` to hang and crash with
  `Exit handler never called!`. Also removed the plugin from `vite.config.ts`
  and regenerated `package-lock.json` against the public registry.

**Add (dev tooling) — PR #12:**
- `tools/claude-skills-sdk/` — vendored snapshot of the six-skill SDK (ARM,
  RRSS, KafCa, KafCade, DevFlow, Evolve) with Python/JS/Go SDKs, Rust CLI,
  VS Code + Chrome extensions, Docker image.
- `tools/evoforge/` — vendored snapshot of the EvoForge self-improving agent
  platform (Agno + SuperAGI + EvolvedSkillOpt + MetaClaw), Python package +
  three versioned skill prompts.
- `.claude/skills/*/SKILL.md` — mirrored 9 skill prompts (six SDK skills +
  three EvoForge `evolved-skillopt-v{2,3,4}` skills) as Claude Code-discoverable
  entries.
- `.vercelignore` — keeps `tools/` and `.claude/` out of the Vercel upload so
  the deployment payload stays lean.
- `package.json` — new `skills:list` and `skills:sync` helper scripts.
- `tools/README.md` — layout + refresh procedure.

**Add (admin credentials retrieval) — PR #16:**
- `src/components/CredentialsDialog.tsx` — new admin-only dialog opened via a
  🔑 key icon in the header. Lists both usernames + passwords with copy
  buttons and a rotation note pointing at `VITE_ADMIN_PASSWORD` /
  `VITE_GUEST_PASSWORD`. Passwords already ship in the client bundle, so this
  dialog does not change the attack surface — it just spares the admin a
  DevTools tour when handing the guest password to a viewer.
- `src/App.tsx` — mounted `<Toaster />` once so the dialog's clipboard
  toast actually renders (sonner was installed but never surfaced).
- README + BLUEPRINT sections documenting credential retrieval + rotation.

**Add (currencies) — PR #16:**
- `src/lib/money.ts` — extended `CURRENCIES` from 10 → 14 entries: added
  `SEK` (Swedish krona), `RWF` (Rwandan franc), `KES` (Kenyan shilling),
  `XAF` (Central African CFA franc). All valid ISO 4217 codes that
  `Intl.NumberFormat` handles natively (`RW` and `XRF` from the request were
  normalized to `RWF` and `XAF` respectively — the raw inputs are not ISO
  codes and would throw at runtime).

**Verified:**
- `npm run build` clean; ESLint clean on touched files.
- Headless Chromium (Playwright) end-to-end: 14 currency options render;
  RWF selection flows through onboarding and renders as `RWF 0` in the
  dashboard KPI cards; admin login succeeds; key icon opens the credentials
  dialog; copy button places `admin123` in the clipboard.

### v0.2.0 — 2026-07-21

**Fix (Vercel deployment):**
- Removed unused `User` icon import + dead `showLogin` state that blocked
  `tsc -b` under `noUnusedLocals: true`.

**Strengthen (security defaults):**
- `vercel.json` — CSP, HSTS, X-Frame-Options: DENY, X-Content-Type-Options,
  Referrer-Policy, Permissions-Policy, SPA rewrite, asset cache-control.
- `.github/dependabot.yml` — grouped weekly npm + github-actions.
- `.github/workflows/ci.yml` — lint + build on PR + main, artifact upload.
- `.github/workflows/codeql.yml` — security-extended queries, weekly cron.
- `SECURITY.md` — reporting policy, threat model.

**Security (P0 findings from `kc E`):**
- Removed credential disclosure from login placeholder + error message.
- `auth` no longer persisted to localStorage — flipping `isAdmin` via devtools
  no longer survives reload.
- Login passwords now read from build-time env vars
  (`VITE_ADMIN_PASSWORD` / `VITE_GUEST_PASSWORD`), fallback to prior values.

**Correctness (P1 findings from `kc E`):**
- `autoCategorize` filters keywords by tx type — an expense note "salary refund"
  no longer files as income `Salary`.
- Local-time month keys in `money.ts` + `insights.ts` + `Dashboard.tsx` +
  `AddTransaction.tsx` — no more UTC drift for users west of UTC.
- `Transactions.tsx` importer wrapped in try/catch, surfaces errors to the UI.

**Quality:**
- Store reducer boilerplate cleanup — no more `auth: state.auth` re-set on
  every case.
- ESLint config: `react-refresh/only-export-components` relaxed for shadcn/ui
  files (they ship helper hooks alongside components by design).

### v0.1.0 — 2026-07-19

Initial NestEgg drop: onboarding, transactions, budgets, dashboard, insights,
CSV round-trip, react-router shell, shadcn/ui theme.
