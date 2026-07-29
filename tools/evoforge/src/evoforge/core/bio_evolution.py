"""
EvoForge v4 — Bio-Evolution Layer

Three composed layers on top of matrix-evo:

  Layer A — Biological substrate
    1. DiploidGenome                   — paired alleles, dominance-weighted expression
    2. Species                         — niche-isolated subpopulations
    3. CoevolvingEnvironment           — Red Queen task generator
    4. horizontal_transfer             — locus jumps between species
    5. PunctuatedEquilibriumScheduler  — stasis vs burst regime

  Layer B — Evolutionary game theory (strategic interactions)
    6. EvolutionaryGame                — payoff matrix + replicator dynamics + ESS detection
       Fitness becomes frequency-dependent: success depends on what others play.

  Layer C — Dempster-Shafer uncertainty capture (epistemic measurement)
    7. MassFunction + dempster_combine — mass on subsets of fitness hypotheses
       Fitness is no longer a point estimate but a belief / plausibility interval.
       Selection can be conservative (max lower belief) or exploratory (max interval width).

Numpy-only. No LLM calls. The genome here is a numeric vector of orchestration
loci — real EvoForge will map each locus to a skill fragment, but the dynamics
work identically on the abstraction.
"""

from __future__ import annotations

import math
import uuid
from dataclasses import dataclass, field
from typing import Dict, FrozenSet, List, Optional, Tuple

import numpy as np

LOCUS_COUNT = 16  # number of orchestration loci per chromosome


# --------------------------------------------------------------------------- #
# 1. Diploid genome                                                           #
# --------------------------------------------------------------------------- #

@dataclass
class DiploidGenome:
    """Two chromosomes of orchestration loci plus per-locus dominance."""
    chromosome_a: np.ndarray  # shape (LOCUS_COUNT,)
    chromosome_b: np.ndarray
    dominance: np.ndarray     # shape (LOCUS_COUNT,), in [0, 1] — weight of A
    genome_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    species_id: Optional[str] = None
    age: int = 0
    fitness_history: List[float] = field(default_factory=list)
    # Dempster-Shafer mass over fitness hypotheses {LOW, MID, HIGH}; updated per epoch.
    fitness_mass: Optional["MassFunction"] = None

    @classmethod
    def random(cls, rng: np.random.Generator) -> "DiploidGenome":
        return cls(
            chromosome_a=rng.standard_normal(LOCUS_COUNT),
            chromosome_b=rng.standard_normal(LOCUS_COUNT),
            dominance=rng.uniform(0.0, 1.0, LOCUS_COUNT),
        )

    def express(self) -> np.ndarray:
        """Phenotype = dominance-weighted blend of alleles."""
        return self.dominance * self.chromosome_a + (1.0 - self.dominance) * self.chromosome_b

    def distance(self, other: "DiploidGenome") -> float:
        """Normalised genomic distance (Euclidean over expressed phenotype)."""
        diff = self.express() - other.express()
        return float(np.linalg.norm(diff) / math.sqrt(LOCUS_COUNT))


def recombine(parent_a: DiploidGenome, parent_b: DiploidGenome,
              rng: np.random.Generator, mutation_rate: float = 0.05) -> DiploidGenome:
    """Sexual reproduction: independent assortment per chromosome + locus crossover + mutation."""
    # Each child chromosome inherits from one parent, with per-locus crossover.
    mask_a = rng.random(LOCUS_COUNT) < 0.5
    mask_b = rng.random(LOCUS_COUNT) < 0.5
    child_a = np.where(mask_a, parent_a.chromosome_a, parent_b.chromosome_a)
    child_b = np.where(mask_b, parent_a.chromosome_b, parent_b.chromosome_b)
    # Dominance inherited as midpoint with jitter.
    child_dom = 0.5 * (parent_a.dominance + parent_b.dominance) + rng.normal(0, 0.05, LOCUS_COUNT)
    child_dom = np.clip(child_dom, 0.0, 1.0)
    # Mutation: gaussian perturbation on a random subset of loci.
    mut_mask = rng.random(LOCUS_COUNT) < mutation_rate
    child_a = child_a + mut_mask * rng.normal(0, 0.3, LOCUS_COUNT)
    child_b = child_b + mut_mask * rng.normal(0, 0.3, LOCUS_COUNT)
    return DiploidGenome(child_a, child_b, child_dom)


# --------------------------------------------------------------------------- #
# 2. Species                                                                  #
# --------------------------------------------------------------------------- #

@dataclass
class Species:
    """Reproductively-isolated subpopulation occupying a matrix-thinking niche."""
    species_id: str
    members: List[DiploidGenome]
    niche_vector: np.ndarray  # centroid in phenotype space, for niche fitness weighting

    def best(self) -> DiploidGenome:
        return max(self.members, key=lambda g: g.fitness_history[-1] if g.fitness_history else 0.0)

    def mean_fitness(self) -> float:
        scores = [g.fitness_history[-1] for g in self.members if g.fitness_history]
        return float(np.mean(scores)) if scores else 0.0


def detect_speciation(population: List[DiploidGenome],
                      threshold: float = 0.35,
                      rng: Optional[np.random.Generator] = None) -> List[Species]:
    """Greedy single-link clustering on genomic distance; threshold marks species boundary."""
    rng = rng or np.random.default_rng()
    species_list: List[Species] = []
    for g in population:
        placed = False
        for sp in species_list:
            # Compare against species centroid in expressed space.
            centroid_dist = float(np.linalg.norm(g.express() - sp.niche_vector) / math.sqrt(LOCUS_COUNT))
            if centroid_dist < threshold:
                sp.members.append(g)
                g.species_id = sp.species_id
                sp.niche_vector = np.mean([m.express() for m in sp.members], axis=0)
                placed = True
                break
        if not placed:
            sid = str(uuid.uuid4())[:6]
            g.species_id = sid
            species_list.append(Species(sid, [g], g.express().copy()))
    return species_list


# --------------------------------------------------------------------------- #
# 3. Coevolving environment (Red Queen)                                       #
# --------------------------------------------------------------------------- #

@dataclass
class Environment:
    """A task generator — a target vector the genome must approximate.
    Environment fitness rewards being hard for current strong genomes."""
    target: np.ndarray
    env_id: str = field(default_factory=lambda: str(uuid.uuid4())[:8])
    difficulty_history: List[float] = field(default_factory=list)


class CoevolvingEnvironment:
    def __init__(self, pop_size: int = 8, rng: Optional[np.random.Generator] = None):
        self.rng = rng or np.random.default_rng()
        self.envs: List[Environment] = [
            Environment(target=self.rng.standard_normal(LOCUS_COUNT)) for _ in range(pop_size)
        ]

    def score_genome(self, genome: DiploidGenome) -> float:
        """Average fit across environments — closer to target → higher fitness."""
        phen = genome.express()
        distances = [float(np.linalg.norm(phen - env.target) / math.sqrt(LOCUS_COUNT)) for env in self.envs]
        # Map distance → fitness in (0, 1]; closer is better.
        return float(np.mean([1.0 / (1.0 + d) for d in distances]))

    def step(self, top_genomes: List[DiploidGenome], mutation_rate: float = 0.1):
        """Environments evolve to be hard for the current winners.
        Surviving envs are those where the strongest genome did worst (highest dist)."""
        if not top_genomes:
            return
        scored: List[Tuple[Environment, float]] = []
        for env in self.envs:
            worst_for_genomes = max(
                float(np.linalg.norm(g.express() - env.target) / math.sqrt(LOCUS_COUNT))
                for g in top_genomes
            )
            env.difficulty_history.append(worst_for_genomes)
            scored.append((env, worst_for_genomes))
        scored.sort(key=lambda x: x[1], reverse=True)
        # Keep top half; replace bottom half with mutated copies of top.
        keep = max(1, len(scored) // 2)
        survivors = [e for e, _ in scored[:keep]]
        new_envs = list(survivors)
        while len(new_envs) < len(self.envs):
            parent = survivors[self.rng.integers(0, keep)]
            child_target = parent.target + self.rng.normal(0, mutation_rate, LOCUS_COUNT)
            new_envs.append(Environment(target=child_target))
        self.envs = new_envs


# --------------------------------------------------------------------------- #
# 4. Horizontal skill transfer                                                #
# --------------------------------------------------------------------------- #

def horizontal_transfer(species_list: List[Species],
                        rng: np.random.Generator,
                        hgt_rate: float = 0.05) -> int:
    """Probabilistically jump high-fitness loci between unrelated species.
    Returns the number of transfers that occurred."""
    if len(species_list) < 2:
        return 0
    transfers = 0
    for donor_sp in species_list:
        if not donor_sp.members:
            continue
        donor = donor_sp.best()
        donor_phen = donor.express()
        for locus in range(LOCUS_COUNT):
            if rng.random() < hgt_rate:
                # Pick a recipient species other than the donor.
                candidates = [s for s in species_list if s.species_id != donor_sp.species_id and s.members]
                if not candidates:
                    continue
                recipient_sp = candidates[rng.integers(0, len(candidates))]
                recipient = recipient_sp.members[rng.integers(0, len(recipient_sp.members))]
                # Overwrite the locus on chromosome A; B keeps native variant (heterozygote).
                recipient.chromosome_a[locus] = donor_phen[locus]
                transfers += 1
    return transfers


# --------------------------------------------------------------------------- #
# 5. Punctuated equilibrium scheduler                                         #
# --------------------------------------------------------------------------- #

@dataclass
class RegimeState:
    mode: str = "stasis"            # "stasis" | "burst"
    burst_remaining: int = 0
    epochs_in_mode: int = 0


class PunctuatedEquilibriumScheduler:
    """Stasis by default; bursts triggered by stagnation or spontaneous probability."""

    def __init__(self,
                 base_mutation_rate: float = 0.05,
                 burst_mutation_multiplier: float = 5.0,
                 burst_duration: int = 2,
                 burst_probability_base: float = 0.05,
                 stagnation_patience: int = 3):
        self.base_mutation_rate = base_mutation_rate
        self.burst_mutation_multiplier = burst_mutation_multiplier
        self.burst_duration = burst_duration
        self.burst_probability_base = burst_probability_base
        self.stagnation_patience = stagnation_patience
        self.state = RegimeState()
        self._fitness_window: List[float] = []

    def step(self, best_fitness: float, rng: np.random.Generator) -> Dict:
        self._fitness_window.append(best_fitness)
        if len(self._fitness_window) > self.stagnation_patience + 1:
            self._fitness_window.pop(0)
        stagnating = (
            len(self._fitness_window) > self.stagnation_patience
            and (max(self._fitness_window) - min(self._fitness_window)) < 0.01
        )

        if self.state.mode == "burst":
            self.state.burst_remaining -= 1
            if self.state.burst_remaining <= 0:
                self.state = RegimeState(mode="stasis")
        else:
            if stagnating or rng.random() < self.burst_probability_base:
                self.state = RegimeState(mode="burst", burst_remaining=self.burst_duration)

        self.state.epochs_in_mode += 1
        return self.current_regime()

    def current_regime(self) -> Dict:
        if self.state.mode == "burst":
            return {
                "mode": "burst",
                "mutation_rate": self.base_mutation_rate * self.burst_mutation_multiplier,
                "hgt_multiplier": 3.0,
                "speciation_threshold": 0.25,
            }
        return {
            "mode": "stasis",
            "mutation_rate": self.base_mutation_rate,
            "hgt_multiplier": 1.0,
            "speciation_threshold": 0.35,
        }


# --------------------------------------------------------------------------- #
# Layer B — Evolutionary game theory                                          #
# --------------------------------------------------------------------------- #

STRATEGY_LABELS = ("aggressive", "cooperative", "exploratory", "conservative")
K_STRATEGIES = len(STRATEGY_LABELS)


def strategy_mix(genome: DiploidGenome) -> np.ndarray:
    """Map expressed phenotype to a strategy distribution via softmax over the first K loci."""
    logits = genome.express()[:K_STRATEGIES]
    e = np.exp(logits - logits.max())
    return e / e.sum()


class EvolutionaryGame:
    """Frequency-dependent payoffs + replicator dynamics + ESS detection.

    Default payoff matrix is a Hawk-Dove-style mix that rewards strategy diversity:
    no single pure strategy dominates, so an evolutionarily stable mix exists.
    """

    def __init__(self, payoff_matrix: Optional[np.ndarray] = None):
        if payoff_matrix is None:
            payoff_matrix = np.array([
                # against:  agg   coop  expl  cons
                [-0.5,  1.2,  0.6,  0.8],   # aggressive
                [ 0.2,  0.9,  0.7,  0.6],   # cooperative
                [ 0.6,  0.6,  0.3,  0.9],   # exploratory
                [ 0.4,  0.7,  0.5,  0.5],   # conservative
            ])
        assert payoff_matrix.shape == (K_STRATEGIES, K_STRATEGIES)
        self.payoff = payoff_matrix
        self.frequency_history: List[np.ndarray] = []

    def population_frequencies(self, population: List[DiploidGenome]) -> np.ndarray:
        if not population:
            return np.ones(K_STRATEGIES) / K_STRATEGIES
        mixes = np.stack([strategy_mix(g) for g in population])
        return mixes.mean(axis=0)

    def payoff_for(self, genome: DiploidGenome, pop_freq: np.ndarray) -> float:
        """Expected payoff of this genome's strategy mix against the population mix."""
        mix = strategy_mix(genome)
        return float(mix @ self.payoff @ pop_freq)

    def replicator_step(self, freq: np.ndarray, step_size: float = 0.5) -> np.ndarray:
        """Discrete replicator dynamics: strategies grow in proportion to their relative fitness."""
        avg_payoff = freq @ self.payoff @ freq
        per_strategy = self.payoff @ freq
        new_freq = freq * (1.0 + step_size * (per_strategy - avg_payoff))
        new_freq = np.clip(new_freq, 1e-6, None)
        new_freq /= new_freq.sum()
        return new_freq

    def is_ess(self, freq: np.ndarray, tol: float = 1e-3, perturbation: float = 0.05) -> bool:
        """ESS check: every small invading mutant has lower payoff than the resident mix."""
        resident_payoff = freq @ self.payoff @ freq
        for i in range(K_STRATEGIES):
            mutant = freq.copy()
            mutant[i] += perturbation
            mutant /= mutant.sum()
            mixed = (1 - 0.01) * freq + 0.01 * mutant  # rare invader
            invader_payoff = mutant @ self.payoff @ mixed
            resident_against_invader = freq @ self.payoff @ mixed
            if invader_payoff > resident_against_invader + tol:
                return False
        return True

    def step(self, population: List[DiploidGenome]) -> Dict:
        """Record current frequencies, run one replicator step, return diagnostics."""
        observed = self.population_frequencies(population)
        next_freq = self.replicator_step(observed)
        self.frequency_history.append(observed)
        return {
            "observed_freq": observed.tolist(),
            "predicted_next_freq": next_freq.tolist(),
            "labels": list(STRATEGY_LABELS),
            "ess": self.is_ess(observed),
        }


# --------------------------------------------------------------------------- #
# Layer C — Dempster-Shafer uncertainty                                       #
# --------------------------------------------------------------------------- #

# Frame of discernment for fitness: three hypotheses.
FRAME: Tuple[str, ...] = ("LOW", "MID", "HIGH")
FRAME_SET: FrozenSet[str] = frozenset(FRAME)


@dataclass
class MassFunction:
    """Mass assignment over subsets of FRAME. Masses sum to 1; empty set excluded.

    Mass on the full frame {LOW, MID, HIGH} represents pure ignorance — the key
    feature that distinguishes Dempster-Shafer from Bayesian probability.
    """
    masses: Dict[FrozenSet[str], float]

    def __post_init__(self):
        total = sum(self.masses.values())
        if total > 0 and abs(total - 1.0) > 1e-6:
            self.masses = {k: v / total for k, v in self.masses.items()}

    @classmethod
    def from_score(cls, score: float, confidence: float = 0.7) -> "MassFunction":
        """Convert a [0,1] point score into a mass function.

        confidence ∈ [0,1]: fraction of mass placed on the singleton hypothesis;
        the remainder (1 - confidence) is assigned to the full frame as ignorance.
        """
        score = float(np.clip(score, 0.0, 1.0))
        confidence = float(np.clip(confidence, 0.0, 1.0))
        if score < 0.33:
            singleton = frozenset({"LOW"})
        elif score < 0.66:
            singleton = frozenset({"MID"})
        else:
            singleton = frozenset({"HIGH"})
        return cls({
            singleton: confidence,
            FRAME_SET: 1.0 - confidence,
        })

    def belief(self, hypothesis: FrozenSet[str]) -> float:
        """Sum of masses on subsets of the hypothesis. Lower bound on probability."""
        return sum(m for s, m in self.masses.items() if s.issubset(hypothesis))

    def plausibility(self, hypothesis: FrozenSet[str]) -> float:
        """Sum of masses on subsets that intersect the hypothesis. Upper bound on probability."""
        return sum(m for s, m in self.masses.items() if s & hypothesis)

    def expected_value(self, value_map: Optional[Dict[str, float]] = None) -> float:
        """Pignistic expectation: distribute non-singleton mass uniformly over members."""
        value_map = value_map or {"LOW": 0.15, "MID": 0.5, "HIGH": 0.85}
        total = 0.0
        for subset, m in self.masses.items():
            if not subset:
                continue
            per = m / len(subset)
            for h in subset:
                total += per * value_map[h]
        return total


def dempster_combine(m1: MassFunction, m2: MassFunction) -> MassFunction:
    """Dempster's rule of combination — normalises out the conflict mass."""
    combined: Dict[FrozenSet[str], float] = {}
    conflict = 0.0
    for s1, v1 in m1.masses.items():
        for s2, v2 in m2.masses.items():
            inter = s1 & s2
            if not inter:
                conflict += v1 * v2
            else:
                combined[inter] = combined.get(inter, 0.0) + v1 * v2
    norm = 1.0 - conflict
    if norm <= 1e-9:
        # Total conflict — fall back to maximum-ignorance.
        return MassFunction({FRAME_SET: 1.0})
    return MassFunction({k: v / norm for k, v in combined.items()})


def score_genome_uncertain(env: "CoevolvingEnvironment", genome: DiploidGenome) -> MassFunction:
    """Per-environment scores → mass functions → Dempster-combined belief over fitness."""
    phen = genome.express()
    masses = []
    for e in env.envs:
        d = float(np.linalg.norm(phen - e.target) / math.sqrt(LOCUS_COUNT))
        # Map distance to a [0,1] score; closer to target → higher score.
        score = 1.0 / (1.0 + d)
        # Confidence shrinks as distance grows (harder to be certain about poor fits).
        confidence = float(np.clip(1.0 - 0.5 * d, 0.2, 0.95))
        masses.append(MassFunction.from_score(score, confidence=confidence))
    combined = masses[0]
    for m in masses[1:]:
        combined = dempster_combine(combined, m)
    return combined


# --------------------------------------------------------------------------- #
# Top-level driver                                                            #
# --------------------------------------------------------------------------- #

def measure_evolvability(population: List[DiploidGenome], window: int = 5) -> float:
    """Lineage evolvability = mean variance of fitness gain over a window.
    Higher = lineage produces more useful variation per epoch."""
    gains = []
    for g in population:
        h = g.fitness_history[-window:]
        if len(h) >= 2:
            deltas = np.diff(h)
            gains.append(float(np.var(deltas)))
    return float(np.mean(gains)) if gains else 0.0


@dataclass
class BioEvolutionReport:
    epoch: int
    regime: str
    species_count: int
    best_fitness: float
    mean_fitness: float
    evolvability: float
    hgt_transfers: int
    # Layer B / C diagnostics
    strategy_frequencies: List[float] = field(default_factory=list)
    ess_reached: bool = False
    mean_belief_high: float = 0.0
    mean_uncertainty: float = 0.0


class BioEvolutionEngine:
    """Drives one full bio-evolutionary run combining all three layers.

    Layer A — bio substrate (diploid, speciation, coevolution, HGT, punctuated equilibrium)
    Layer B — evolutionary game theory (frequency-dependent payoffs, ESS)
    Layer C — Dempster-Shafer uncertainty (belief-bound fitness, conservative selection)
    """

    def __init__(self,
                 pop_size: int = 16,
                 seed: Optional[int] = None,
                 scheduler: Optional[PunctuatedEquilibriumScheduler] = None,
                 environment: Optional[CoevolvingEnvironment] = None,
                 game: Optional[EvolutionaryGame] = None,
                 egt_weight: float = 0.35,
                 selection_mode: str = "belief"):
        """
        selection_mode:
          "belief"     — sort parents by lower bound (conservative under uncertainty)
          "plausibility" — sort by upper bound (exploratory)
          "expected"   — pignistic expected value (Bayesian-ish collapse)
        """
        self.rng = np.random.default_rng(seed)
        self.population: List[DiploidGenome] = [DiploidGenome.random(self.rng) for _ in range(pop_size)]
        self.scheduler = scheduler or PunctuatedEquilibriumScheduler()
        self.environment = environment or CoevolvingEnvironment(rng=self.rng)
        self.game = game or EvolutionaryGame()
        self.egt_weight = float(np.clip(egt_weight, 0.0, 1.0))
        assert selection_mode in {"belief", "plausibility", "expected"}
        self.selection_mode = selection_mode
        self.species_list: List[Species] = []
        self.lineage_log: List[Dict] = []

    def _selection_score(self, g: DiploidGenome) -> float:
        if g.fitness_mass is None:
            return g.fitness_history[-1] if g.fitness_history else 0.0
        high = frozenset({"HIGH"})
        if self.selection_mode == "belief":
            return g.fitness_mass.belief(high)
        if self.selection_mode == "plausibility":
            return g.fitness_mass.plausibility(high)
        return g.fitness_mass.expected_value()

    def epoch(self, epoch_idx: int) -> BioEvolutionReport:
        # --- Layer C: DS-uncertain scoring against the coevolving environment ---
        pop_freq = self.game.population_frequencies(self.population)
        for g in self.population:
            g.fitness_mass = score_genome_uncertain(self.environment, g)
            env_expected = g.fitness_mass.expected_value()
            # --- Layer B: frequency-dependent strategic payoff ---
            egt_payoff = self.game.payoff_for(g, pop_freq)
            # Normalize EGT payoff into [0,1] via squash, then blend with env fitness.
            egt_norm = 1.0 / (1.0 + math.exp(-egt_payoff))
            combined = (1.0 - self.egt_weight) * env_expected + self.egt_weight * egt_norm
            g.fitness_history.append(combined)
            g.age += 1

        best_fit = max(g.fitness_history[-1] for g in self.population)
        mean_fit = float(np.mean([g.fitness_history[-1] for g in self.population]))

        # Game-theory step: replicator update + ESS check on observed frequencies.
        game_state = self.game.step(self.population)
        high = frozenset({"HIGH"})
        mean_belief = float(np.mean([g.fitness_mass.belief(high) for g in self.population if g.fitness_mass]))
        mean_uncertainty = float(np.mean([
            g.fitness_mass.plausibility(high) - g.fitness_mass.belief(high)
            for g in self.population if g.fitness_mass
        ]))

        # Scheduler decides regime for this epoch.
        regime = self.scheduler.step(best_fit, self.rng)

        # Speciation.
        self.species_list = detect_speciation(
            self.population, threshold=regime["speciation_threshold"], rng=self.rng,
        )

        # Horizontal transfer (rate scaled by regime).
        transfers = horizontal_transfer(
            self.species_list, self.rng,
            hgt_rate=0.05 * regime["hgt_multiplier"],
        )

        # Reproduction within each species — sexual recombination, no cross-species mating.
        # Selection uses DS-aware score (Layer C): belief / plausibility / expected.
        next_population: List[DiploidGenome] = []
        for sp in self.species_list:
            sp.members.sort(key=self._selection_score, reverse=True)
            # Elitism: top genome always survives.
            elite = sp.members[0]
            slots = max(1, len(sp.members))
            next_population.append(elite)
            # Fill remaining slots via tournament-pair recombination.
            parents = sp.members[: max(2, len(sp.members) // 2)]
            while len(next_population) - sum(1 for _ in self.species_list) < slots and len(parents) >= 2:
                p1 = parents[self.rng.integers(0, len(parents))]
                p2 = parents[self.rng.integers(0, len(parents))]
                next_population.append(recombine(p1, p2, self.rng, mutation_rate=regime["mutation_rate"]))
                if len(next_population) >= len(self.population):
                    break
            if len(next_population) >= len(self.population):
                break

        # Trim or pad to original pop_size.
        if len(next_population) > len(self.population):
            next_population = next_population[: len(self.population)]
        while len(next_population) < len(self.population):
            next_population.append(DiploidGenome.random(self.rng))
        self.population = next_population

        # Environment co-evolves against the top genomes.
        top_k = sorted(self.population, key=lambda g: g.fitness_history[-1] if g.fitness_history else 0.0,
                       reverse=True)[: max(1, len(self.population) // 4)]
        self.environment.step(top_k, mutation_rate=regime["mutation_rate"])

        report = BioEvolutionReport(
            epoch=epoch_idx,
            regime=regime["mode"],
            species_count=len(self.species_list),
            best_fitness=best_fit,
            mean_fitness=mean_fit,
            evolvability=measure_evolvability(self.population),
            hgt_transfers=transfers,
            strategy_frequencies=game_state["observed_freq"],
            ess_reached=bool(game_state["ess"]),
            mean_belief_high=mean_belief,
            mean_uncertainty=mean_uncertainty,
        )
        self.lineage_log.append(report.__dict__.copy())
        return report

    def run(self, epochs: int = 10) -> List[BioEvolutionReport]:
        return [self.epoch(i) for i in range(epochs)]
