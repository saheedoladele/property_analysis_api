/**
 * Calculator types - shared with frontend
 */

export interface CalculatorResult<T> {
  id: string;
  name: string;
  value: T;
  explanation: {
    bullets: string[];
    assumptions: string[];
  };
}

export interface PropertyInputs {
  userTypedAddress?: string;
  apiAddress?: string;
  postcode?: string;
  lastSoldDate?: string | Date;
  lastSoldPrice?: number;
  askingPrice?: number;
  propertyType?: string;
  tenure?: string;
}

export interface ValuationInputs {
  valuationLow: number;
  valuationMedian: number;
  valuationHigh: number;
  confidenceScore: number;
  lastSoldDate?: string | Date;
}

export interface ComparableData {
  count: number;
  recency: number; // Days since most recent sale
  variance: number; // Price variance percentage
}

export interface ChecklistInputs {
  items: {
    category: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
  }[];
}

export interface FinanceInputs {
  deposit: number;
  interestRate: number;
  loanTerm: number; // Years
  monthlyIncome: number;
  savings: number;
  serviceCharge?: number; // Annual
  groundRent?: number; // Annual
}

export interface RiskAppetite {
  level: 'conservative' | 'balanced' | 'aggressive';
}

export interface LeverageFactors {
  daysOnMarket: number;
  priceDrops: number;
  buyerReady: boolean;
  chainFree: boolean;
  buyerStatus?: 'first-time' | 'chain-free' | 'subject-to-sale' | 'cash' | null;
}
