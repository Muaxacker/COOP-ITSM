import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { loginUser, getMe } from '../services/auth.service';
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
