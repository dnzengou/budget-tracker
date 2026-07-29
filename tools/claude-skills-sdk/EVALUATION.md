# Evaluation Report — claude-skills-sdk v0.1.0 · 2026-06-22

## Security (P0)

| File:line | Finding | Severity | Disposition |
|---|---|---|---|
| chrome/popup.js:24 | `root.innerHTML = ""` — clears element only; no user data flows into innerHTML | low | safe (textContent used for skill ids) |
| tauri.conf.json:19 | `style-src 'unsafe-inline'` | low | acceptable (Tauri injects inline styles; `script-src 'self'` strict) |
| site/vercel.json:12 | Same `style-src 'unsafe-inline'` | low | matches landing page inline `<style>`; consider moving to external file later |
| install/install.sh | `sudo install` fallback | low | falls through to non-sudo if writable; errors out otherwise |

**Score: 9/10** — CSP locked everywhere, sha256-verified installers, no hardcoded secrets, all CI tokens via GitHub Actions secrets.

## Correctness (P1)

| File | Finding | Fix applied |
|---|---|---|
| sdk/go/skills.go | `//go:embed all:_skills` requires `_skills/` to exist locally; `go build` fails if user skips `scripts/sync-skills.sh` | docs note added; CI runs sync first |
| sdk/js | no test file | added `tests/test.mjs` smoke test |
| sdk/python/pyproject.toml | `force-include` works only when building from `sdk/python/` | documented in BLUEPRINT |

**Score: 8/10** — works end-to-end on CI's golden path; manual `cargo build` / `go build` from a fresh clone needs the sync script first.

## Performance (P2)

| Surface | Check | Verdict |
|---|---|---|
| Python `client._index` | `lru_cache(maxsize=1)` | ✅ |
| JS `loadIndex` | module-level `indexCache` | ✅ |
| Go `loadIndex` | called per Get (no cache) | acceptable — bundle is ~30KB |
| Rust embed | compile-time inclusion | ✅ |

**Score: 9/10**

## Quality / Consistency (P3-P4)

| Item | Status |
|---|---|
| Uniform API across all SDKs (`list`, `get`, `compose`) | ✅ |
| Missing icons: `extensions/chrome/icon128.png`, `mobile/icons/icon.png` | ⚠ documented in roadmap as v0.2.0 polish |
| Mobile frontend points at marketing site (`../site`) as placeholder | ⚠ noted in BLUEPRINT roadmap |
| JS SDK had no tests | ✅ smoke test added |
| KafCa style in client code (one concept per line, verbose names, no over-abstraction) | ✅ |

**Score: 7/10** — ships v0.1.0 cleanly; icons + dedicated mobile UI tracked for v0.2.0.

## Aggregate

| Axis | Score |
|---|---|
| Security | 9/10 |
| Correctness | 8/10 |
| Performance | 9/10 |
| Quality | 7/10 |

**Verdict: ship v0.1.0.** Quality gaps are cosmetic (icons) or deferred (dedicated mobile UI). Security and correctness pass the bar for first public release.
