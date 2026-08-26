import { param } from '../utils/params';
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest, Priority } from '../types';
import * as CategoryService from '../services/category.service';
import { success, created } from '../utils/response';

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  departmentId: z.string().uuid(),
  defaultDeadlineHours: z.number().int().min(1).default(24),
  defaultPriority: z.nativeEnum(Priority).default(Priority.MEDIUM),
});

const updateSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  departmentId: z.string().uuid().optional(),
  defaultDeadlineHours: z.number().int().min(1).optional(),
  defaultPriority: z.nativeEnum(Priority).optional(),
  isActive: z.boolean().optional(),
});

export async function getCategories(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const activeOnly = req.query.all !== 'true';
    return success(res, await CategoryService.getCategories(activeOnly));
  } catch (err) {
    return next(err);
  }
}

export async function createCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    return created(res, await CategoryService.createCategory(data));
  } catch (err) {
    return next(err);
  }
}

export async function updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = updateSchema.parse(req.body);
    return success(res, await CategoryService.updateCategory(param(req.params.id), data), 'Category updated');
  } catch (err) {
    return next(err);
  }
}
