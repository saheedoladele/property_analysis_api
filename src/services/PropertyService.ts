import { PropertyRepository } from '../repositories/PropertyRepository';
import { PostcodeService } from './PostcodeService';
import { LandRegistryService } from './LandRegistryService';
import { EPCService } from './EPCService';
import { PropertyDto, CreatePropertyDto, UpdatePropertyDto } from '../types';

export class PropertyService {
  private propertyRepository: PropertyRepository;
  private postcodeService: PostcodeService;
  private landRegistryService: LandRegistryService;
  private epcService: EPCService;

  constructor() {
    this.propertyRepository = new PropertyRepository();
    this.postcodeService = new PostcodeService();
    this.landRegistryService = new LandRegistryService();
    this.epcService = new EPCService();
  }

  async getAllByUserId(userId: string): Promise<PropertyDto[]> {
    const properties = await this.propertyRepository.findByUserId(userId);
    return properties.map(this.toDto);
  }

  async getById(id: string, userId: string): Promise<PropertyDto> {
    const property = await this.propertyRepository.findById(id, userId);
    if (!property) {
      throw new Error('Property not found');
    }
    return this.toDto(property);
  }

  async create(userId: string, data: CreatePropertyDto): Promise<PropertyDto> {
    // Validate postcode using postcodes.io API
    if (data.postcode) {
      const postcodeValid = await this.postcodeService.validatePostcode(data.postcode);
      if (!postcodeValid) {
        throw new Error('Invalid postcode. Please provide a valid UK postcode.');
      }

      // Get postcode details to enrich the data
      const postcodeDetails = await this.postcodeService.lookupPostcode(data.postcode);
      if (postcodeDetails) {
        // Store postcode details in analysisData if not already present
        if (!data.analysisData) {
          data.analysisData = {};
        }
        data.analysisData.postcodeDetails = {
          latitude: postcodeDetails.latitude,
          longitude: postcodeDetails.longitude,
          parish: postcodeDetails.parish,
          parliamentaryConstituency: postcodeDetails.parliamentary_constituency,
          region: postcodeDetails.region,
          adminDistrict: postcodeDetails.admin_district,
        };
      }

      // Fetch Land Registry and EPC data for the property in parallel
      const [landRegistryData, epcData] = await Promise.allSettled([
        (async () => {
          try {
            // Extract PAON (house number) and Street from address if possible
            const addressParts = data.address.split(',');
            let paon: string | undefined;
            let street: string | undefined;

            // Try to extract house number and street from address
            const firstPart = addressParts[0]?.trim() || '';
            const numberMatch = firstPart.match(/^(\d+[A-Za-z]?)/);
            if (numberMatch) {
              paon = numberMatch[1];
              street = firstPart.replace(/^\d+[A-Za-z]?\s*/, '').trim();
            }

            // Get Land Registry data
            const landRegistryRecords = await this.landRegistryService.getPropertyByAddress(
              data.postcode,
              paon,
              street,
              50
            );

            return {
              soldPrices: landRegistryRecords,
              mostRecentSale: landRegistryRecords[0] || null,
              totalSales: landRegistryRecords.length,
            };
          } catch (error) {
            console.warn('Land Registry lookup failed:', error);
            return null;
          }
        })(),
        (async () => {
          try {
            // Fetch EPC data by postcode
            const epc = await this.epcService.getEPCByPostcode(data.postcode, 10);
            return epc;
          } catch (error) {
            console.warn('EPC lookup failed:', error);
            return null;
          }
        })(),
      ]);

      // Store Land Registry data if available
      if (landRegistryData.status === 'fulfilled' && landRegistryData.value) {
        if (!data.analysisData) {
          data.analysisData = {};
        }
        data.analysisData.landRegistryData = landRegistryData.value;
      }

      // Store EPC data if available
      if (epcData.status === 'fulfilled' && epcData.value) {
        if (!data.analysisData) {
          data.analysisData = {};
        }
        data.analysisData.epcData = {
          energyRating: epcData.value.energyRating,
          totalFloorArea: epcData.value.totalFloorArea,
          mainHeatingType: epcData.value.mainHeatingType,
          address: epcData.value.address,
          lodgementDate: epcData.value.lodgementDate,
          expiryDate: epcData.value.expiryDate,
          propertyType: epcData.value.propertyType,
          constructionAgeBand: epcData.value.constructionAgeBand,
          currentEnergyEfficiency: epcData.value.currentEnergyEfficiency,
          potentialEnergyEfficiency: epcData.value.potentialEnergyEfficiency,
          environmentalImpactRating: epcData.value.environmentalImpactRating,
          co2EmissionsCurrent: epcData.value.co2EmissionsCurrent,
          co2EmissionsPotential: epcData.value.co2EmissionsPotential,
          heatingCostCurrent: epcData.value.heatingCostCurrent,
          heatingCostPotential: epcData.value.heatingCostPotential,
          lightingCostCurrent: epcData.value.lightingCostCurrent,
          lightingCostPotential: epcData.value.lightingCostPotential,
          hotWaterCostCurrent: epcData.value.hotWaterCostCurrent,
          hotWaterCostPotential: epcData.value.hotWaterCostPotential,
        };
      }
    }

    // Check if property already exists
    const existing = await this.propertyRepository.findByAddressAndPostcode(
      data.address,
      data.postcode,
      userId
    );

    if (existing) {
      // Update existing property
      const updates: Partial<typeof existing> = {};
      if (data.propertyType) updates.propertyType = data.propertyType;
      if (data.tenure) updates.tenure = data.tenure;
      if (data.analysisData) updates.analysisData = data.analysisData;

      const updated = await this.propertyRepository.update(existing.id, updates);
      if (!updated) {
        throw new Error('Failed to update property');
      }
      return this.toDto(updated);
    }

    // Create new property
    const property = await this.propertyRepository.create({
      userId,
      ...data,
    });

    return this.toDto(property);
  }

  async update(id: string, userId: string, data: UpdatePropertyDto): Promise<PropertyDto> {
    const property = await this.propertyRepository.findById(id, userId);
    if (!property) {
      throw new Error('Property not found');
    }

    // Validate postcode if being updated
    if (data.postcode) {
      const postcodeValid = await this.postcodeService.validatePostcode(data.postcode);
      if (!postcodeValid) {
        throw new Error('Invalid postcode. Please provide a valid UK postcode.');
      }

      // Get postcode details to enrich the data
      const postcodeDetails = await this.postcodeService.lookupPostcode(data.postcode);
      if (postcodeDetails) {
        // Merge postcode details into analysisData
        const currentAnalysisData = property.analysisData || {};
        currentAnalysisData.postcodeDetails = {
          latitude: postcodeDetails.latitude,
          longitude: postcodeDetails.longitude,
          parish: postcodeDetails.parish,
          parliamentaryConstituency: postcodeDetails.parliamentary_constituency,
          region: postcodeDetails.region,
          adminDistrict: postcodeDetails.admin_district,
        };
        data.analysisData = { ...currentAnalysisData, ...(data.analysisData || {}) };
      }
    }

    const updated = await this.propertyRepository.update(id, data);
    if (!updated) {
      throw new Error('Failed to update property');
    }

    return this.toDto(updated);
  }

  async delete(id: string, userId: string): Promise<void> {
    const property = await this.propertyRepository.findById(id, userId);
    if (!property) {
      throw new Error('Property not found');
    }

    const deleted = await this.propertyRepository.delete(id);
    if (!deleted) {
      throw new Error('Failed to delete property');
    }
  }

  private toDto(property: any): PropertyDto {
    return {
      id: property.id,
      userId: property.userId,
      address: property.address,
      postcode: property.postcode,
      propertyType: property.propertyType,
      tenure: property.tenure,
      analysisData: property.analysisData,
      savedAt: property.savedAt,
      createdAt: property.createdAt,
      updatedAt: property.updatedAt,
    };
  }
}
