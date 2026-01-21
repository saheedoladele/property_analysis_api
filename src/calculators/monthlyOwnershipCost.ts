import { CalculatorResult, FinanceInputs } from './types.js';

/**
 * Monthly Ownership Cost Calculator
 * Full mortgage repayment + insurance + maintenance + service charges
 */
export interface MonthlyCosts {
  mortgage: number;
  insurance: number;
  maintenance: number;
  serviceCharge: number;
  groundRent: number;
  total: number;
}

export const calculateMonthlyOwnershipCost = (
  propertyPrice: number,
  finance: FinanceInputs
): CalculatorResult<MonthlyCosts> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  const loanAmount = propertyPrice - finance.deposit;
  const monthlyRate = finance.interestRate / 100 / 12;
  const numberOfPayments = finance.loanTerm * 12;

  // Mortgage payment calculation
  let mortgage = 0;
  if (loanAmount > 0 && numberOfPayments > 0 && monthlyRate > 0) {
    mortgage = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
               (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  }

  // Insurance (typically 0.1-0.3% of property value annually)
  const insurance = (propertyPrice * 0.002) / 12; // 0.2% annually

  // Maintenance allowance (typically 1% of property value annually)
  const maintenance = (propertyPrice * 0.01) / 12;

  // Service charge (annual, converted to monthly)
  const serviceCharge = (finance.serviceCharge || 0) / 12;

  // Ground rent (annual, converted to monthly)
  const groundRent = (finance.groundRent || 0) / 12;

  const total = mortgage + insurance + maintenance + serviceCharge + groundRent;

  bullets.push(`Mortgage repayment: £${Math.round(mortgage).toLocaleString('en-GB')}/month`);
  bullets.push(`Insurance: £${Math.round(insurance).toLocaleString('en-GB')}/month`);
  bullets.push(`Maintenance allowance: £${Math.round(maintenance).toLocaleString('en-GB')}/month`);
  
  if (serviceCharge > 0) {
    bullets.push(`Service charge: £${Math.round(serviceCharge).toLocaleString('en-GB')}/month`);
  }
  
  if (groundRent > 0) {
    bullets.push(`Ground rent: £${Math.round(groundRent).toLocaleString('en-GB')}/month`);
  }
  
  bullets.push(`Total monthly cost: £${Math.round(total).toLocaleString('en-GB')}`);

  // Affordability check
  const affordabilityRatio = (total / finance.monthlyIncome) * 100;
  if (affordabilityRatio > 40) {
    bullets.push(`⚠️ Monthly costs represent ${affordabilityRatio.toFixed(1)}% of income - may be unaffordable`);
  } else if (affordabilityRatio > 30) {
    bullets.push(`Monthly costs represent ${affordabilityRatio.toFixed(1)}% of income - tight but manageable`);
  } else {
    bullets.push(`Monthly costs represent ${affordabilityRatio.toFixed(1)}% of income - affordable`);
  }

  assumptions.push('Insurance estimate based on typical UK property insurance rates');
  assumptions.push('Maintenance allowance is indicative - actual costs may vary');
  assumptions.push('Mortgage calculation assumes standard repayment mortgage');

  return {
    id: 'monthly-ownership-cost',
    name: 'Monthly Ownership Cost',
    value: {
      mortgage: Math.round(mortgage),
      insurance: Math.round(insurance),
      maintenance: Math.round(maintenance),
      serviceCharge: Math.round(serviceCharge),
      groundRent: Math.round(groundRent),
      total: Math.round(total),
    },
    explanation: {
      bullets,
      assumptions,
    },
  };
};
