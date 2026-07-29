# Distribution Guide

Per-channel install + first-run for every shipping target.

## TL;DR

```bash
pip install claude-skills && claude-skills list
```

## Python (PyPI)

```bash
pip install claude-skills
# With optional model SDK
pip install "claude-skills[anthropic]"
pip install "claude-skills[openai]"
pip install "claude-skills[all]"
```

```python
from claude_skills import Skills
print(Skills().list())
system = Skills().compose(["kafca", "rrss"])
```

## JS / TS (npm)

```bash
npm i @claude-skills/core
# Yarn / pnpm work too
```

```ts
import { compose, list, get } from "@claude-skills/core";
console.log(await list());
```

## Go module

```bash
go get github.com/dnzengou/claude-skills-sdk/sdk/go@latest
```

```go
import skills "github.com/dnzengou/claude-skills-sdk/sdk/go"
ids, _ := skills.List()
system, _ := skills.Compose([]string{"kafca", "rrss"}, "")
```

## Rust CLI (curl-pipe, sha256-verified)

**Linux / macOS:**
```bash
curl -fsSL https://claude-skills.vercel.app/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://claude-skills.vercel.app/install.ps1 -useb | iex
```

**From source:**
```bash
git clone https://github.com/dnzengou/claude-skills-sdk
cd claude-skills-sdk
cargo install --path cli
```

## Homebrew

```bash
brew tap dnzengou/tap
brew install claude-skills
```

## Scoop (Windows)

```powershell
scoop bucket add dnzengou https://github.com/dnzengou/scoop-bucket
scoop install claude-skills
```

## Debian / Ubuntu (.deb)

```bash
curl -fsSL -o claude-skills.deb \
  https://github.com/dnzengou/claude-skills-sdk/releases/latest/download/claude-skills_amd64.deb
sudo dpkg -i claude-skills.deb
```

## Docker (GHCR)

```bash
docker run --rm ghcr.io/dnzengou/claude-skills-sdk list
docker run --rm ghcr.io/dnzengou/claude-skills-sdk compose kafca rrss
```

Both `linux/amd64` and `linux/arm64` images published.

## VS Code extension

1. Open VS Code → Extensions
2. Search "Claude Skills" (publisher: dnzengou)
3. Install
4. Command palette: `Claude Skills: Insert Skill Prompt`

Or sideload `.vsix` from [Releases](https://github.com/dnzengou/claude-skills-sdk/releases).

## Chrome extension

1. Download `chrome-extension.zip` from [Releases](https://github.com/dnzengou/claude-skills-sdk/releases)
2. Unzip
3. `chrome://extensions` → Developer mode → Load unpacked → select folder
4. Pin the extension; click the icon on Claude.ai / ChatGPT / Gemini

When the Web Store listing is live, the same extension installs from there with no developer-mode toggle.

## Android APK (sideload)

1. Settings → "Install unknown apps" → enable for your browser
2. Download `claude-skills-mobile.apk` from [Releases](https://github.com/dnzengou/claude-skills-sdk/releases)
3. Verify the `.sha256` matches:
   ```bash
   sha256sum -c claude-skills-mobile.apk.sha256
   ```
4. Install

## Verifying any download

Every CLI binary and every APK ships with a `.sha256` file. The `install.sh` / `install.ps1` scripts check this automatically and refuse on mismatch. To verify manually:

```bash
sha256sum -c claude-skills-x86_64-unknown-linux-gnu.sha256
# or
shasum -a 256 -c claude-skills-aarch64-apple-darwin.sha256
```

## Air-gapped install

All channels embed the skill bundle at build time — no runtime network fetch.
After install you can use the CLI / SDK with no internet access:

```bash
claude-skills compose evolve devflow kafca rrss > offline-system-prompt.txt
```

Then pass that file to any LLM provider as a system prompt.

## Uninstall

| Channel | Command |
|---|---|
| pip | `pip uninstall claude-skills` |
| npm | `npm uninstall -g @claude-skills/core` |
| brew | `brew uninstall claude-skills` |
| scoop | `scoop uninstall claude-skills` |
| dpkg | `sudo apt remove claude-skills` |
| Linux/macOS CLI | `rm /usr/local/bin/claude-skills` |
| Windows CLI | `Remove-Item $env:LOCALAPPDATA\Programs\claude-skills\claude-skills.exe` |
| VS Code | Extensions panel → Uninstall |
| Chrome | `chrome://extensions` → Remove |
| Android | Settings → Apps → Claude Skills → Uninstall |
| Docker | `docker rmi ghcr.io/dnzengou/claude-skills-sdk` |

## Reporting issues

GitHub Issues: https://github.com/dnzengou/claude-skills-sdk/issues
