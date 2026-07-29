# Multi-stage: build the Rust CLI, ship a tiny runtime image with skills bundled.
FROM rust:1.81-slim-bookworm AS builder
WORKDIR /src
COPY cli/Cargo.toml cli/
COPY cli/src cli/src/
COPY skills skills/
RUN cd cli && cargo build --release && strip target/release/claude-skills

FROM debian:bookworm-slim
LABEL org.opencontainers.image.source="https://github.com/dnzengou/claude-skills-sdk"
LABEL org.opencontainers.image.description="Claude Skills CLI — ARM, RRSS, KafCa, KafCade, DevFlow, Evolve."
LABEL org.opencontainers.image.licenses="MIT"
RUN apt-get update && apt-get install -y --no-install-recommends ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=builder /src/cli/target/release/claude-skills /usr/local/bin/claude-skills
ENTRYPOINT ["/usr/local/bin/claude-skills"]
CMD ["list"]
