import { CalculatorResult, LeverageFactors } from './types.js';

/**
 * Negotiation Leverage Index Calculator
 * Scores buyer strength based on days on market, price drops, and buyer readiness
 * Output: 0-100 score (higher = more leverage)
 */

export const calculateNegotiationLeverage = (
  factors: LeverageFactors
): CalculatorResult<number> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  let leverageScore = 0;

  // Days on market component (40 points max)
  // Longer on market = more leverage
  if (factors.daysOnMarket >= 180) {
    leverageScore += 40;
    bullets.push(`Property on market ${factors.daysOnMarket} days - strong leverage`);
  } else if (factors.daysOnMarket >= 90) {
    leverageScore += 30;
    bullets.push(`Property on market ${factors.daysOnMarket} days - good leverage`);
  } else if (factors.daysOnMarket >= 30) {
    leverageScore += 20;
    bullets.push(`Property on market ${factors.daysOnMarket} days - moderate leverage`);
  } else {
    leverageScore += 10;
    bullets.push(`Property on market ${factors.daysOnMarket} days - limited leverage`);
  }

  // Price drops component (30 points max)
  // More price drops = more leverage
  if (factors.priceDrops >= 3) {
    leverageScore += 30;
    bullets.push(`${factors.priceDrops} price reductions - very strong leverage`);
  } else if (factors.priceDrops >= 2) {
    leverageScore += 20;
    bullets.push(`${factors.priceDrops} price reductions - good leverage`);
  } else if (factors.priceDrops >= 1) {
    leverageScore += 10;
    bullets.push(`${factors.priceDrops} price reduction - some leverage`);
  } else {
    bullets.push('No price reductions - limited leverage');
  }

  // Buyer readiness component (20 points max)
  if (factors.buyerReady && factors.chainFree) {
    leverageScore += 20;
    bullets.push('Chain-free and ready to proceed - strong position');
  } else if (factors.buyerReady) {
    leverageScore += 10;
    bullets.push('Ready to proceed - moderate position');
  } else {
    bullets.push('Not yet ready - weaker position');
  }

  // Market conditions bonus (10 points max)
  // Assume current market favours buyers
  leverageScore += 10;
  bullets.push('Current market conditions favour buyers');

  // Buyer Status bonus (+15% for FTB and Cash buyers)
  if (factors.buyerStatus === 'first-time' || factors.buyerStatus === 'cash') {
    const bonus = Math.round(leverageScore * 0.15);
    leverageScore += bonus;
    if (factors.buyerStatus === 'first-time') {
      bullets.push(`First-Time Buyer bonus: +${bonus} points (no chain, quick completion)`);
    } else {
      bullets.push(`Cash Buyer bonus: +${bonus} points (no mortgage delays, strong position)`);
    }
  } else if (factors.buyerStatus === 'chain-free') {
    const bonus = Math.round(leverageScore * 0.10);
    leverageScore += bonus;
    bullets.push(`Chain-Free bonus: +${bonus} points (ready to proceed)`);
  } else if (factors.buyerStatus === 'subject-to-sale') {
    bullets.push('Subject to Sale: No bonus (dependent on own sale)');
  }

  // Normalise to 0-100
  leverageScore = Math.min(100, Math.max(0, leverageScore));

  if (leverageScore >= 70) {
    bullets.push('🎯 Excellent negotiation position');
  } else if (leverageScore >= 50) {
    bullets.push('Good negotiation position');
  } else if (leverageScore >= 30) {
    bullets.push('Moderate negotiation position');
  } else {
    bullets.push('Limited negotiation leverage');
  }

  assumptions.push('Leverage may change based on seller circumstances');
  assumptions.push('Market conditions can shift quickly');

  return {
    id: 'negotiation-leverage-index',
    name: 'Negotiation Leverage Index',
    value: leverageScore,
    explanation: {
      bullets,
      assumptions,
    },
  };
};
