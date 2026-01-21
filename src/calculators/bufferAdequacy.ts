import { CalculatorResult, FinanceInputs } from './types.js';

/**
 * Buffer Adequacy Calculator
 * Compares available savings vs (Deposit + Fees + Repairs + 3 months Emergency Fund)
 */
export interface BufferBreakdown {
  deposit: number;
  fees: number; // Stamp duty, legal, survey, etc.
  repairs: number;
  emergencyFund: number; // 3 months of ownership costs
  totalRequired: number;
  availableSavings: number;
  shortfall: number;
  adequacy: 'adequate' | 'tight' | 'insufficient';
}

export const calculateBufferAdequacy = (
  propertyPrice: number,
  finance: FinanceInputs,
  repairCosts: number,
  monthlyOwnershipCost: number
): CalculatorResult<BufferBreakdown> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  const deposit = finance.deposit;
  
  // Fees: Stamp duty + legal + survey (typically 3-5% of property price)
  const fees = Math.round(propertyPrice * 0.04); // 4% estimate
  
  const repairs = repairCosts;
  
  // Emergency fund: 3 months of ownership costs
  const emergencyFund = Math.round(monthlyOwnershipCost * 3);
  
  const totalRequired = deposit + fees + repairs + emergencyFund;
  const availableSavings = finance.savings;
  const shortfall = Math.max(0, totalRequired - availableSavings);

  let adequacy: 'adequate' | 'tight' | 'insufficient';
  if (shortfall === 0 && availableSavings >= totalRequired * 1.1) {
    adequacy = 'adequate';
  } else if (shortfall === 0) {
    adequacy = 'tight';
  } else {
    adequacy = 'insufficient';
  }

  bullets.push(`Deposit: £${deposit.toLocaleString('en-GB')}`);
  bullets.push(`Fees (stamp duty, legal, survey): £${fees.toLocaleString('en-GB')}`);
  bullets.push(`Repairs: £${repairs.toLocaleString('en-GB')}`);
  bullets.push(`Emergency fund (3 months): £${emergencyFund.toLocaleString('en-GB')}`);
  bullets.push(`Total required: £${totalRequired.toLocaleString('en-GB')}`);
  bullets.push(`Available savings: £${availableSavings.toLocaleString('en-GB')}`);

  if (shortfall > 0) {
    bullets.push(`⚠️ Shortfall: £${shortfall.toLocaleString('en-GB')}`);
    bullets.push('Insufficient funds - consider saving more or reducing offer');
  } else if (adequacy === 'tight') {
    bullets.push('⚠️ Funds are adequate but tight - little buffer remaining');
  } else {
    bullets.push('✅ Funds are adequate with buffer remaining');
  }

  assumptions.push('Fees estimate includes stamp duty, legal fees, and survey costs');
  assumptions.push('Emergency fund based on 3 months of ownership costs');
  assumptions.push('Actual costs may vary from estimates');

  return {
    id: 'buffer-adequacy',
    name: 'Buffer Adequacy',
    value: {
      deposit,
      fees,
      repairs,
      emergencyFund,
      totalRequired,
      availableSavings,
      shortfall,
      adequacy,
    },
    explanation: {
      bullets,
      assumptions,
    },
  };
};
