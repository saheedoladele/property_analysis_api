import { CalculatorResult, ValuationInputs } from './types';

/**
 * Valuation Range Wrapper
 * Takes backend valuation and applies time-based HPI (0.4% per month)
 * if the last sold date is old
 */
export const calculateAdjustedValuation = (
  inputs: ValuationInputs
): CalculatorResult<{ low: number; median: number; high: number }> => {
  const { valuationLow, valuationMedian, valuationHigh, lastSoldDate } = inputs;

  const bullets: string[] = [];
  const assumptions: string[] = [];

  // Note: HPI adjustment is already applied in calculateValuation from propertyService
  // This wrapper should NOT apply additional HPI adjustment to avoid double-counting
  // Only apply minor adjustment if valuation is based on very old data (>2 years)
  
  let adjustedLow = valuationLow;
  let adjustedMedian = valuationMedian;
  let adjustedHigh = valuationHigh;

  // Only apply additional adjustment if last sold date is very old (>2 years)
  // and the valuation appears to be based on that old sale
  if (lastSoldDate) {
    const saleDate = typeof lastSoldDate === 'string' ? new Date(lastSoldDate) : lastSoldDate;
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - saleDate.getTime());
    const monthsSinceSale = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    // Only adjust if sale is older than 2 years AND valuation seems to match last sold price
    // (indicating it might be based on old data)
    const isOldSale = monthsSinceSale > 24;
    const valuationMatchesSale = Math.abs(valuationMedian - (valuationLow * 1.15)) < 1000;
    
    if (isOldSale && valuationMatchesSale && monthsSinceSale > 24) {
      // Apply conservative monthly adjustment (0.2% per month, not 0.4%)
      const hpiMultiplier = 1 + ((monthsSinceSale - 24) * 0.002); // Only adjust months beyond 2 years
      adjustedLow = Math.round(valuationLow * hpiMultiplier);
      adjustedMedian = Math.round(valuationMedian * hpiMultiplier);
      adjustedHigh = Math.round(valuationHigh * hpiMultiplier);
      
      bullets.push(`Applied conservative HPI adjustment: +${((monthsSinceSale - 24) * 0.2).toFixed(1)}% for data older than 2 years`);
      assumptions.push('Using conservative UK House Price Index trend of 0.2% per month for very old data');
    } else {
      bullets.push('Valuation based on recent comparables - no additional adjustment needed');
      assumptions.push('Valuation already accounts for market changes through comparable sales');
    }
  } else {
    bullets.push('Valuation based on current market comparables');
    assumptions.push('No adjustment needed - using recent sales data');
  }

  bullets.push(`Adjusted range: £${adjustedLow.toLocaleString('en-GB')} - £${adjustedHigh.toLocaleString('en-GB')}`);
  bullets.push(`Median: £${adjustedMedian.toLocaleString('en-GB')}`);

  return {
    id: 'valuation-range-wrapper',
    name: 'Adjusted Valuation Range',
    value: {
      low: adjustedLow,
      median: adjustedMedian,
      high: adjustedHigh,
    },
    explanation: {
      bullets,
      assumptions,
    },
  };
};
