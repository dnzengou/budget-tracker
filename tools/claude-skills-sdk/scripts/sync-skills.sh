#!/usr/bin/env sh
# Mirror skills/ into every channel that needs a local copy at build time.
set -eu

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/skills"

mirror() {
  dst="$1"
  rm -rf "$dst"
  mkdir -p "$dst"
  cp "$SRC"/*.md "$SRC"/*.json "$dst/"
  echo "  · $dst"
}

echo "→ sync skills/ into channel-local mirrors"
mirror "$ROOT/sdk/python/src/claude_skills/_skills"
mirror "$ROOT/sdk/go/_skills"
mirror "$ROOT/sdk/js/skills"
mirror "$ROOT/extensions/vscode/skills"
mirror "$ROOT/extensions/chrome/skills"
echo "✓ done"
