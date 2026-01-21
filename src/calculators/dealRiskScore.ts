import { CalculatorResult, ChecklistInputs } from './types.js';

/**
 * Deal Risk Score Calculator
 * Aggregates checklist findings, tenure type, and data gaps
 * Output: 0-100 risk score (lower = less risky)
 */
export const calculateDealRiskScore = (
  checklist: ChecklistInputs,
  tenure: string,
  dataCoverageScore: number
): CalculatorResult<number> => {
  const bullets: string[] = [];
  const assumptions: string[] = [];

  let riskScore = 0;

  // Checklist component (50 points max)
  const highSeverityCount = checklist.items.filter(i => i.severity === 'high').length;
  const mediumSeverityCount = checklist.items.filter(i => i.severity === 'medium').length;
  
  riskScore += highSeverityCount * 15; // 15 points per high severity issue
  riskScore += mediumSeverityCount * 5; // 5 points per medium severity issue
  riskScore = Math.min(50, riskScore);

  if (highSeverityCount > 0) {
    bullets.push(`${highSeverityCount} high-severity issue(s) identified`);
  }
  if (mediumSeverityCount > 0) {
    bullets.push(`${mediumSeverityCount} medium-severity issue(s) identified`);
  }

  // Tenure component (30 points max)
  const tenureLower = tenure.toLowerCase();
  if (tenureLower.includes('leasehold')) {
    riskScore += 30;
    bullets.push('Leasehold tenure increases risk (ground rent, service charges, lease length)');
  } else if (tenureLower.includes('freehold')) {
    bullets.push('Freehold tenure reduces risk');
  } else {
    riskScore += 15; // Unknown tenure
    bullets.push('Tenure type unclear - may increase risk');
  }

  // Data coverage component (20 points max)
  // Lower data coverage = higher risk
  const dataRisk = 20 - (dataCoverageScore / 100) * 20;
  riskScore += Math.round(dataRisk);

  if (dataCoverageScore < 40) {
    bullets.push('Limited comparable data increases uncertainty');
  } else if (dataCoverageScore < 70) {
    bullets.push('Moderate data coverage - some uncertainty remains');
  } else {
    bullets.push('Good data coverage reduces risk');
  }

  // Normalise to 0-100
  riskScore = Math.min(100, Math.max(0, Math.round(riskScore)));

  if (riskScore >= 70) {
    bullets.push('⚠️ High risk deal - proceed with caution');
  } else if (riskScore >= 40) {
    bullets.push('Moderate risk - standard due diligence recommended');
  } else {
    bullets.push('Low risk - deal appears straightforward');
  }

  assumptions.push('Risk assessment based on available information');
  assumptions.push('Professional advice recommended for high-risk deals');

  return {
    id: 'deal-risk-score',
    name: 'Deal Risk Score',
    value: riskScore,
    explanation: {
      bullets,
      assumptions,
    },
  };
};
