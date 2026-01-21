import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { DealAudit } from '../entities/DealAudit.js';

export class DealAuditRepository {
  private repository: Repository<DealAudit>;

  constructor() {
    this.repository = AppDataSource.getRepository(DealAudit);
  }

  async findById(id: string): Promise<DealAudit | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<DealAudit[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmail(email: string): Promise<DealAudit[]> {
    return this.repository.find({
      where: { userEmail: email },
      order: { createdAt: 'DESC' },
    });
  }

  async create(dealAuditData: Partial<DealAudit>): Promise<DealAudit> {
    const dealAudit = this.repository.create(dealAuditData);
    return this.repository.save(dealAudit);
  }

  async update(id: string, updates: Partial<DealAudit>): Promise<DealAudit | null> {
    const dealAudit = await this.findById(id);
    if (!dealAudit) return null;

    Object.assign(dealAudit, updates);
    return this.repository.save(dealAudit);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
