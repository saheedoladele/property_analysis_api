import { CalculatorResult } from './types.js';

/**
 * Asking Price Positioning Calculator
 * Determines if asking is Below/Within/Above range
 * Provides "Posture" (e.g., Aggressive/Balanced)
 */
export interface AskingPricePosition {
  position: 'below' | 'within' | 'above';
  percentage: number; // How far from range
  posture: 'aggressive' | 'balanced' | 'optimistic' | 'very-optimistic';
  gap: number; // £ difference
  score: number; // 0-100 score for Deal Attractiveness calculation
}

export const calculateAskingPricePosition = (
  askingPrice: number | null | undefined,
  valuationLow: number,
  valuationHigh: number
): CalculatorResult<AskingPricePosition & { score: number }> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  let position: 'below' | 'within' | 'above';
  let percentage: number;
  let posture: 'aggressive' | 'balanced' | 'optimistic' | 'very-optimistic';
  let gap: number;
  let score: number; // 0-100 score for Deal Attractiveness calculation

  // No asking price provided
  if (!askingPrice || askingPrice === 0) {
    position = 'within';
    gap = 0;
    percentage = 0;
    posture = 'balanced';
    score = 65; // Neutral, slightly positive per formula
    bullets.push('No asking price provided');
    bullets.push('Score: 65 points (neutral, slightly positive)');
  } else if (askingPrice < valuationLow) {
    position = 'below';
    gap = valuationLow - askingPrice;
    percentage = (gap / valuationLow) * 100;
    
    // Formula: Score = max(60, 100 - (Percentage Below × 2))
    score = Math.max(60, 100 - (percentage * 2));
    
    if (percentage > 15) {
      posture = 'aggressive';
      bullets.push(`Asking price is ${percentage.toFixed(1)}% below valuation range`);
      bullets.push('This is an aggressive pricing strategy');
    } else {
      posture = 'balanced';
      bullets.push(`Asking price is ${percentage.toFixed(1)}% below valuation range`);
      bullets.push('Pricing appears balanced and competitive');
    }
    bullets.push(`Score: ${score.toFixed(0)} points (below range = higher score)`);
  } else if (askingPrice > valuationHigh) {
    position = 'above';
    gap = askingPrice - valuationHigh;
    percentage = (gap / valuationHigh) * 100;
    
    // Formula: Score = min(40, 100 - Percentage Above)
    score = Math.min(40, 100 - percentage);
    
    if (percentage > 20) {
      posture = 'very-optimistic';
      bullets.push(`Asking price is ${percentage.toFixed(1)}% above valuation range`);
      bullets.push('This is a very optimistic pricing strategy');
    } else {
      posture = 'optimistic';
      bullets.push(`Asking price is ${percentage.toFixed(1)}% above valuation range`);
      bullets.push('Pricing is optimistic but may be negotiable');
    }
    bullets.push(`Score: ${score.toFixed(0)} points (above range = lower score)`);
  } else {
    position = 'within';
    gap = 0;
    percentage = 0;
    posture = 'balanced';
    score = 80; // Within range = 80 points per formula
    bullets.push('Asking price falls within the valuation range');
    bullets.push('Pricing appears fair and market-aligned');
    bullets.push('Score: 80 points (within range)');
  }

  if (gap > 0) {
    bullets.push(`Gap: £${gap.toLocaleString('en-GB')}`);
  }

  assumptions.push('Valuation range based on comparable sales data');
  assumptions.push('Market conditions may affect actual sale price');

  return {
    id: 'asking-price-positioning',
    name: 'Asking Price Positioning',
    value: {
      position,
      percentage,
      posture,
      gap,
      score,
    },
    explanation: {
      bullets,
      assumptions,
    },
  };
};
