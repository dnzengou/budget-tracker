# EvoForge

**The Evolutionary Agent Platform**  
*KafCa RRSS — Recursive Self-Improving Skill System*

EvoForge is a production-grade, self-improving agent platform that fuses the best of **Agno** (robust platform infrastructure) and **SuperAGI** (autonomous agent capabilities) with the evolutionary intelligence of **EvolvedSkillOpt v1.1.0+** and **MetaClaw-style** live meta-learning.

Build powerful agents once. Run them in production. Let the entire platform **continuously evolve** from real conversations and usage — safely, observably, and intelligently.

## Why EvoForge?

Most agent platforms are static. You build them, deploy them, and then manually maintain them.

EvoForge is different. It treats the platform itself as an evolvable organism:

- **Matrix-Thinking** for multi-dimensional planning and decision-making
- **Evolutionary Engine** (population dynamics + GRPO mutations + Q-Gate validation)
- **Self-Evolution with Circuit Breaker** protection
- **Live Conversation Meta-Learning** (inspired by MetaClaw)
- **Smart Scheduling** so evolution happens during idle time, not during active use

## Core Philosophy

> Build once. Evolve forever.

EvoForge gives you:
- Production-ready infrastructure (APIs, storage, observability, RBAC, scheduling)
- Powerful autonomous agents with rich toolkits and workflows
- Continuous self-improvement driven by real usage
- Safety mechanisms that prevent runaway evolution or quality collapse

## Key Features

### Platform Layer (Agno-inspired)
- Production API with SSE/WebSockets
- Storage, Observability, RBAC & Security
- Human-in-the-loop approval
- Scheduling & background jobs
- Multiple interfaces (Slack, Telegram, WhatsApp, Discord, etc.)
- Deploy anywhere

### Agent Layer (SuperAGI-inspired)
- Extensible toolkits and workflows
- Memory systems (vector DBs + persistent memory)
- Concurrent agent execution
- Performance telemetry & token optimization
- Graphical interfaces + Action Console

### Evolutionary Intelligence Layer (EvolvedSkillOpt + MetaClaw)
- **Matrix-Thinking**: Multi-dimensional reasoning before planning or mutation
- **Live Meta-Learning**: Every conversation generates evolutionary signals
- **Auto Skill Summarization**: New skills extracted automatically after sessions
- **Self-Evolution**: The platform can improve its own orchestration logic safely
- **Circuit Breaker**: Automatic intervention on stagnation, collapse, or excessive recursion
- **Smart Scheduler**: Heavy evolutionary work runs only during idle/sleep windows
- **Memory Layer**: Episodic, semantic, preference, and project-state memory

## Quick Start

```bash
# Clone the repo
git clone https://github.com/your-org/evoforge.git
cd evoforge

# Install
pip install -e ".[full]"

# Initialize
evo-forge setup

# Start in recommended auto mode
evo-forge start
```

## Repository Structure

```
evoforge/
├── README.md
├── SKILL.md                 # The core platform-agnostic evolutionary skill
├── pyproject.toml
├── src/
│   ├── evoforge/
│   │   ├── core/            # Evolutionary engine, matrix thinking, circuit breaker
│   │   ├── platform/        # Agno-style production infrastructure
│   │   ├── agents/          # SuperAGI-style autonomous agents + toolkits
│   │   ├── metaclaw/        # Live meta-learning, memory, scheduler
│   │   └── cli/             # evo-forge CLI commands
│   └── ...
├── examples/
│   ├── basic_agent.py
│   ├── evolutionary_orchestrator.py
│   └── live_meta_learning_demo.py
├── docs/
│   ├── architecture.md
│   ├── matrix_thinking.md
│   └── self_evolution_guide.md
├── tests/
└── assets/
```

## Documentation

- [Architecture Overview](docs/architecture.md)
- [Matrix-Thinking Deep Dive](docs/matrix_thinking.md)
- [Safe Self-Evolution Guide](docs/self_evolution_guide.md)
- [Integration with Agno & SuperAGI](docs/integration.md)

## Community & Support

- GitHub Discussions
- Discord (coming soon)
- X / Twitter: @EvoForgeAI

## License

MIT License

## Acknowledgments

EvoForge stands on the shoulders of giants:
- Agno (production agent platform infrastructure)
- SuperAGI (autonomous agent framework)
- EvolvedSkillOpt (evolutionary skill optimization)
- MetaClaw (live conversation meta-learning)

---

**EvoForge** — Where production agent platforms meet continuous, intelligent self-evolution.

*Just build. It will get better.*