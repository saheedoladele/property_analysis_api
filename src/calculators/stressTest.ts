import { CalculatorResult, FinanceInputs } from './types';

/**
 * Stress Test Calculator
 * Pass/Fail check against +1%, +2%, and +3% interest rate shocks
 */
export interface StressTestResult {
  scenarios: {
    rateIncrease: number;
    newRate: number;
    newMonthlyPayment: number;
    pass: boolean;
    affordabilityRatio: number;
  }[];
  overallPass: boolean;
}

export const calculateStressTest = (
  propertyPrice: number,
  finance: FinanceInputs,
  _currentMonthlyPayment: number
): CalculatorResult<StressTestResult> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  const scenarios = [1, 2, 3].map(rateIncrease => {
    const newRate = finance.interestRate + rateIncrease;
    const loanAmount = propertyPrice - finance.deposit;
    const monthlyRate = newRate / 100 / 12;
    const numberOfPayments = finance.loanTerm * 12;

    let newMonthlyPayment = 0;
    if (loanAmount > 0 && numberOfPayments > 0 && monthlyRate > 0) {
      newMonthlyPayment = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
                         (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    }

    const affordabilityRatio = (newMonthlyPayment / finance.monthlyIncome) * 100;
    const pass = affordabilityRatio <= 40; // 40% of income threshold

    return {
      rateIncrease,
      newRate,
      newMonthlyPayment: Math.round(newMonthlyPayment),
      pass,
      affordabilityRatio: Math.round(affordabilityRatio * 10) / 10,
    };
  });

  const overallPass = scenarios.every(s => s.pass);

  bullets.push(`Current rate: ${finance.interestRate}%`);
  scenarios.forEach(scenario => {
    const status = scenario.pass ? '✓ PASS' : '✗ FAIL';
    bullets.push(`${status} +${scenario.rateIncrease}% (${scenario.newRate}%): £${scenario.newMonthlyPayment.toLocaleString('en-GB')}/month (${scenario.affordabilityRatio}% of income)`);
  });

  if (overallPass) {
    bullets.push('✅ All stress test scenarios passed');
  } else {
    bullets.push('⚠️ Some stress test scenarios failed - consider lower offer or longer term');
  }

  assumptions.push('Stress test uses 40% of income as affordability threshold');
  assumptions.push('Assumes other costs (insurance, maintenance) remain constant');
  assumptions.push('Rate increases are hypothetical - actual rates may differ');

  return {
    id: 'stress-test',
    name: 'Interest Rate Stress Test',
    value: {
      scenarios,
      overallPass,
    },
    explanation: {
      bullets,
      assumptions,
    },
  };
};
