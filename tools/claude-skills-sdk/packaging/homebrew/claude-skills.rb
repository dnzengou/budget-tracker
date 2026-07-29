class ClaudeSkills < Formula
  desc "Distributable Claude skill bundle CLI — ARM, RRSS, KafCa, KafCade, DevFlow, Evolve"
  homepage "https://github.com/dnzengou/claude-skills-sdk"
  version "0.1.0"
  license "MIT"

  on_macos do
    on_intel do
      url "https://github.com/dnzengou/claude-skills-sdk/releases/download/v0.1.0/claude-skills-x86_64-apple-darwin"
      sha256 "REPLACE_AT_RELEASE_TIME"
    end
    on_arm do
      url "https://github.com/dnzengou/claude-skills-sdk/releases/download/v0.1.0/claude-skills-aarch64-apple-darwin"
      sha256 "REPLACE_AT_RELEASE_TIME"
    end
  end

  on_linux do
    on_intel do
      url "https://github.com/dnzengou/claude-skills-sdk/releases/download/v0.1.0/claude-skills-x86_64-unknown-linux-gnu"
      sha256 "REPLACE_AT_RELEASE_TIME"
    end
    on_arm do
      url "https://github.com/dnzengou/claude-skills-sdk/releases/download/v0.1.0/claude-skills-aarch64-unknown-linux-gnu"
      sha256 "REPLACE_AT_RELEASE_TIME"
    end
  end

  def install
    bin.install Dir["claude-skills-*"].first => "claude-skills"
  end

  test do
    assert_match "kafca", shell_output("#{bin}/claude-skills list")
  end
end
