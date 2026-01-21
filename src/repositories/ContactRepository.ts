import { Repository } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Contact } from '../entities/Contact';

export class ContactRepository {
  private repository: Repository<Contact>;

  constructor() {
    this.repository = AppDataSource.getRepository(Contact);
  }

  async findById(id: string): Promise<Contact | null> {
    return this.repository.findOne({ where: { id } });
  }

  async findAll(): Promise<Contact[]> {
    return this.repository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findByEmail(email: string): Promise<Contact[]> {
    return this.repository.find({
      where: { email },
      order: { createdAt: 'DESC' },
    });
  }

  async create(contactData: Partial<Contact>): Promise<Contact> {
    const contact = this.repository.create(contactData);
    return this.repository.save(contact);
  }

  async update(id: string, updates: Partial<Contact>): Promise<Contact | null> {
    const contact = await this.findById(id);
    if (!contact) return null;

    Object.assign(contact, updates);
    return this.repository.save(contact);
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
