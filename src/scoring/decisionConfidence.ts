import { CalculatorResult } from '../calculators/types.js';

/**
 * Decision Confidence Score
 * Tells the user how much to trust the numbers
 * Logic: (Match + Coverage + ValuationConf) / 3
 */
export interface DecisionConfidenceInputs {
  matchConfidence: number;
  dataCoverageScore: number;
  valuationConfidence: number;
}

export const calculateDecisionConfidence = (
  inputs: DecisionConfidenceInputs
): CalculatorResult<number> => {
  const { matchConfidence, dataCoverageScore, valuationConfidence } = inputs;

  // Weighted average: Match confidence (40%), Valuation confidence (40%), Data coverage (20%)
  // This prevents low data coverage from overly penalizing the score when we have good match and valuation
  const score = Math.round(
    (matchConfidence * 0.4) + 
    (valuationConfidence * 0.4) + 
    (dataCoverageScore * 0.2)
  );

  const bullets: string[] = [];
  const assumptions: string[] = [];

  bullets.push(`Match confidence: ${matchConfidence}%`);
  bullets.push(`Data coverage: ${dataCoverageScore}%`);
  bullets.push(`Valuation confidence: ${valuationConfidence}%`);
  bullets.push(`Overall decision confidence: ${score}%`);

  let confidenceLevel: string;
  let microcopy: string;

  if (score >= 70) {
    confidenceLevel = 'High';
    microcopy = 'High confidence: we\'re confident in these numbers.';
  } else if (score >= 50) {
    confidenceLevel = 'Moderate';
    microcopy = 'Moderate confidence: we\'re not guessing, but we are squinting.';
  } else if (score >= 30) {
    confidenceLevel = 'Low';
    microcopy = 'Low confidence: we\'re making educated guesses here.';
  } else {
    confidenceLevel = 'Very Low';
    microcopy = 'Very low confidence: treat these numbers as directional only.';
  }

  bullets.push(`Confidence level: ${confidenceLevel}`);
  bullets.push(microcopy);

  assumptions.push('Confidence based on data quality and match accuracy');
  assumptions.push('Professional valuation recommended for low confidence scores');

  return {
    id: 'decision-confidence',
    name: 'Decision Confidence',
    value: score,
    explanation: {
      bullets,
      assumptions,
    },
  };
};
