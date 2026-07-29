# EvoForge v4 — Bio-Evolution Layer

The v4 layer sits on top of the matrix-evo engine (v2/v3) and replaces shallow biology (haploid mutation + single static population) with three composed layers that match how real evolution and real strategic interaction work.

## Layered Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│  Layer C — Dempster-Shafer uncertainty                                │
│  (mass functions, belief / plausibility, conservative selection)      │
├──────────────────────────────────────────────────────────────────────┤
│  Layer B — Evolutionary game theory                                   │
│  (payoff matrix, replicator dynamics, ESS detection)                  │
├──────────────────────────────────────────────────────────────────────┤
│  Layer A — Biological substrate                                       │
│  (diploid alleles, speciation, Red Queen, HGT, punctuated equilibrium)│
├──────────────────────────────────────────────────────────────────────┤
│  Matrix-Evo (v2/v3): matrix-thinking, GRPO, Q-gate, circuit breaker   │
└──────────────────────────────────────────────────────────────────────┘
```

Each layer is orthogonal — disable any one and the others still work — but together they answer three different questions:

| Layer | Question | Answer |
|---|---|---|
| A | What varies and propagates? | Diploid alleles, isolated species, lateral transfer, bursts |
| B | How do genomes interact? | Frequency-dependent payoffs converge to ESS |
| C | How well do we know fitness? | Mass functions with explicit ignorance |

## Layer A — Bio Substrate

Five primitives implemented in [bio_evolution.py](../src/evoforge/core/bio_evolution.py):

- **DiploidGenome** — two chromosomes per genome, with per-locus dominance weights. The expressed phenotype is a dominance-weighted blend, so recessive deleterious alleles can persist and surface later when the environment shifts.
- **Species** — populations cluster by genomic distance and reproductively isolate when the centroid distance exceeds `speciation_threshold`. Diversity becomes structural, not just noise.
- **CoevolvingEnvironment** — task targets that evolve to defeat current winners. Prevents overfitting to a static benchmark; the platform self-generates its own curriculum.
- **horizontal_transfer** — high-fitness loci jump between unrelated species, modelling bacterial plasmid transfer. Skill library cross-pollination beyond inheritance.
- **PunctuatedEquilibriumScheduler** — most epochs are stasis; bursts trigger on stagnation, multiplying mutation and HGT rates. Long calm + short revolutions, like the fossil record.

## Layer B — Evolutionary Game Theory

Each genome's first K loci softmax into a strategy distribution over `{aggressive, cooperative, exploratory, conservative}`. A K×K payoff matrix makes fitness frequency-dependent: a genome's payoff depends on what the rest of the population is playing.

- **Replicator dynamics** update strategy frequencies each epoch in proportion to relative fitness.
- **ESS detection** checks whether the current mix is invasion-proof.
- Epoch fitness blends environment fit and strategic payoff via `egt_weight`.

The key consequence: with a Hawk-Dove-style payoff matrix (no pure strategy dominates), the equilibrium is a *mix*. Diversity is mathematically necessary, not just heuristically protected.

## Layer C — Dempster-Shafer Uncertainty

Every fitness observation produces a mass function over `{LOW, MID, HIGH}`. Crucially, mass can be assigned to the *full frame* — meaning "I don't know" — independently of mass on individual hypotheses. Confidence shrinks as the observation becomes less informative.

- **Dempster's rule** fuses per-environment masses, normalising out contradiction.
- **Belief** = lower bound on probability; **Plausibility** = upper bound. The gap is epistemic uncertainty.
- **Selection mode** is configurable:
  - `belief` (default) — conservative; prefer genomes proven not-bad
  - `plausibility` — exploratory; prefer genomes that *might* be great
  - `expected` — pignistic point collapse

A genome with belief 0.4 and plausibility 0.9 is treated differently from one with belief 0.4 and plausibility 0.45 — same expected value, very different exploration value. Layer C makes that distinction explicit.

## Composition in BioEvolutionEngine

Per-epoch flow:

1. Layer C scores every genome against the coevolving environment → MassFunction.
2. Layer B computes population strategy frequencies and per-genome strategic payoff.
3. Combined fitness = `(1 − egt_weight) × env_expected + egt_weight × egt_payoff`.
4. Replicator step + ESS check.
5. Layer A scheduler decides stasis vs burst → sets mutation rate, speciation threshold, HGT rate.
6. Speciation + HGT.
7. Per-species sexual reproduction. Parents are ranked by the configured selection mode (belief / plausibility / expected).
8. Environment co-evolves against the new top genomes.

Reports include strategy frequencies, ESS status, mean belief, mean uncertainty, and the standard bio metrics (species count, evolvability, HGT transfers, regime).

## Why This Is "Evolve the Evolve"

v1-v3 evolved genomes. v4 evolves the **evolutionary process** under three pressures:

- Layer A makes the substrate dynamic (environment, niches, mutation regime all move)
- Layer B makes diversity mathematically required (frequency-dependent payoffs)
- Layer C makes selection epistemically honest (belief intervals, not point estimates)

The composite metric — *evolvability under uncertainty* — is the meta-meta gradient: useful variation per unit time, weighted by belief that it's actually useful.

## Usage

```python
from evoforge import EvoForgeOrchestrator

forge = EvoForgeOrchestrator(
    pop_size=16,
    enable_bio_evolution=True,
    bio_selection_mode="belief",  # or "plausibility" / "expected"
)
reports = forge.run_bio_evolution(epochs=10)
print(forge.get_status()["bio_status"])
```

Or use the engine directly:

```python
from evoforge import BioEvolutionEngine

engine = BioEvolutionEngine(pop_size=16, seed=42)
for report in engine.run(epochs=10):
    print(f"epoch={report.epoch} regime={report.regime} "
          f"species={report.species_count} ess={report.ess_reached} "
          f"belief(HIGH)={report.mean_belief_high:.3f}")
```

## Disabling Layers

Each layer can be neutralised independently for ablation studies:

- Disable Layer C: pass `selection_mode="expected"` — fitness collapses to a point.
- Disable Layer B: set `egt_weight=0.0` — fitness is purely environment-driven.
- Disable Layer A bursts: instantiate the engine with a `PunctuatedEquilibriumScheduler(burst_probability_base=0.0)` and remove stagnation triggers.

The full stack is the default because that's where the meta-gradient lives.
