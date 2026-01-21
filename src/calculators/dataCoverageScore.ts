import { CalculatorResult, ComparableData } from './types.js';

/**
 * Data Coverage Score Calculator
 * Scores based on Land Registry comparable count, recency, and variance
 * Output: 0-100 score
 */
export const calculateDataCoverageScore = (
  comparables: ComparableData
): CalculatorResult<number> => {
  const { count, recency, variance } = comparables;

  let score = 0;
  const bullets: string[] = [];
  const assumptions: string[] = [];

  // Count component (40 points max)
  if (count >= 20) {
    score += 40;
    bullets.push(`Excellent: ${count} comparable sales found`);
  } else if (count >= 10) {
    score += 30;
    bullets.push(`Good: ${count} comparable sales found`);
  } else if (count >= 5) {
    score += 20;
    bullets.push(`Moderate: ${count} comparable sales found`);
  } else if (count >= 2) {
    score += 10;
    bullets.push(`Limited: Only ${count} comparable sales found`);
  } else {
    bullets.push(`Very limited: Only ${count} comparable sale(s) found`);
  }

  // Recency component (30 points max)
  // More recent = better (0 days = 30 points, 365 days = 0 points)
  const recencyScore = Math.max(0, 30 - (recency / 365) * 30);
  score += Math.round(recencyScore);

  if (recency <= 90) {
    bullets.push(`Recent data: Most recent sale was ${recency} days ago`);
  } else if (recency <= 180) {
    bullets.push(`Moderately recent: Most recent sale was ${recency} days ago`);
  } else {
    bullets.push(`Stale data: Most recent sale was ${recency} days ago`);
  }

  // Variance component (30 points max)
  // Lower variance = more consistent = better
  // Variance of 0% = 30 points, variance of 50%+ = 0 points
  const varianceScore = Math.max(0, 30 - (variance / 50) * 30);
  score += Math.round(varianceScore);

  if (variance <= 10) {
    bullets.push(`Low price variance (${variance.toFixed(1)}%): Consistent market`);
  } else if (variance <= 25) {
    bullets.push(`Moderate price variance (${variance.toFixed(1)}%): Some market variation`);
  } else {
    bullets.push(`High price variance (${variance.toFixed(1)}%): Inconsistent market`);
  }

  // Normalise to 0-100
  score = Math.min(100, Math.max(0, score));

  if (score < 40) {
    assumptions.push('Limited data may affect accuracy of valuation');
  } else if (score < 70) {
    assumptions.push('Moderate data quality: results should be treated as directional');
  } else {
    assumptions.push('Good data coverage: results are reliable');
  }

  return {
    id: 'data-coverage-score',
    name: 'Data Coverage Score',
    value: score,
    explanation: {
      bullets,
      assumptions,
    },
  };
};
