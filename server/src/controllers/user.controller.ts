import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest, Role } from '../types';
import * as UserService from '../services/user.service';
import { success, created } from '../utils/response';
import { param } from '../utils/params';

const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.nativeEnum(Role),
  branchId: z.string().uuid().optional(),
  divisionId: z.string().uuid().optional(),
  phone: z.string().optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(Role).optional(),
  branchId: z.string().uuid().nullable().optional(),
  divisionId: z.string().uuid().nullable().optional(),
  phone: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function getUsers(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = req.query.role as Role | undefined;
    const branchId = req.query.branchId as string | undefined;
    const divisionId = req.query.divisionId as string | undefined;
    const search = req.query.search as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await UserService.getUsers({
      role,
      branchId,
      divisionId,
      search,
      page,
      limit,
    });
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getTechnicians(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const divisionId = req.query.divisionId as string | undefined;
    const technicians = await UserService.getTechnicians(divisionId);
    return success(res, technicians);
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
    return success(
      res,
      user,
      `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    );
  } catch (err) {
    return next(err);
  }
}
