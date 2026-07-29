"""
EvoForge - Evolutionary Agent Platform
"""

__version__ = "0.2.0"

from .core.orchestrator import EvoForgeOrchestrator
from .core.bio_evolution import (
    BioEvolutionEngine,
    BioEvolutionReport,
    DiploidGenome,
    Species,
    CoevolvingEnvironment,
    EvolutionaryGame,
    MassFunction,
    PunctuatedEquilibriumScheduler,
    dempster_combine,
    horizontal_transfer,
    detect_speciation,
    recombine,
    measure_evolvability,
)

__all__ = [
    "EvoForgeOrchestrator",
    "BioEvolutionEngine",
    "BioEvolutionReport",
    "DiploidGenome",
    "Species",
    "CoevolvingEnvironment",
    "EvolutionaryGame",
    "MassFunction",
    "PunctuatedEquilibriumScheduler",
    "dempster_combine",
    "horizontal_transfer",
    "detect_speciation",
    "recombine",
    "measure_evolvability",
]
