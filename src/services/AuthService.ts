import { UserRepository } from '../repositories/UserRepository';
import { hashPassword, verifyPassword, generateToken } from '../utils/auth';
import { UserDto, RegisterDto, LoginDto, UpdateProfileDto, ChangePasswordDto } from '../types';

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  async register(data: RegisterDto): Promise<{ user: UserDto; token: string }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('An account with this email already exists');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user
    const user = await this.userRepository.create({
      email: data.email.toLowerCase(),
      name: data.name,
      phone: data.phone,
      passwordHash,
      lastLoginAt: new Date(),
    });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: this.toDto(user),
      token,
    };
  }

  async login(data: LoginDto): Promise<{ user: UserDto; token: string }> {
    // Find user
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isValid = await verifyPassword(data.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.update(user.id, { lastLoginAt: user.lastLoginAt });

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });

    return {
      user: this.toDto(user),
      token,
    };
  }

  async getCurrentUser(userId: string): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return this.toDto(user);
  }

  async updateProfile(userId: string, data: UpdateProfileDto): Promise<UserDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const updates: any = {};
    if (data.name) updates.name = data.name;
    if (data.phone !== undefined) updates.phone = data.phone;

    const updatedUser = await this.userRepository.update(userId, updates);
    if (!updatedUser) {
      throw new Error('Failed to update profile');
    }

    return this.toDto(updatedUser);
  }

  async changePassword(userId: string, data: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isValid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await hashPassword(data.newPassword);
    await this.userRepository.update(userId, { passwordHash });
  }

  private toDto(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
    };
  }
}
