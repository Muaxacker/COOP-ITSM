import { param } from '../utils/params';
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest, Role } from '../types';
import * as UserService from '../services/user.service';
import { success, created } from '../utils/response';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.nativeEnum(Role),
  departmentId: z.string().uuid().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  departmentId: z.string().uuid().nullable().optional(),
});

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = req.query.role as Role | undefined;
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const result = await UserService.getUsers({ role, search, page, limit });
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getUserById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await UserService.getUserById(param(req.params.id));
    return success(res, user);
  } catch (err) {
    return next(err);
  }
}

export async function createUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await UserService.createUser(data);
    return created(res, user, 'User created successfully');
  } catch (err) {
    return next(err);
  }
}

export async function updateUser(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateUserSchema.parse(req.body);
    const user = await UserService.updateUser(param(req.params.id), data);
    return success(res, user, 'User updated successfully');
  } catch (err) {
    return next(err);
  }
}

export async function toggleUserStatus(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const user = await UserService.toggleUserStatus(param(req.params.id));
    return success(res, user, `User ${user.isActive ? 'activated' : 'deactivated'} successfully`);
  } catch (err) {
    return next(err);
  }
}
