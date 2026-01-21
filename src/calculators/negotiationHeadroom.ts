import { CalculatorResult } from './types';

/**
 * Negotiation Headroom Calculator
 * Calculates £/% gap between asking and target
 * Suggests a 3-step counter-offer pattern
 */
export interface NegotiationHeadroom {
  gap: number;
  gapPercentage: number;
  steps: {
    step: number;
    amount: number;
    percentage: number;
    rationale: string;
  }[];
}

export const calculateNegotiationHeadroom = (
  askingPrice: number,
  targetPrice: number
): CalculatorResult<NegotiationHeadroom> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  const gap = askingPrice - targetPrice;
  const gapPercentage = (gap / askingPrice) * 100;

  bullets.push(`Negotiation gap: £${gap.toLocaleString('en-GB')} (${gapPercentage.toFixed(1)}%)`);

  // Calculate 3-step counter-offer pattern
  const steps = [];
  
  if (gap > 0) {
    // Step 1: Opening offer (70% of gap)
    const step1Amount = Math.round(targetPrice + (gap * 0.3));
    steps.push({
      step: 1,
      amount: step1Amount,
      percentage: ((askingPrice - step1Amount) / askingPrice) * 100,
      rationale: 'Opening offer: Start below target to leave room for negotiation',
    });

    // Step 2: Middle ground (40% of gap)
    const step2Amount = Math.round(targetPrice + (gap * 0.6));
    steps.push({
      step: 2,
      amount: step2Amount,
      percentage: ((askingPrice - step2Amount) / askingPrice) * 100,
      rationale: 'Counter-offer: Move closer to target if initial offer rejected',
    });

    // Step 3: Final offer (target price)
    steps.push({
      step: 3,
      amount: targetPrice,
      percentage: gapPercentage,
      rationale: 'Final offer: Target price - your walk-away limit',
    });

    bullets.push('3-step negotiation strategy recommended');
    bullets.push(`Step 1: £${step1Amount.toLocaleString('en-GB')} (${((askingPrice - step1Amount) / askingPrice * 100).toFixed(1)}% below asking)`);
    bullets.push(`Step 2: £${step2Amount.toLocaleString('en-GB')} (${((askingPrice - step2Amount) / askingPrice * 100).toFixed(1)}% below asking)`);
    bullets.push(`Step 3: £${targetPrice.toLocaleString('en-GB')} (${gapPercentage.toFixed(1)}% below asking)`);
  } else {
    bullets.push('No negotiation headroom: target price is at or above asking');
    steps.push({
      step: 1,
      amount: targetPrice,
      percentage: 0,
      rationale: 'Offer at asking price or above',
    });
  }

  assumptions.push('Negotiation strategy assumes motivated seller');
  assumptions.push('Market conditions may affect seller flexibility');

  return {
    id: 'negotiation-headroom',
    name: 'Negotiation Headroom',
    value: {
      gap,
      gapPercentage,
      steps,
    },
    explanation: {
      bullets,
      assumptions,
    },
  };
};
