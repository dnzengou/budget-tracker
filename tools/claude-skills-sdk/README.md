# Claude Skills SDK

> Six composable skills · eight distribution channels · one source of truth.

ARM · RRSS · KafCa · KafCade · DevFlow · Evolve — bundled as Python, JS, and Go SDKs, a Rust CLI, VS Code + Chrome extensions, an Android APK, and a multi-arch Docker image.

## Quick install

```bash
pip install claude-skills                                    # Python
npm i @claude-skills/core                                    # JS / TS
go get github.com/dnzengou/claude-skills-sdk/sdk/go          # Go
curl -fsSL https://claude-skills.vercel.app/install.sh | sh  # CLI (linux/macos)
iwr https://claude-skills.vercel.app/install.ps1 -useb | iex # CLI (windows)
docker run ghcr.io/dnzengou/claude-skills-sdk list           # Docker
```

## What it ships

| Channel | Path | Install |
|---|---|---|
| Python SDK | [sdk/python](sdk/python/) | `pip install claude-skills` |
| JS / TS SDK | [sdk/js](sdk/js/) | `npm i @claude-skills/core` |
| Go module | [sdk/go](sdk/go/) | `go get github.com/dnzengou/claude-skills-sdk/sdk/go` |
| Rust CLI | [cli](cli/) | `cargo install --path cli` |
| VS Code extension | [extensions/vscode](extensions/vscode/) | sideload `.vsix` from Releases |
| Chrome extension | [extensions/chrome](extensions/chrome/) | unpacked from `extensions/chrome/` |
| Android APK | [mobile](mobile/) | sideload from Releases |
| Docker (GHCR) | [Dockerfile](Dockerfile) | `ghcr.io/dnzengou/claude-skills-sdk` |
| Homebrew | [packaging/homebrew](packaging/homebrew/) | `brew install dnzengou/tap/claude-skills` |
| Scoop | [packaging/scoop](packaging/scoop/) | `scoop install claude-skills` |
| Debian .deb | [packaging/debian](packaging/debian/) | `dpkg -i claude-skills_0.1.0.deb` |

## Build all channels from one source

```bash
# Mirror skills/ into every channel that bundles a local copy
sh scripts/sync-skills.sh

# Then per-channel build:
cd sdk/python && python -m build
cd sdk/js     && npm install && npm run build
cd cli        && cargo build --release
cd mobile     && cargo tauri android build --apk
docker build -t claude-skills .
```

## Repository layout

```
skills/                 single source of truth — 6 skill prompts + index.json
sdk/python/             pip package
sdk/js/                 npm package (TS, ESM)
sdk/go/                 Go module (go:embed)
cli/                    Rust CLI (rust-embed)
mobile/                 Tauri 2 — Android + iOS + desktop
extensions/vscode/      VS Code extension
extensions/chrome/      Manifest V3 extension
.github/workflows/      ci · release · docker · android
install/                curl-pipe installers
packaging/              homebrew · scoop · debian
site/                   marketing landing (Vercel)
Dockerfile              multi-arch image → GHCR
BLUEPRINT.md            architecture, roadmap, version table
DISTRIBUTION.md         consumer install guide
```

## Use the skills

```python
from claude_skills import Skills
system = Skills().compose(["kafca", "rrss"])    # terse + quality discipline
```

```ts
import { compose } from "@claude-skills/core";
const system = await compose(["devflow", "kafca"]);  // pipeline + terse
```

```bash
claude-skills compose evolve kafca rrss > system.txt
```

## See also

- [BLUEPRINT.md](BLUEPRINT.md) — architecture, file manifest, roadmap, version table
- [DISTRIBUTION.md](DISTRIBUTION.md) — consumer install guide per channel
- [skills/](skills/) — the 6 skill prompts themselves

## License

MIT · © 2026 dnzengou
