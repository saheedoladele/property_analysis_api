import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.register(req.body);
      res.status(201).json(result);
    } catch (error: any) {
      if (error.message === 'An account with this email already exists') {
        res.status(409).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  };

  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const result = await this.authService.login(req.body);
      res.json(result);
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  getCurrentUser = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.getCurrentUser(req.user!.userId);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  updateProfile = async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await this.authService.updateProfile(req.user!.userId, req.body);
      res.json(user);
    } catch (error: any) {
      res.status(404).json({ error: error.message });
    }
  };

  changePassword = async (req: Request, res: Response): Promise<void> => {
    try {
      await this.authService.changePassword(req.user!.userId, req.body);
      res.json({ message: 'Password updated successfully' });
    } catch (error: any) {
      res.status(401).json({ error: error.message });
    }
  };

  logout = async (req: Request, res: Response): Promise<void> => {
    // In a stateless JWT system, logout is handled client-side
    res.json({ message: 'Logged out successfully' });
  };
}
