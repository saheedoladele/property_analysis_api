import { CalculatorResult } from './types.js';

/**
 * Valuation Confidence Calculator
 * Based on comparable sales data quality
 * Formula from SCORING_FORMULAS.md
 */
export interface ValuationConfidenceInputs {
  comparableCount: number;
  salesInLastYear: number; // Number of sales in the last 12 months
}

export const calculateValuationConfidence = (
  inputs: ValuationConfidenceInputs
): CalculatorResult<number> => {
  const { comparableCount, salesInLastYear } = inputs;

  const bullets: string[] = [];
  const assumptions: string[] = [];

  // Base Score: 50 points
  let score = 50;
  bullets.push('Base confidence: 50 points');

  // Comparable Count Adjustment
  if (comparableCount >= 20) {
    score += 35; // Total: 85
    bullets.push(`Excellent: ${comparableCount} comparables (+35 points)`);
  } else if (comparableCount >= 10) {
    score += 25; // Total: 75
    bullets.push(`Good: ${comparableCount} comparables (+25 points)`);
  } else if (comparableCount >= 5) {
    score += 15; // Total: 65
    bullets.push(`Moderate: ${comparableCount} comparables (+15 points)`);
  } else if (comparableCount >= 3) {
    score += 5; // Total: 55
    bullets.push(`Limited: ${comparableCount} comparables (+5 points)`);
  } else {
    score -= 5; // Total: 45
    bullets.push(`Very limited: ${comparableCount} comparables (-5 points)`);
  }

  // Recency Bonus
  if (salesInLastYear >= 5) {
    score = Math.min(score + 10, 100); // Cap at 100
    bullets.push(`Recent activity: ${salesInLastYear} sales in last year (+10 points, capped at 100)`);
  } else if (salesInLastYear === 0) {
    score = Math.max(score - 15, 15); // Minimum 15
    bullets.push(`No recent sales: 0 sales in last year (-15 points, minimum 15)`);
  } else {
    bullets.push(`Some recent activity: ${salesInLastYear} sales in last year (no adjustment)`);
  }

  // Ensure minimum confidence of 15
  score = Math.max(score, 15);
  score = Math.min(score, 100); // Cap at 100

  if (score >= 70) {
    assumptions.push('High confidence: Strong comparable data available');
  } else if (score >= 50) {
    assumptions.push('Moderate confidence: Adequate comparable data');
  } else {
    assumptions.push('Low confidence: Limited comparable data - professional valuation recommended');
  }

  return {
    id: 'valuation-confidence',
    name: 'Valuation Confidence',
    value: Math.round(score),
    explanation: {
      bullets,
      assumptions,
    },
  };
};
