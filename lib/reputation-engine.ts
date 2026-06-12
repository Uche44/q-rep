export interface ReputationMetrics {
  txCount: number;
  votes: number;
  events: number;
  projects: number;
  docs: number;
  bugs: number;
}

export interface ReputationWeightConfig {
  txWeight: number;
  voteWeight: number;
  eventWeight: number;
  projectWeight: number;
  docWeight: number;
  bugWeight: number;
}

// Configurable weights (can load from env or fall back to defaults)
export const DEFAULT_WEIGHTS: ReputationWeightConfig = {
  txWeight: Number(process.env.REPUTATION_WEIGHT_TX ?? 1),
  voteWeight: Number(process.env.REPUTATION_WEIGHT_VOTE ?? 5),
  eventWeight: Number(process.env.REPUTATION_WEIGHT_EVENT ?? 10),
  projectWeight: Number(process.env.REPUTATION_WEIGHT_PROJECT ?? 50),
  docWeight: Number(process.env.REPUTATION_WEIGHT_DOC ?? 20),
  bugWeight: Number(process.env.REPUTATION_WEIGHT_BUG ?? 15),
};

export const TIERS = [
  { name: 'Diamond', minScore: 1500, color: '#E0E7FF' },
  { name: 'Platinum', minScore: 701, color: '#A5B4FC' },
  { name: 'Gold', minScore: 301, color: '#FCD34D' },
  { name: 'Silver', minScore: 101, color: '#D1D5DB' },
  { name: 'Bronze', minScore: 0, color: '#FDBA74' },
];

/**
 * Calculates the total reputation score based on contribution counts and weights.
 */
export function calculateReputationScore(
  metrics: ReputationMetrics,
  weights: ReputationWeightConfig = DEFAULT_WEIGHTS
): number {
  return (
    metrics.txCount * weights.txWeight +
    metrics.votes * weights.voteWeight +
    metrics.events * weights.eventWeight +
    metrics.projects * weights.projectWeight +
    metrics.docs * weights.docWeight +
    metrics.bugs * weights.bugWeight
  );
}

/**
 * Determines the tier level of a user based on their score.
 */
export function getReputationLevel(score: number): string {
  for (const tier of TIERS) {
    if (score >= tier.minScore) {
      return tier.name;
    }
  }
  return 'Bronze';
}

/**
 * Returns the color and next tier details for frontend progress bars.
 */
export function getTierProgressDetails(score: number) {
  const currentTierIndex = TIERS.findIndex(t => score >= t.minScore);
  const currentTier = TIERS[currentTierIndex] || TIERS[TIERS.length - 1];
  
  // If at top tier (Diamond)
  if (currentTierIndex === 0) {
    return {
      currentLevel: currentTier.name,
      nextLevel: 'Max LevelReached',
      minScore: currentTier.minScore,
      nextMinScore: currentTier.minScore,
      percent: 100,
      color: currentTier.color,
    };
  }

  const nextTier = TIERS[currentTierIndex - 1];
  const scoreInCurrentTier = score - currentTier.minScore;
  const totalScoreForNextTier = nextTier.minScore - currentTier.minScore;
  const percent = Math.min(
    100,
    Math.max(0, Math.floor((scoreInCurrentTier / totalScoreForNextTier) * 100))
  );

  return {
    currentLevel: currentTier.name,
    nextLevel: nextTier.name,
    minScore: currentTier.minScore,
    nextMinScore: nextTier.minScore,
    percent,
    color: currentTier.color,
  };
}
