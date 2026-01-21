/**
 * Property Search Service
 * Combines Land Registry, EPC, and Postcode data for comprehensive property search
 */

import { PostcodeService } from './PostcodeService.js';
import { LandRegistryService } from './LandRegistryService.js';
import { EPCService } from './EPCService.js';

export interface PropertySearchResult {
  id: string;
  address: string;
  postcode: string;
  propertyType: string;
  tenure: string;
  lastSoldPrice: number;
  lastSoldDate: string;
  valuationLow: number;
  valuationMedian: number;
  valuationHigh: number;
  confidenceScore: number;
  postcodeDetails?: {
    latitude: number;
    longitude: number;
    parish: string;
    parliamentaryConstituency: string;
    region?: string;
    adminDistrict?: string;
  };
  epcData?: {
    energyRating: string;
    totalFloorArea: number;
    mainHeatingType: string;
    address: string;
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
  };
  landRegistryData?: {
    soldPrices: Array<{
      price: number;
      dateOfTransfer: string;
      propertyType: string;
      oldNewStatus: string;
      postcode: string;
      paon?: string;
      street?: string;
      saon?: string;
      locality?: string;
      town?: string;
      district?: string;
      county?: string;
      address?: string;
    }>;
    mostRecentSale: {
      price: number;
      dateOfTransfer: string;
      propertyType: string;
      oldNewStatus: string;
      postcode: string;
      paon?: string;
      street?: string;
      saon?: string;
      locality?: string;
      town?: string;
      district?: string;
      county?: string;
      address?: string;
    } | null;
    totalSales: number;
  };
}

export class PropertySearchService {
  private postcodeService: PostcodeService;
  private landRegistryService: LandRegistryService;
  private epcService: EPCService;

  constructor() {
    this.postcodeService = new PostcodeService();
    this.landRegistryService = new LandRegistryService();
    this.epcService = new EPCService();
  }

  /**
   * Search for property by postcode
   * Fetches data from Postcodes.io, Land Registry, and EPC APIs
   */
  async searchByPostcode(
    postcode: string,
    userQuery?: string
  ): Promise<PropertySearchResult | null> {
    if (!postcode || postcode.trim().length === 0) {
      return null;
    }

    // Clean postcode
    const cleanPostcode = postcode.trim().replace(/\s+/g, '').toUpperCase();
    const formattedPostcode = cleanPostcode.match(/^([A-Z]{1,2}\d{1,2}[A-Z]?)(\d[A-Z]{2})$/);
    const formatted = formattedPostcode
      ? `${formattedPostcode[1]} ${formattedPostcode[2]}`
      : cleanPostcode;

    // Extract address components from userQuery if available
    let paon: string | undefined;
    let street: string | undefined;
    
    if (userQuery) {
      // Try to extract house number/flat number (PAON) and street name
      const addressParts = userQuery.split(',').map(p => p.trim());
      if (addressParts.length > 0) {
        const firstPart = addressParts[0];
        // Check if first part contains a number (likely PAON)
        const numberMatch = firstPart.match(/^(\d+[A-Z]?|\d+\/\d+)/i);
        if (numberMatch) {
          paon = numberMatch[1];
          street = firstPart.replace(numberMatch[0], '').trim();
        } else {
          // Might be a street name without number
          street = firstPart;
        }
      }
    }

    // Fetch all data in parallel - call all Land Registry endpoints
    const [
      postcodeDetails,
      soldPrices,
      propertyRecords,
      mostRecentRecord,
      comparableSales,
      epcData,
    ] = await Promise.allSettled([
      this.postcodeService.lookupPostcode(formatted),
      // Get sold prices by postcode
      this.landRegistryService.getSoldPricesByPostcode(cleanPostcode, 100),
      // Get property by address (if we have PAON/street)
      paon || street
        ? this.landRegistryService.getPropertyByAddress(cleanPostcode, paon, street, 50)
        : Promise.resolve([]),
      // Get most recent sale
      this.landRegistryService.getMostRecentSale(cleanPostcode, paon, street),
      // Get comparable sales
      this.landRegistryService.getComparableSales(cleanPostcode, undefined, 20),
      this.epcService.getEPCByPostcode(cleanPostcode, 10),
    ]);

    // Extract postcode details
    const postcodeInfo =
      postcodeDetails.status === 'fulfilled' ? postcodeDetails.value : null;

    // Extract Land Registry data - combine all results
    const soldPricesResult =
      soldPrices.status === 'fulfilled' ? soldPrices.value : [];
    const propertyRecordsResult =
      propertyRecords.status === 'fulfilled' ? propertyRecords.value : [];
    const mostRecentRecordResult =
      mostRecentRecord.status === 'fulfilled' ? mostRecentRecord.value : null;
    const comparableSalesResult =
      comparableSales.status === 'fulfilled' ? comparableSales.value : [];

    // Combine all Land Registry records, removing duplicates
    const allRecords = [
      ...soldPricesResult,
      ...propertyRecordsResult,
      ...comparableSalesResult,
    ];
    
    // Remove duplicates based on price, date, and postcode
    const uniqueRecords = allRecords.filter((record, index, self) =>
      index === self.findIndex((r) =>
        r.price === record.price &&
        r.dateOfTransfer === record.dateOfTransfer &&
        r.postcode === record.postcode
      )
    );

    // Sort by date (most recent first)
    uniqueRecords.sort((a, b) => {
      const dateA = new Date(a.dateOfTransfer).getTime();
      const dateB = new Date(b.dateOfTransfer).getTime();
      return dateB - dateA;
    });

    const landRegistryRecords = uniqueRecords;
    const mostRecentSale = mostRecentRecordResult || (landRegistryRecords.length > 0 ? landRegistryRecords[0] : null);

    // Extract EPC data
    const epc =
      epcData.status === 'fulfilled' ? epcData.value : null;

    // Determine property type from Land Registry data
    let propertyType = 'Unknown';
    if (landRegistryRecords.length > 0) {
      const typeCounts: Record<string, number> = {};
      landRegistryRecords.forEach((sale) => {
        if (sale.propertyType && sale.propertyType !== 'Unknown') {
          typeCounts[sale.propertyType] = (typeCounts[sale.propertyType] || 0) + 1;
        }
      });

      const typeEntries = Object.entries(typeCounts);
      if (typeEntries.length > 0) {
        const mostCommonType = typeEntries.sort((a, b) => b[1] - a[1])[0];
        propertyType = mostCommonType[0];
      } else if (mostRecentSale?.propertyType) {
        propertyType = mostRecentSale.propertyType;
      }
    }

    // Fallback: infer from EPC data
    if (propertyType === 'Unknown' && epc?.propertyType) {
      propertyType = epc.propertyType;
    }

    // Determine tenure
    let tenure = 'Freehold';
    const propertyTypeLower = propertyType.toLowerCase();
    if (
      propertyTypeLower.includes('flat') ||
      propertyTypeLower.includes('apartment') ||
      propertyTypeLower.includes('maisonette')
    ) {
      tenure = 'Leasehold';
    }

    // Construct address
    let address = '';
    if (userQuery && userQuery.trim().length > 0) {
      address = userQuery
        .split(' ')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    } else if (mostRecentSale?.paon && mostRecentSale?.street) {
      address = `${mostRecentSale.paon} ${mostRecentSale.street}, ${formattedPostcode ? formattedPostcode[1] : ''}, ${formatted}`;
    } else if (epc?.address) {
      address = epc.address;
    } else {
      address = formatted;
    }

    // Calculate valuation (simplified - you may want to use your existing valuation logic)
    let valuationLow = 0;
    let valuationMedian = 0;
    let valuationHigh = 0;
    let confidenceScore = 0;

    if (landRegistryRecords.length > 0) {
      const prices = landRegistryRecords
        .map((s) => s.price)
        .filter((p) => p > 0)
        .sort((a, b) => a - b);

      if (prices.length > 0) {
        const medianIndex = Math.floor(prices.length / 2);
        valuationMedian = prices[medianIndex];
        valuationLow = Math.round(valuationMedian * 0.9);
        valuationHigh = Math.round(valuationMedian * 1.1);
        confidenceScore = Math.min(100, Math.max(15, prices.length * 2));
      }
    }

    // Fallback valuation if no Land Registry data
    if (valuationMedian === 0 && mostRecentSale?.price) {
      const saleDate = new Date(mostRecentSale.dateOfTransfer);
      const monthsSinceSale = Math.ceil(
        (Date.now() - saleDate.getTime()) / (1000 * 60 * 60 * 24 * 30)
      );
      const adjustment = 1 + monthsSinceSale * 0.002;
      valuationMedian = Math.round(mostRecentSale.price * adjustment);
      valuationLow = Math.round(valuationMedian * 0.9);
      valuationHigh = Math.round(valuationMedian * 1.1);
      confidenceScore = 30;
    }

    return {
      id: `property-${cleanPostcode}-${Date.now()}`,
      address,
      postcode: formatted,
      propertyType,
      tenure,
      lastSoldPrice: mostRecentSale?.price || 0,
      lastSoldDate: mostRecentSale?.dateOfTransfer || new Date().toISOString(),
      valuationLow,
      valuationMedian,
      valuationHigh,
      confidenceScore,
      postcodeDetails: postcodeInfo
        ? {
            latitude: postcodeInfo.latitude,
            longitude: postcodeInfo.longitude,
            parish: postcodeInfo.parish || 'Not available',
            parliamentaryConstituency:
              postcodeInfo.parliamentary_constituency || 'Not available',
            region: postcodeInfo.region,
            adminDistrict: postcodeInfo.admin_district,
          }
        : undefined,
      epcData: epc
        ? {
            energyRating: epc.energyRating,
            totalFloorArea: epc.totalFloorArea,
            mainHeatingType: epc.mainHeatingType,
            address: epc.address,
            lodgementDate: epc.lodgementDate,
            expiryDate: epc.expiryDate,
            propertyType: epc.propertyType,
            constructionAgeBand: epc.constructionAgeBand,
            currentEnergyEfficiency: epc.currentEnergyEfficiency,
            potentialEnergyEfficiency: epc.potentialEnergyEfficiency,
            environmentalImpactRating: epc.environmentalImpactRating,
            co2EmissionsCurrent: epc.co2EmissionsCurrent,
            co2EmissionsPotential: epc.co2EmissionsPotential,
            heatingCostCurrent: epc.heatingCostCurrent,
            heatingCostPotential: epc.heatingCostPotential,
            lightingCostCurrent: epc.lightingCostCurrent,
            lightingCostPotential: epc.lightingCostPotential,
            hotWaterCostCurrent: epc.hotWaterCostCurrent,
            hotWaterCostPotential: epc.hotWaterCostPotential,
          }
        : undefined,
      landRegistryData:
        landRegistryRecords.length > 0
          ? {
              soldPrices: landRegistryRecords,
              mostRecentSale,
              totalSales: landRegistryRecords.length,
            }
          : undefined,
    };
  }
}
