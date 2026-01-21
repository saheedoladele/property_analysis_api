import { Request, Response } from 'express';
import { ContactService } from '../services/ContactService.js';

export class ContactController {
  private contactService: ContactService;

  constructor() {
    this.contactService = new ContactService();
  }

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const contact = await this.contactService.create(req.body);
      res.status(201).json({
        message: 'Contact form submitted successfully',
        id: contact.id,
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  };
}
