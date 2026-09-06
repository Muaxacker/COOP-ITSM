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
