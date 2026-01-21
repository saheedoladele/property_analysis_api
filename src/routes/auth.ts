import { Router } from 'express';
import { AuthController } from '../controllers/AuthController.js';
import { authenticate } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validation.js';
import { z } from 'zod';

const router = Router();
const authController = new AuthController();

// Validation schemas
const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1),
  phone: z.string().optional(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  phone: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
});

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', validate(registerSchema), asyncHandler(authController.register));

/**
 * POST /api/auth/login
 * Login user
 */
router.post('/login', validate(loginSchema), asyncHandler(authController.login));

/**
 * GET /api/auth/me
 * Get current user
 */
router.get('/me', authenticate, asyncHandler(authController.getCurrentUser));

/**
 * PUT /api/auth/profile
 * Update user profile
 */
router.put(
  '/profile',
  authenticate,
  validate(updateProfileSchema),
  asyncHandler(authController.updateProfile)
);

/**
 * PUT /api/auth/password
 * Change password
 */
router.put(
  '/password',
  authenticate,
  validate(changePasswordSchema),
  asyncHandler(authController.changePassword)
);

/**
 * POST /api/auth/logout
 * Logout user
 */
router.post('/logout', authenticate, asyncHandler(authController.logout));

export default router;
