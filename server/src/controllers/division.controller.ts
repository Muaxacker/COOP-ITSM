import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as divisionService from '../services/division.service';
import { Priority } from '../types';
import { success, created } from '../utils/response';
import { param } from '../utils/params';

const createCategorySchema = z.object({
  divisionId: z.string().uuid('Invalid division ID'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().optional(),
  defaultPriority: z.nativeEnum(Priority).optional(),
  defaultSlaHours: z.number().positive().optional(),
});

const updateCategorySchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  defaultPriority: z.nativeEnum(Priority).optional(),
  defaultSlaHours: z.number().positive().optional(),
  isActive: z.boolean().optional(),
});

export async function getDivisions(_req: Request, res: Response, next: NextFunction) {
  try {
    const divisions = await divisionService.getDivisions();
    return success(res, divisions);
  } catch (err) {
    return next(err);
  }
}

export async function getDivisionById(req: Request, res: Response, next: NextFunction) {
  try {
    const division = await divisionService.getDivisionById(param(req.params.id));
    return success(res, division);
  } catch (err) {
    return next(err);
  }
}

export async function getCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const divisionId = req.query.divisionId as string | undefined;
    const categories = await divisionService.getCategories(divisionId);
    return success(res, categories);
  } catch (err) {
    return next(err);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createCategorySchema.parse(req.body);
    const category = await divisionService.createCategory(data);
    return created(res, category, 'Category created successfully');
  } catch (err) {
    return next(err);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateCategorySchema.parse(req.body);
    const category = await divisionService.updateCategory(param(req.params.id), data);
    return success(res, category, 'Category updated successfully');
  } catch (err) {
    return next(err);
  }
}

