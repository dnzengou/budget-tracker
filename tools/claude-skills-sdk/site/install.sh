#!/usr/bin/env sh
# claude-skills installer — verifies sha256, refuses on mismatch.
set -eu

VERSION="${CLAUDE_SKILLS_VERSION:-latest}"
REPO="dnzengou/claude-skills-sdk"
PREFIX="${CLAUDE_SKILLS_PREFIX:-/usr/local/bin}"

detect_target() {
  os="$(uname -s | tr '[:upper:]' '[:lower:]')"
  arch="$(uname -m)"
  case "$os" in
    linux)  os="unknown-linux-gnu" ;;
    darwin) os="apple-darwin" ;;
    *) echo "unsupported os: $os" >&2; exit 1 ;;
  esac
  case "$arch" in
    x86_64|amd64) arch="x86_64" ;;
    aarch64|arm64) arch="aarch64" ;;
    *) echo "unsupported arch: $arch" >&2; exit 1 ;;
  esac
  echo "${arch}-${os}"
}

TARGET="$(detect_target)"
NAME="claude-skills-${TARGET}"

if [ "$VERSION" = "latest" ]; then
  TAG="$(curl -fsSL "https://api.github.com/repos/${REPO}/releases/latest" | grep -m1 tag_name | sed -E 's/.*"v?([^"]+)".*/v\1/')"
else
  TAG="v${VERSION#v}"
fi

URL="https://github.com/${REPO}/releases/download/${TAG}/${NAME}"
SHA_URL="${URL}.sha256"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

echo "→ downloading $URL"
curl -fsSL "$URL" -o "$TMP/$NAME"
curl -fsSL "$SHA_URL" -o "$TMP/$NAME.sha256"

echo "→ verifying sha256"
( cd "$TMP" && shasum -a 256 -c "$NAME.sha256" ) || { echo "sha256 mismatch — refusing to install" >&2; exit 1; }

chmod +x "$TMP/$NAME"
sudo install -m 0755 "$TMP/$NAME" "$PREFIX/claude-skills" || install -m 0755 "$TMP/$NAME" "$PREFIX/claude-skills"

echo "✓ installed claude-skills $TAG → $PREFIX/claude-skills"
"$PREFIX/claude-skills" list
