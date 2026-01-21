/**
 * EPC (Energy Performance Certificate) Open Data Service
 * https://epc.opendatacommunities.org/docs/api
 */

export interface EPCData {
  energyRating: string; // A-G
  totalFloorArea: number; // in m²
  mainHeatingType: string;
  address: string;
  postcode: string;
  lodgementDate?: string;
  expiryDate?: string;
  propertyType?: string;
  constructionAgeBand?: string;
  currentEnergyEfficiency?: number;
  potentialEnergyEfficiency?: number;
  environmentalImpactRating?: string;
  co2EmissionsCurrent?: number;
  co2EmissionsPotential?: number;
  heatingCostCurrent?: number;
  heatingCostPotential?: number;
  lightingCostCurrent?: number;
  lightingCostPotential?: number;
  hotWaterCostCurrent?: number;
  hotWaterCostPotential?: number;
}

interface EPCAPIRecord {
  [key: string]: any;
  address?: string;
  address1?: string;
  address2?: string;
  address3?: string;
  'current-energy-rating'?: string;
  current_energy_rating?: string;
  'total-floor-area'?: string;
  total_floor_area?: string;
  'main-heating-type'?: string;
  main_heating_type?: string;
  'lodgement-date'?: string;
  lodgement_date?: string;
  'expiry-date'?: string;
  expiry_date?: string;
  'property-type'?: string;
  property_type?: string;
  'construction-age-band'?: string;
  construction_age_band?: string;
  'current-energy-efficiency'?: string;
  current_energy_efficiency?: string;
  'potential-energy-efficiency'?: string;
  potential_energy_efficiency?: string;
  'environmental-impact-rating'?: string;
  environmental_impact_rating?: string;
  'co2-emissions-current'?: string;
  co2_emissions_current?: string;
  'co2-emissions-potential'?: string;
  co2_emissions_potential?: string;
  'heating-cost-current'?: string;
  heating_cost_current?: string;
  'heating-cost-potential'?: string;
  heating_cost_potential?: string;
  'lighting-cost-current'?: string;
  lighting_cost_current?: string;
  'lighting-cost-potential'?: string;
  lighting_cost_potential?: string;
  'hot-water-cost-current'?: string;
  hot_water_cost_current?: string;
  'hot-water-cost-potential'?: string;
  hot_water_cost_potential?: string;
}

interface EPCAPIResponse {
  rows?: EPCAPIRecord[];
  total_rows?: number;
}

const EPC_API_BASE = 'https://epc.opendatacommunities.org/api/v1';
const EPC_API_KEY = process.env.EPC_API_KEY || 'saheed.oladele1444@gmail.com';
const EPC_API_SECRET = process.env.EPC_API_SECRET || 'ca8df8bd75d62d3f02d1726d668b97bdf16dd813';

/**
 * Get authentication headers for EPC API
 */
const getEPCAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  // Always use Basic Auth with provided credentials
  const credentials = Buffer.from(`${EPC_API_KEY}:${EPC_API_SECRET}`).toString('base64');
  headers['Authorization'] = `Basic ${credentials}`;

  return headers;
};

/**
 * Parse EPC API record to EPCData format
 */
const parseEPCRecord = (record: EPCAPIRecord, postcode: string): EPCData | null => {
  // Handle field names with hyphens (access via bracket notation)
  const energyRating = record['current-energy-rating'] || record.current_energy_rating || 'Not available';
  const totalFloorArea = parseFloat(record['total-floor-area'] || record.total_floor_area || '0');
  const mainHeatingType = record['main-heating-type'] || record.main_heating_type || 'Not available';

  // Construct address from available fields
  let address = record.address || record.address1 || '';

  // If address is missing or looks like an administrative area, try to construct from other fields
  if (!address || address.length < 5 || address.toLowerCase().includes('unparished')) {
    const addressParts = [
      record.address1,
      record.address2,
      record.address3,
    ].filter(Boolean);

    if (addressParts.length > 0) {
      address = addressParts.join(', ');
    }
  }

  // If still no good address, return null (we don't want administrative areas)
  if (!address || address.length < 5 ||
    address.toLowerCase().includes('unparished') ||
    address.toLowerCase().includes('admin district')) {
    return null;
  }

  return {
    energyRating,
    totalFloorArea,
    mainHeatingType,
    address: address.trim(),
    postcode,
    lodgementDate: record['lodgement-date'] || record.lodgement_date,
    expiryDate: record['expiry-date'] || record.expiry_date,
    propertyType: record['property-type'] || record.property_type,
    constructionAgeBand: record['construction-age-band'] || record.construction_age_band,
    currentEnergyEfficiency: (record['current-energy-efficiency'] || record.current_energy_efficiency)
      ? parseInt(String(record['current-energy-efficiency'] || record.current_energy_efficiency), 10)
      : undefined,
    potentialEnergyEfficiency: (record['potential-energy-efficiency'] || record.potential_energy_efficiency)
      ? parseInt(String(record['potential-energy-efficiency'] || record.potential_energy_efficiency), 10)
      : undefined,
    environmentalImpactRating: record['environmental-impact-rating'] || record.environmental_impact_rating,
    co2EmissionsCurrent: (record['co2-emissions-current'] || record.co2_emissions_current)
      ? parseFloat(String(record['co2-emissions-current'] || record.co2_emissions_current))
      : undefined,
    co2EmissionsPotential: (record['co2-emissions-potential'] || record.co2_emissions_potential)
      ? parseFloat(String(record['co2-emissions-potential'] || record.co2_emissions_potential))
      : undefined,
    heatingCostCurrent: (record['heating-cost-current'] || record.heating_cost_current)
      ? parseFloat(String(record['heating-cost-current'] || record.heating_cost_current))
      : undefined,
    heatingCostPotential: (record['heating-cost-potential'] || record.heating_cost_potential)
      ? parseFloat(String(record['heating-cost-potential'] || record.heating_cost_potential))
      : undefined,
    lightingCostCurrent: (record['lighting-cost-current'] || record.lighting_cost_current)
      ? parseFloat(String(record['lighting-cost-current'] || record.lighting_cost_current))
      : undefined,
    lightingCostPotential: (record['lighting-cost-potential'] || record.lighting_cost_potential)
      ? parseFloat(String(record['lighting-cost-potential'] || record.lighting_cost_potential))
      : undefined,
    hotWaterCostCurrent: (record['hot-water-cost-current'] || record.hot_water_cost_current)
      ? parseFloat(String(record['hot-water-cost-current'] || record.hot_water_cost_current))
      : undefined,
    hotWaterCostPotential: (record['hot-water-cost-potential'] || record.hot_water_cost_potential)
      ? parseFloat(String(record['hot-water-cost-potential'] || record.hot_water_cost_potential))
      : undefined,
  };
};

export class EPCService {
  /**
   * Fetch EPC data by postcode
   * Returns the most recent EPC record with actual property address
   */
  async getEPCByPostcode(postcode: string, limit: number = 10): Promise<EPCData | null> {
    if (!postcode || postcode.trim().length === 0) {
      return null;
    }

    // Clean postcode
    const cleanPostcode = postcode.trim().replace(/\s+/g, '').toUpperCase();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const url = `${EPC_API_BASE}/domestic/search?postcode=${encodeURIComponent(cleanPostcode)}&limit=${limit}`;

      const response = await fetch(url, {
        headers: getEPCAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return null; // No EPC data found
        }
        throw new Error(`EPC API error: ${response.status}`);
      }

      const data = await response.json() as EPCAPIResponse;

      if (!data || !data.rows || data.rows.length === 0) {
        return null;
      }

      // Find the best address - prefer records with actual street addresses
      // Look for addresses that contain numbers (PAON) and street names
      let bestEPC = data.rows[0];

      for (const epc of data.rows) {
        const address = epc.address || epc.address1 || '';
        // Prefer addresses that look like actual property addresses (contain numbers and street names)
        if (address && /\d/.test(address) && address.length > 10) {
          bestEPC = epc;
          break;
        }
      }

      return parseEPCRecord(bestEPC, cleanPostcode);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('EPC API timeout');
        return null;
      }
      console.error('Error fetching EPC data:', error);
      return null;
    }
  }

  /**
   * Get EPC data by address (alternative method)
   */
  async getEPCByAddress(address: string, postcode: string): Promise<EPCData | null> {
    if (!address || !postcode) {
      return null;
    }

    try {
      const cleanPostcode = postcode.trim().replace(/\s+/g, '').toUpperCase();
      const url = `${EPC_API_BASE}/domestic/search?postcode=${encodeURIComponent(cleanPostcode)}&address=${encodeURIComponent(address)}&limit=1`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(url, {
        headers: getEPCAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return null;
      }

      const data = await response.json() as EPCAPIResponse;

      if (!data || !data.rows || data.rows.length === 0) {
        return null;
      }

      const epc = data.rows[0];
      return parseEPCRecord(epc, cleanPostcode);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('EPC API timeout');
        return null;
      }
      console.error('Error fetching EPC data by address:', error);
      return null;
    }
  }

  /**
   * Get all EPC records for a postcode
   */
  async getAllEPCByPostcode(postcode: string, limit: number = 50): Promise<EPCData[]> {
    if (!postcode || postcode.trim().length === 0) {
      return [];
    }

    // Clean postcode
    const cleanPostcode = postcode.trim().replace(/\s+/g, '').toUpperCase();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const url = `${EPC_API_BASE}/domestic/search?postcode=${encodeURIComponent(cleanPostcode)}&limit=${limit}`;

      const response = await fetch(url, {
        headers: getEPCAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        if (response.status === 404) {
          return [];
        }
        throw new Error(`EPC API error: ${response.status}`);
      }

      const data = await response.json() as EPCAPIResponse;

      if (!data || !data.rows || data.rows.length === 0) {
        return [];
      }

      // Parse all records and filter out invalid ones
      const results: EPCData[] = [];
      for (const record of data.rows) {
        const parsed = parseEPCRecord(record, cleanPostcode);
        if (parsed) {
          results.push(parsed);
        }
      }

      return results;
    } catch (error: any) {
      if (error.name === 'AbortError') {
        console.error('EPC API timeout');
        return [];
      }
      console.error('Error fetching EPC data:', error);
      return [];
    }
  }
}
