# EvoForge Architecture

EvoForge is designed as a layered, evolutionary system.

## High-Level Layers

1. **Foundation Layer** (Agno + SuperAGI)
   - Production runtime, storage, observability, security, interfaces
   - Agent runtime, toolkits, workflows, memory

2. **Intelligence Layer** (EvolvedSkillOpt v1.1.0+)
   - Population of orchestration genomes
   - GRPO mutations informed by Matrix-Thinking
   - Q-Gate validation + Circuit Breaker

3. **Meta-Learning Layer** (MetaClaw-inspired)
   - Live conversation proxy
   - Skill injection + auto-summarization
   - Persistent memory layer
   - Smart scheduler for evolutionary updates

## Data Flow (Simplified)

User Conversation → Proxy → Skill + Memory Injection → Agent Execution (with Matrix Planning)  
→ Performance Signals Captured → Auto Skill Summarization → Evolutionary Population Update (during idle window)  
→ Improved Orchestration Genome → Next conversations benefit

## Safety Mechanisms

- Circuit Breaker (stagnation, diversity collapse, recursion limit, subagent depth)
- Scheduler (evolution only during inactive periods)
- Q-Gate (only beneficial mutations accepted)
- Full lineage + audit logs

This architecture allows EvoForge to start as a powerful static platform and gradually become a living, self-improving system.