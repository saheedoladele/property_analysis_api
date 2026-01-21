import { CalculatorResult, RiskAppetite } from './types.js';

/**
 * Offer Recommendation Calculator
 * Calculates Anchor, Target, and Walk-away prices
 * Based on valuation and user risk appetite
 */
export interface OfferRecommendation {
  anchor: number; // Opening offer
  target: number; // Ideal price
  walkAway: number; // Maximum acceptable
}

export const calculateOfferRecommendation = (
  askingPrice: number,
  valuationLow: number,
  valuationMedian: number,
  valuationHigh: number,
  riskAppetite: RiskAppetite
): CalculatorResult<OfferRecommendation> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  // Risk appetite multipliers
  const riskMultipliers = {
    conservative: { anchor: 0.85, target: 0.92, walkAway: 0.98 },
    balanced: { anchor: 0.88, target: 0.95, walkAway: 1.0 },
    aggressive: { anchor: 0.90, target: 0.97, walkAway: 1.02 },
  };

  const multipliers = riskMultipliers[riskAppetite.level];

  // Calculate offers based on valuation median
  let anchor = Math.round(valuationMedian * multipliers.anchor);
  let target = Math.round(valuationMedian * multipliers.target);
  let walkAway = Math.round(valuationMedian * multipliers.walkAway);

  // Adjust if asking price is significantly different
  if (askingPrice < valuationLow) {
    // Asking is below range - adjust offers down
    anchor = Math.round(askingPrice * 0.95);
    target = Math.round(askingPrice * 0.98);
    walkAway = Math.round(valuationLow);
    bullets.push('Asking price is below valuation range - offers adjusted accordingly');
  } else if (askingPrice > valuationHigh) {
    // Asking is above range - keep valuation-based offers
    bullets.push('Asking price is above valuation range - offers based on valuation');
  }

  bullets.push(`Anchor offer: £${anchor.toLocaleString('en-GB')} (${riskAppetite.level} strategy)`);
  bullets.push(`Target price: £${target.toLocaleString('en-GB')}`);
  bullets.push(`Walk-away limit: £${walkAway.toLocaleString('en-GB')}`);

  const savings = askingPrice - target;
  if (savings > 0) {
    bullets.push(`Potential savings: £${savings.toLocaleString('en-GB')} if target is achieved`);
  }

  assumptions.push(`Based on ${riskAppetite.level} negotiation strategy`);
  assumptions.push('Offers assume property is in good condition');
  assumptions.push('Market conditions may affect seller receptiveness');

  return {
    id: 'offer-recommendation',
    name: 'Offer Recommendation',
    value: {
      anchor,
      target,
      walkAway,
    },
    explanation: {
      bullets,
      assumptions,
    },
  };
};
