# tools/

Vendored dev tooling. Not part of the Vercel build (see `.vercelignore`).

## `claude-skills-sdk/`

Snapshot of [`dnzengou/claude-skills-sdk`](https://github.com/dnzengou/claude-skills-sdk) — the six composable Claude skills (ARM, RRSS, KafCa, KafCade, DevFlow, Evolve) plus Python/JS/Go SDKs, Rust CLI, VS Code + Chrome extensions, Android APK, and Docker image.

The skill prompts themselves are re-exposed to Claude Code as embedded skills under `.claude/skills/`.

## `evoforge/`

Snapshot of the EvoForge platform (self-improving agent platform combining Agno, SuperAGI, EvolvedSkillOpt, and MetaClaw). Contains the Python `evoforge` package and three versioned skill prompts (`v2` matrix + circuit breaker, `v3` agentic orchestration, `v4` bio evolution) that are also mirrored into `.claude/skills/`.

## Refreshing

These are static snapshots. To pull a newer upstream cut, replace the directory contents and re-mirror the `skills/*.md` files into `.claude/skills/<name>/SKILL.md`.
