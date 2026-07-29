#!/usr/bin/env python3
"""
Example: Evolving an Agent Orchestrator with EvoForge
"""

from evoforge import EvoForgeOrchestrator

# Initialize the evolutionary orchestrator
orchestrator = EvoForgeOrchestrator(
    pop_size=6,
    enable_matrix_thinking=True,
    enable_circuit_breaker=True,
    enable_live_meta_learning=True
)

# Initial orchestration skill
initial_skill = """
You are a smart task orchestrator.
Decide when to use subagents and how to coordinate them.
"""

# Evolve it
best_genome = orchestrator.evolve(
    initial_skill=initial_skill,
    benchmark_tasks=["complex_research", "multi_step_coding", "strategic_planning"],
    epochs=4
)

print(f"Best evolved orchestrator fitness: {best_genome.fitness:.3f}")
print("The orchestrator now intelligently uses matrix-thinking for subagent decisions.")