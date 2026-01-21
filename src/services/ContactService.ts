import { ContactRepository } from '../repositories/ContactRepository';
import { ContactDto, CreateContactDto } from '../types';

export class ContactService {
  private contactRepository: ContactRepository;

  constructor() {
    this.contactRepository = new ContactRepository();
  }

  async create(data: CreateContactDto): Promise<ContactDto> {
    const contact = await this.contactRepository.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      subject: data.subject,
      message: data.message,
    });

    // TODO: Send email notification here

    return this.toDto(contact);
  }

  async getById(id: string): Promise<ContactDto> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new Error('Contact not found');
    }
    return this.toDto(contact);
  }

  async getAll(): Promise<ContactDto[]> {
    const contacts = await this.contactRepository.findAll();
    return contacts.map(this.toDto);
  }

  private toDto(contact: any): ContactDto {
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      phone: contact.phone,
      subject: contact.subject,
      message: contact.message,
      createdAt: contact.createdAt,
      updatedAt: contact.updatedAt,
    };
  }
}
