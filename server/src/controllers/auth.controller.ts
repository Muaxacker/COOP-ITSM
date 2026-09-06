import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { loginUser, getMe, updateProfile, changePassword } from '../services/auth.service';
import { success } from '../utils/response';
import { AuthRequest } from '../types';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = loginSchema.parse(req.body);
    const result = await loginUser(email, password);
    return success(res, result, 'Login successful');
  } catch (err) {
    return next(err);
  }
}

export async function logout(_req: Request, res: Response) {
  return success(res, null, 'Logged out successfully');
}

export async function me(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await getMe(req.user!.userId);
    return success(res, user);
  } catch (err) {
    return next(err);
  }
}

const updateProfileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phone: z.string().nullable().optional(),
  avatarUrl: z.string().nullable().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
});

export async function updateMyProfile(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body);
    const user = await updateProfile(req.user!.userId, data);
    return success(res, user, 'Profile updated successfully');
  } catch (err) {
    return next(err);
  }
}

export async function changeMyPassword(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);
    const result = await changePassword(req.user!.userId, currentPassword, newPassword);
    return success(res, result, 'Password updated successfully');
  } catch (err) {
    return next(err);
  }
}

const verify2faLoginSchema = z.object({
  tempToken: z.string().min(1, 'Temporary token is required'),
  code: z.string().min(6, '6-digit code is required'),
});

export async function verify2faLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { tempToken, code } = verify2faLoginSchema.parse(req.body);
    const { verifyTwoFactorLogin } = await import('../services/auth.service');
    const result = await verifyTwoFactorLogin(tempToken, code);
    return success(res, result, 'Two-factor authentication verified successfully');
  } catch (err) {
    return next(err);
  }
}

export async function setup2fa(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { setupTwoFactor } = await import('../services/auth.service');
    const result = await setupTwoFactor(req.user!.userId);
    return success(res, result, 'Two-factor setup generated');
  } catch (err) {
    return next(err);
  }
}

const enable2faSchema = z.object({
  secret: z.string().min(1, 'Secret is required'),
  code: z.string().min(6, '6-digit code is required'),
});

export async function enable2fa(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { secret, code } = enable2faSchema.parse(req.body);
    const { enableTwoFactor } = await import('../services/auth.service');
    const result = await enableTwoFactor(req.user!.userId, secret, code);
    return success(res, result, 'Two-factor authentication enabled successfully');
  } catch (err) {
    return next(err);
  }
}

const disable2faSchema = z.object({
  password: z.string().min(1, 'Current password is required'),
});

export async function disable2fa(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { password } = disable2faSchema.parse(req.body);
    const { disableTwoFactor } = await import('../services/auth.service');
    const result = await disableTwoFactor(req.user!.userId, password);
    return success(res, result, 'Two-factor authentication disabled successfully');
  } catch (err) {
    return next(err);
  }
}

