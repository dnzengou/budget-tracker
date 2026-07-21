# NestEgg

**AI-adjacent, privacy-first budget & expense tracker.** All data stays in
your browser — no accounts, no server, no telemetry.

[![CI](https://github.com/dnzengou/budget-tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/dnzengou/budget-tracker/actions/workflows/ci.yml)
[![CodeQL](https://github.com/dnzengou/budget-tracker/actions/workflows/codeql.yml/badge.svg)](https://github.com/dnzengou/budget-tracker/actions/workflows/codeql.yml)

## Features

- Track income + expenses for one or more household members
- Deterministic auto-categorization from note keywords (type-aware)
- Per-category budgets with pressure insights
- 6-month trend + category breakdown dashboard
- Deterministic rule-based insights (MoM swings, savings rate, recurring load)
- CSV import + export (round-trip)
- Two in-browser roles: **Admin** (read/write) · **Guest** (read-only)

## Stack

React 19 · Vite 7 · TypeScript 5.9 (strict) · Tailwind 3.4 · shadcn/ui · recharts · react-router 7

## Run locally

```bash
npm install
npm run dev       # http://localhost:3000
npm run build     # tsc + vite build → dist/
npm run lint
```

## Environment variables

Vite exposes anything prefixed with `VITE_` to the browser bundle. All values
below are optional; defaults preserve legacy dev credentials.

| Variable                | Default     | Purpose                          |
| ----------------------- | ----------- | -------------------------------- |
| `VITE_ADMIN_PASSWORD`   | `admin123`  | Login password for Admin role    |
| `VITE_GUEST_PASSWORD`   | `guest`     | Login password for Guest role    |

## Deploy

Push to `main` → Vercel auto-detects Vite and rebuilds. Security headers
(CSP, HSTS, X-Frame-Options, etc.) are declared in [vercel.json](vercel.json)
and applied at the edge.

## Documentation

- [BLUEPRINT.md](BLUEPRINT.md) — roadmap, changelog, architecture map
- [SECURITY.md](SECURITY.md) — reporting policy + threat model

## License

MIT
