# NestEgg — Product Blueprint

**Version:** 0.2.0
**Updated:** 2026-07-21
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

### Next up

- 🔲 Chunk-budget: split recharts + radix vendor bundle (currently 824 KB / 243 KB
  gzip; kafcade v2.7 flag)
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
  App.tsx               — StoreProvider wrapper + single Home route
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
    money.ts            — cents math, formatting, local-time month keys
    utils.ts            — cn() and generic helpers
  components/ui/        — shadcn/ui components (Radix wrappers)
  types/                — shared TS types
```

---

## Changelog

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
