import { CalculatorResult, ChecklistInputs } from './types';

/**
 * Condition Deduction Calculator
 * Maps "Viewing Checklist" severity to estimated repair costs
 * Output: Low/Likely/High cost estimates
 */
export interface ConditionDeduction {
  totalEstimate: number;
  breakdown: {
    category: string;
    severity: 'low' | 'medium' | 'high';
    estimate: number;
  }[];
  riskLevel: 'low' | 'medium' | 'high';
}

const severityCosts = {
  low: { min: 500, max: 2000 },
  medium: { min: 2000, max: 10000 },
  high: { min: 10000, max: 50000 },
};

export const calculateConditionDeduction = (
  checklist: ChecklistInputs
): CalculatorResult<ConditionDeduction> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  const breakdown = checklist.items.map(item => {
    const costs = severityCosts[item.severity];
    const estimate = Math.round((costs.min + costs.max) / 2);
    
    return {
      category: item.category,
      severity: item.severity,
      estimate,
    };
  });

  const totalEstimate = breakdown.reduce((sum, item) => sum + item.estimate, 0);

  // Determine overall risk level
  const highSeverityCount = breakdown.filter(b => b.severity === 'high').length;
  const mediumSeverityCount = breakdown.filter(b => b.severity === 'medium').length;

  let riskLevel: 'low' | 'medium' | 'high';
  if (highSeverityCount >= 2 || totalEstimate > 30000) {
    riskLevel = 'high';
  } else if (highSeverityCount >= 1 || mediumSeverityCount >= 3 || totalEstimate > 15000) {
    riskLevel = 'medium';
  } else {
    riskLevel = 'low';
  }

  bullets.push(`Total estimated repair cost: £${totalEstimate.toLocaleString('en-GB')}`);
  bullets.push(`Risk level: ${riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}`);

  breakdown.forEach(item => {
    bullets.push(`${item.category}: £${item.estimate.toLocaleString('en-GB')} (${item.severity} severity)`);
  });

  if (riskLevel === 'high') {
    bullets.push('⚠️ Significant repairs required - consider professional survey');
  } else if (riskLevel === 'medium') {
    bullets.push('Moderate repairs expected - factor into offer');
  } else {
    bullets.push('Minor repairs only - property in good condition');
  }

  assumptions.push('Cost estimates are indicative and may vary');
  assumptions.push('Professional survey recommended for accurate assessment');
  assumptions.push('Some issues may be more expensive to fix than estimated');

  return {
    id: 'condition-deduction',
    name: 'Condition Deduction',
    value: {
      totalEstimate,
      breakdown,
      riskLevel,
    },
    explanation: {
      bullets,
      assumptions,
    },
  };
};
