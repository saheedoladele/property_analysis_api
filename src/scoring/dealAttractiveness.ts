import { CalculatorResult } from '../calculators/types';

/**
 * Deal Attractiveness Score
 * Tells the user if they should buy
 * Logic: Weighted average of AskingPosition, Leverage, RiskScore, and StressTestResult
 */
export interface DealAttractivenessInputs {
  askingPricePosition: number; // 0-100 (inverted: below range = high, above = low)
  leverageIndex: number; // 0-100
  riskScore: number; // 0-100 (inverted: lower risk = higher score)
  stressTestPass: boolean; // true = 100, false = 0
}

export const calculateDealAttractiveness = (
  inputs: DealAttractivenessInputs
): CalculatorResult<number> => {
  const { askingPricePosition, leverageIndex, riskScore, stressTestPass } = inputs;

  // Invert risk score (lower risk = higher attractiveness)
  const invertedRiskScore = 100 - riskScore;

  // Convert stress test to score
  const stressTestScore = stressTestPass ? 100 : 0;

  // Weighted average
  // AskingPosition: 30%, Leverage: 25%, Risk: 25%, StressTest: 20%
  const score = Math.round(
    (askingPricePosition * 0.30) +
    (leverageIndex * 0.25) +
    (invertedRiskScore * 0.25) +
    (stressTestScore * 0.20)
  );

  const bullets: string[] = [];
  const assumptions: string[] = [];

  bullets.push(`Asking price position: ${askingPricePosition}%`);
  bullets.push(`Negotiation leverage: ${leverageIndex}%`);
  bullets.push(`Risk assessment: ${invertedRiskScore}% (${100 - invertedRiskScore}% risk)`);
  bullets.push(`Stress test: ${stressTestPass ? 'PASS' : 'FAIL'}`);
  bullets.push(`Overall deal attractiveness: ${score}%`);

  let attractivenessLevel: string;
  let recommendation: string;

  if (score >= 70) {
    attractivenessLevel = 'Highly Attractive';
    recommendation = 'Strong buy signal - this deal looks very attractive';
  } else if (score >= 50) {
    attractivenessLevel = 'Moderately Attractive';
    recommendation = 'Decent deal - proceed with standard due diligence';
  } else if (score >= 30) {
    attractivenessLevel = 'Cautious';
    recommendation = 'Proceed with caution - some concerns identified';
  } else {
    attractivenessLevel = 'Not Attractive';
    recommendation = 'Consider walking away - deal has significant concerns';
  }

  bullets.push(`Attractiveness level: ${attractivenessLevel}`);
  bullets.push(`Recommendation: ${recommendation}`);

  assumptions.push('Score weighted by importance of each factor');
  assumptions.push('Personal circumstances may affect attractiveness');
  assumptions.push('Market conditions can change deal dynamics');

  return {
    id: 'deal-attractiveness',
    name: 'Deal Attractiveness',
    value: score,
    explanation: {
      bullets,
      assumptions,
    },
  };
};
