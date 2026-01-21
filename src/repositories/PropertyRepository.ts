import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source.js';
import { Property } from '../entities/Property.js';

export class PropertyRepository {
  private repository: Repository<Property>;

  constructor() {
    this.repository = AppDataSource.getRepository(Property);
  }

  async findById(id: string, userId?: string): Promise<Property | null> {
    const where: any = { id };
    if (userId) where.userId = userId;
    return this.repository.findOne({ where, relations: ['user'] });
  }

  async findByUserId(userId: string): Promise<Property[]> {
    return this.repository.find({
      where: { userId },
      order: { savedAt: 'DESC' },
    });
  }

  async findByAddressAndPostcode(
    address: string,
    postcode: string,
    userId: string
  ): Promise<Property | null> {
    return this.repository.findOne({
      where: { address, postcode, userId },
    });
  }

  async create(propertyData: Partial<Property>): Promise<Property> {
    const property = this.repository.create(propertyData);
    return this.repository.save(property);
  }

  async update(id: string, updates: Partial<Property>): Promise<Property | null> {
    const property = await this.findById(id);
    if (!property) return null;

    Object.assign(property, updates);
    return this.repository.save(property);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
