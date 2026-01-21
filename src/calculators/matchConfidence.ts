import { CalculatorResult } from './types.js';

/**
 * Match Confidence Calculator
 * Compares user typed address vs API results
 * Output: 0-100 score
 */
export const calculateMatchConfidence = (
  userTypedAddress: string,
  apiAddress: string
): CalculatorResult<number> => {
  if (!userTypedAddress || !apiAddress) {
    return {
      id: 'match-confidence',
      name: 'Match Confidence',
      value: 0,
      explanation: {
        bullets: ['Insufficient data to calculate match confidence'],
        assumptions: ['Both user input and API result are required'],
      },
    };
  }

  const userLower = userTypedAddress.toLowerCase().trim();
  const apiLower = apiAddress.toLowerCase().trim();

  // Exact match
  if (userLower === apiLower) {
    return {
      id: 'match-confidence',
      name: 'Match Confidence',
      value: 100,
      explanation: {
        bullets: ['Exact match between user input and API result'],
        assumptions: ['Addresses are identical'],
      },
    };
  }

  // Extract postcodes
  const userPostcode = extractPostcode(userLower);
  const apiPostcode = extractPostcode(apiLower);

  let score = 0;
  const bullets: string[] = [];
  const assumptions: string[] = [];

  // Postcode match (40 points)
  if (userPostcode && apiPostcode && userPostcode === apiPostcode) {
    score += 40;
    bullets.push('Postcode matches exactly');
  } else if (userPostcode && apiPostcode && userPostcode.substring(0, 4) === apiPostcode.substring(0, 4)) {
    score += 20;
    bullets.push('Postcode area matches');
  }

  // Word overlap (60 points)
  const userWords = userLower.split(/\s+/).filter(w => w.length > 2);
  const apiWords = apiLower.split(/\s+/).filter(w => w.length > 2);
  const commonWords = userWords.filter(w => apiWords.includes(w));
  const overlapRatio = commonWords.length / Math.max(userWords.length, apiWords.length);
  score += Math.round(overlapRatio * 60);

  if (commonWords.length > 0) {
    bullets.push(`${commonWords.length} matching words found`);
  }

  // Normalise to 0-100
  score = Math.min(100, Math.max(0, score));

  if (score < 50) {
    assumptions.push('Low confidence: addresses may not refer to the same property');
  } else if (score < 80) {
    assumptions.push('Moderate confidence: addresses likely match but may have formatting differences');
  } else {
    assumptions.push('High confidence: addresses are very similar');
  }

  return {
    id: 'match-confidence',
    name: 'Match Confidence',
    value: score,
    explanation: {
      bullets,
      assumptions,
    },
  };
};

const extractPostcode = (address: string): string | null => {
  const postcodeRegex = /\b[A-Z]{1,2}\d{1,2}[A-Z]?\s?\d[A-Z]{2}\b/i;
  const match = address.match(postcodeRegex);
  return match ? match[0].replace(/\s+/g, '').toUpperCase() : null;
};
