import pytest
from evoforge.core.orchestrator import EvoForgeOrchestrator

def test_orchestrator_initialization():
    forge = EvoForgeOrchestrator(pop_size=4)
    assert forge.pop_size == 4
    assert forge.enable_matrix_thinking is True

def test_process_conversation():
    forge = EvoForgeOrchestrator()
    response = forge.process_conversation("Test task with subagents")
    assert "EvoForge Response" in response

def test_evolve_orchestration():
    forge = EvoForgeOrchestrator()
    result = forge.evolve_orchestration("Initial skill", epochs=2)
    assert result["fitness"] > 0.4