# Claude Skills Mobile (Tauri 2)

Cross-platform companion app — Android APK, iOS, Linux, macOS, Windows.

```bash
# Desktop dev
cd mobile && cargo tauri dev

# Android APK (requires ANDROID_HOME + NDK_HOME)
cargo tauri android init
cargo tauri android build

# iOS (macOS only)
cargo tauri ios init
cargo tauri ios build
```

Pre-built APKs on the [releases page](https://github.com/dnzengou/claude-skills-sdk/releases).

Frontend: shared with `site/` so the mobile UI matches the marketing landing.
