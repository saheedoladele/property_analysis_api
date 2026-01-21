import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Analysis } from '../entities/Analysis';

export class AnalysisRepository {
  private repository: Repository<Analysis>;

  constructor() {
    this.repository = AppDataSource.getRepository(Analysis);
  }

  async findById(id: string, userId?: string): Promise<Analysis | null> {
    const where: any = { id };
    if (userId) where.userId = userId;
    return this.repository.findOne({
      where,
      relations: ['property', 'user'],
    });
  }

  async findByUserId(userId: string): Promise<Analysis[]> {
    return this.repository.find({
      where: { userId },
      relations: ['property'],
      order: { createdAt: 'DESC' },
    });
  }

  async findByPropertyId(propertyId: string): Promise<Analysis[]> {
    return this.repository.find({
      where: { propertyId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async create(analysisData: Partial<Analysis>): Promise<Analysis> {
    const analysis = this.repository.create(analysisData);
    return this.repository.save(analysis);
  }

  async update(id: string, updates: Partial<Analysis>): Promise<Analysis | null> {
    const analysis = await this.findById(id);
    if (!analysis) return null;

    Object.assign(analysis, updates);
    return this.repository.save(analysis);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
