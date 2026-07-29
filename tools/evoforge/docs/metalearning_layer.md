# EvoForge Metalearning Layer

## Overview

The **Metalearning Layer** is the crown jewel of EvoForge. It transforms the platform from a static agent runtime into a living, self-improving system that learns and evolves directly from real-world conversations and usage.

This layer draws heavily from MetaClaw’s live meta-learning architecture while integrating EvolvedSkillOpt’s evolutionary mechanisms (population dynamics, GRPO, Matrix-Thinking, and Circuit Breaker).

## Core Components

### 1. Conversation Proxy & Signal Capture
- Intercepts every interaction between the user and their agents.
- Captures rich signals: success/failure patterns, user feedback, new domain insights, coordination effectiveness, and emerging needs.
- These signals become the raw material for evolution.

### 2. Skill Injection + Auto-Summarization
- Relevant skills and memory units are dynamically injected into prompts (hybrid retrieval: template + semantic).
- At the end of sessions, the system automatically extracts and summarizes new skills or improvements.
- These new skills are added to the skill library and can enter the evolutionary population as candidate genomes.

### 3. Evolutionary Population Engine
- Maintains a population of **orchestration genomes** (the logic that decides how agents are planned, decomposed, and coordinated).
- Uses **Matrix-Thinking** to evaluate mutations across multiple dimensions (performance, cost, safety, future adaptability, coordination overhead).
- Applies **GRPO** (Group Relative Policy Optimization) for directed, sample-efficient mutations.
- **Q-Gate** validates whether a mutation should be accepted, rejected, or partially merged.
- **Circuit Breaker** protects against stagnation, diversity collapse, excessive recursion, or runaway subagent spawning.

### 4. Persistent Memory Layer
- Stores and retrieves:
  - Episodic memory (specific past events)
  - Semantic memory (facts about the user/project)
  - Preference memory (user style and priorities)
  - Project state memory (current goals, open tasks)
- Memory is injected alongside skills for context-aware evolution.

### 5. Smart Scheduler
- Heavy evolutionary work (population updates, complex mutations, self-evolution) is deferred to user-inactive periods:
  - Sleep hours
  - Extended keyboard inactivity
  - Google Calendar meetings (optional)
- This ensures the agent remains responsive during active use.

## How Metalearning Drives Improvement

1. User interacts with agents normally.
2. Signals are captured in real time.
3. New skills or orchestration improvements are summarized.
4. During the next idle window, the evolutionary engine runs:
   - New candidate genomes are generated via matrix-informed GRPO mutations.
   - They are tested against recent task patterns.
   - Beneficial changes are integrated via the Q-Gate.
5. The improved orchestration logic is hot-swapped for future conversations.

## Safety & Governance

- **Circuit Breaker**: Multiple triggers (stagnation, diversity collapse, recursion depth, subagent coordination failures).
- **Lineage Tracking**: Full audit trail of how the orchestration logic evolved.
- **Human Oversight Hooks**: Optional approval gates for major evolutionary changes.
- **Rollback Capability**: Previous best genomes are always preserved.

## Benefits

- The platform gets **smarter over time** without manual prompt engineering.
- Improvements are **grounded in real usage**, not just benchmark scores.
- **Specialization emerges** naturally through niche clustering and matrix-thinking.
- Users benefit from collective learning across the ecosystem while maintaining privacy and control.

## Current Status in EvoForge

The Metalearning Layer is fully specified in the core `SKILL.md` and partially implemented in the Python reference code. Full production implementation would include:

- Background workers for signal processing and summarization
- Vector database integration for memory and skill retrieval
- Scheduler integration (sleep/idle/calendar triggers)
- Hot-swapping mechanism for evolved orchestration genomes

This layer is what makes EvoForge fundamentally different from traditional agent platforms — it doesn’t just run agents; it **cultivates** better agents and better orchestration logic through continuous, safe evolution.

---

*Next evolution target: Allow the Metalearning Layer itself to evolve its own summarization and mutation strategies.*