import { DealAuditRepository } from '../repositories/DealAuditRepository.js';
import { DealAuditDto, CreateDealAuditDto } from '../types/index.js';

export class DealAuditService {
  private dealAuditRepository: DealAuditRepository;

  constructor() {
    this.dealAuditRepository = new DealAuditRepository();
  }

  async create(data: CreateDealAuditDto): Promise<DealAuditDto> {
    const dealAudit = await this.dealAuditRepository.create({
      userEmail: data.userEmail,
      userName: data.userName,
      userPhone: data.userPhone,
      propertyAddress: data.propertyAddress,
      propertyPostcode: data.propertyPostcode,
      askingPrice: data.askingPrice,
      additionalNotes: data.additionalNotes,
      bookingDate: data.bookingDate ? new Date(data.bookingDate) : undefined,
    });

    // TODO: Send email notification here

    return this.toDto(dealAudit);
  }

  async getById(id: string): Promise<DealAuditDto> {
    const dealAudit = await this.dealAuditRepository.findById(id);
    if (!dealAudit) {
      throw new Error('Deal audit not found');
    }
    return this.toDto(dealAudit);
  }

  async getAll(): Promise<DealAuditDto[]> {
    const dealAudits = await this.dealAuditRepository.findAll();
    return dealAudits.map(this.toDto);
  }

  private toDto(dealAudit: any): DealAuditDto {
    return {
      id: dealAudit.id,
      userEmail: dealAudit.userEmail,
      userName: dealAudit.userName,
      userPhone: dealAudit.userPhone,
      propertyAddress: dealAudit.propertyAddress,
      propertyPostcode: dealAudit.propertyPostcode,
      askingPrice: dealAudit.askingPrice,
      additionalNotes: dealAudit.additionalNotes,
      bookingDate: dealAudit.bookingDate,
      createdAt: dealAudit.createdAt,
      updatedAt: dealAudit.updatedAt,
    };
  }
}
