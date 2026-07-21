# Security Policy

## Supported Versions

Only the latest release deployed on the production Vercel URL is supported.
NestEgg is a static SPA — all data lives in the visitor's browser (localStorage),
there is no backend to patch.

| Version | Supported |
| ------- | --------- |
| latest  | ✅        |
| older   | ❌        |

## Reporting a Vulnerability

Email **desire.yavro@gmail.com** with:

- a clear description of the issue,
- reproduction steps (URL / browser / actions),
- the impact you observed or believe possible.

Please do **not** open a public GitHub issue for security reports.

You can expect:

- an acknowledgement within **72 hours**,
- a triage summary and fix ETA within **7 days**,
- credit in the release notes (unless you prefer to remain anonymous).

## Threat Model

NestEgg is deliberately minimal:

- **No accounts, no server** — nothing to breach centrally.
- **All data stays in the browser** (`localStorage`) on the user's device.
- The "Admin / Guest" split is an in-browser role gate for demo purposes,
  not an authentication boundary. Anyone with device access has full control.

Out of scope: brute-force of the demo password, social engineering of the
device owner, physical device access, browser extensions the user installed.

In scope: XSS, dependency vulnerabilities, missing security headers,
localStorage privilege escalation without device access, CSRF, clickjacking.
