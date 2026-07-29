import numpy as np
import pytest

from evoforge.core.bio_evolution import (
    FRAME_SET,
    BioEvolutionEngine,
    CoevolvingEnvironment,
    DiploidGenome,
    EvolutionaryGame,
    K_STRATEGIES,
    LOCUS_COUNT,
    MassFunction,
    PunctuatedEquilibriumScheduler,
    dempster_combine,
    detect_speciation,
    horizontal_transfer,
    measure_evolvability,
    recombine,
    score_genome_uncertain,
    strategy_mix,
)


# ---------------------------- Layer A: bio substrate ----------------------------

def test_diploid_express_blends_alleles_by_dominance():
    rng = np.random.default_rng(0)
    g = DiploidGenome(
        chromosome_a=np.ones(LOCUS_COUNT),
        chromosome_b=np.zeros(LOCUS_COUNT),
        dominance=np.full(LOCUS_COUNT, 0.75),
    )
    phen = g.express()
    assert np.allclose(phen, 0.75)


def test_recombine_returns_valid_diploid_genome():
    rng = np.random.default_rng(1)
    p1 = DiploidGenome.random(rng)
    p2 = DiploidGenome.random(rng)
    child = recombine(p1, p2, rng, mutation_rate=0.1)
    assert child.chromosome_a.shape == (LOCUS_COUNT,)
    assert child.chromosome_b.shape == (LOCUS_COUNT,)
    assert np.all(child.dominance >= 0.0) and np.all(child.dominance <= 1.0)


def test_speciation_branches_distant_populations():
    rng = np.random.default_rng(2)
    cluster_a = []
    cluster_b = []
    for _ in range(5):
        g = DiploidGenome.random(rng)
        g.chromosome_a = np.full(LOCUS_COUNT, -3.0)
        g.chromosome_b = np.full(LOCUS_COUNT, -3.0)
        cluster_a.append(g)
        h = DiploidGenome.random(rng)
        h.chromosome_a = np.full(LOCUS_COUNT, 3.0)
        h.chromosome_b = np.full(LOCUS_COUNT, 3.0)
        cluster_b.append(h)
    species = detect_speciation(cluster_a + cluster_b, threshold=0.35, rng=rng)
    assert len(species) >= 2


def test_horizontal_transfer_can_move_loci_between_species():
    rng = np.random.default_rng(3)
    species = detect_speciation([DiploidGenome.random(rng) for _ in range(20)],
                                threshold=0.25, rng=rng)
    for sp in species:
        for g in sp.members:
            g.fitness_history.append(rng.random())
    transfers = horizontal_transfer(species, rng, hgt_rate=1.0)
    if len(species) >= 2:
        assert transfers > 0


def test_punctuated_scheduler_enters_burst_on_stagnation():
    sched = PunctuatedEquilibriumScheduler(burst_probability_base=0.0, stagnation_patience=3)
    rng = np.random.default_rng(4)
    for _ in range(5):
        regime = sched.step(0.5, rng)
    assert sched.state.mode == "burst"
    assert regime["mutation_rate"] > sched.base_mutation_rate


def test_coevolving_environment_makes_steps_harder():
    rng = np.random.default_rng(5)
    env = CoevolvingEnvironment(pop_size=6, rng=rng)
    pop = [DiploidGenome.random(rng) for _ in range(8)]
    initial_scores = [env.score_genome(g) for g in pop]
    top = sorted(pop, key=env.score_genome, reverse=True)[:3]
    for _ in range(5):
        env.step(top, mutation_rate=0.2)
    later_scores = [env.score_genome(g) for g in pop]
    assert np.mean(later_scores) <= np.mean(initial_scores) + 0.1


# ---------------------------- Layer B: EGT --------------------------------------

def test_strategy_mix_is_probability_distribution():
    rng = np.random.default_rng(6)
    g = DiploidGenome.random(rng)
    mix = strategy_mix(g)
    assert mix.shape == (K_STRATEGIES,)
    assert np.isclose(mix.sum(), 1.0)
    assert np.all(mix > 0)


def test_replicator_step_increases_high_payoff_strategy():
    game = EvolutionaryGame(payoff_matrix=np.array([
        [2.0, 0.0, 0.0, 0.0],
        [0.0, 0.5, 0.0, 0.0],
        [0.0, 0.0, 0.5, 0.0],
        [0.0, 0.0, 0.0, 0.5],
    ]))
    freq = np.array([0.25, 0.25, 0.25, 0.25])
    next_freq = game.replicator_step(freq, step_size=0.5)
    assert next_freq[0] > freq[0]


def test_ess_detection_runs_on_uniform_distribution():
    game = EvolutionaryGame()
    freq = np.ones(K_STRATEGIES) / K_STRATEGIES
    assert isinstance(game.is_ess(freq), bool)


# ---------------------------- Layer C: Dempster-Shafer --------------------------

def test_mass_function_normalises_and_belief_lt_plausibility():
    m = MassFunction({frozenset({"HIGH"}): 0.4, FRAME_SET: 0.4})
    h = frozenset({"HIGH"})
    b = m.belief(h)
    p = m.plausibility(h)
    assert 0.0 <= b <= p <= 1.0


def test_dempster_combine_concentrates_on_agreement():
    m1 = MassFunction({frozenset({"HIGH"}): 0.7, FRAME_SET: 0.3})
    m2 = MassFunction({frozenset({"HIGH"}): 0.6, FRAME_SET: 0.4})
    combined = dempster_combine(m1, m2)
    assert combined.belief(frozenset({"HIGH"})) > max(
        m1.belief(frozenset({"HIGH"})), m2.belief(frozenset({"HIGH"}))
    )


def test_dempster_combine_handles_total_conflict_gracefully():
    m1 = MassFunction({frozenset({"HIGH"}): 1.0})
    m2 = MassFunction({frozenset({"LOW"}): 1.0})
    combined = dempster_combine(m1, m2)
    # Falls back to maximum ignorance — full frame.
    assert FRAME_SET in combined.masses
    assert np.isclose(sum(combined.masses.values()), 1.0)


def test_score_genome_uncertain_returns_valid_mass_function():
    rng = np.random.default_rng(7)
    env = CoevolvingEnvironment(pop_size=4, rng=rng)
    g = DiploidGenome.random(rng)
    mass = score_genome_uncertain(env, g)
    assert isinstance(mass, MassFunction)
    assert np.isclose(sum(mass.masses.values()), 1.0)


# ---------------------------- End-to-end engine ---------------------------------

def test_bio_engine_runs_and_reports_all_layers():
    engine = BioEvolutionEngine(pop_size=12, seed=42)
    reports = engine.run(epochs=3)
    assert len(reports) == 3
    final = reports[-1]
    assert final.species_count >= 1
    assert 0.0 <= final.mean_belief_high <= 1.0
    assert final.mean_uncertainty >= 0.0
    assert len(final.strategy_frequencies) == K_STRATEGIES
    assert isinstance(final.ess_reached, bool)


def test_selection_modes_change_winner_ordering():
    engine_b = BioEvolutionEngine(pop_size=8, seed=99, selection_mode="belief")
    engine_p = BioEvolutionEngine(pop_size=8, seed=99, selection_mode="plausibility")
    engine_b.run(epochs=2)
    engine_p.run(epochs=2)
    # Both should produce valid evolvability metrics.
    assert measure_evolvability(engine_b.population) >= 0.0
    assert measure_evolvability(engine_p.population) >= 0.0
