/**
 * Shared TypeScript types and interfaces
 */

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

// User types
export interface UserDto {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: Date;
  lastLoginAt?: Date;
}

export interface RegisterDto {
  email: string;
  name: string;
  phone?: string;
  password: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface UpdateProfileDto {
  name?: string;
  phone?: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

// Property types
export interface PropertyDto {
  id: string;
  userId: string;
  address: string;
  postcode: string;
  propertyType?: string;
  tenure?: string;
  analysisData?: Record<string, any>;
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePropertyDto {
  address: string;
  postcode: string;
  propertyType?: string;
  tenure?: string;
  analysisData?: Record<string, any>;
}

export interface UpdatePropertyDto {
  address?: string;
  postcode?: string;
  propertyType?: string;
  tenure?: string;
  analysisData?: Record<string, any>;
}

// Analysis types
export interface AnalysisDto {
  id: string;
  propertyId?: string;
  userId: string;
  analysisData: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateAnalysisDto {
  propertyId?: string;
  analysisData: Record<string, any>;
}

export interface UpdateAnalysisDto {
  analysisData: Record<string, any>;
}

// Subscription types
export enum SubscriptionPlan {
  FREE = 'free',
  PREMIUM = 'premium',
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  EXPIRED = 'expired',
}

export interface SubscriptionDto {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  startDate: Date;
  endDate?: Date;
  stripeSubscriptionId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSubscriptionDto {
  plan: SubscriptionPlan;
  stripeSubscriptionId?: string;
}

// Deal Audit types
export interface DealAuditDto {
  id: string;
  userEmail: string;
  userName: string;
  userPhone?: string;
  propertyAddress: string;
  propertyPostcode: string;
  askingPrice?: string;
  additionalNotes?: string;
  bookingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateDealAuditDto {
  userEmail: string;
  userName: string;
  userPhone?: string;
  propertyAddress: string;
  propertyPostcode: string;
  askingPrice?: string;
  additionalNotes?: string;
  bookingDate?: string;
}

// Contact types
export interface ContactDto {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateContactDto {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

// Payment types
export interface PaymentDto {
  id: string;
  userId: string;
  paypalOrderId: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePaymentDto {
  amount: number;
  currency?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  email: string;
}
