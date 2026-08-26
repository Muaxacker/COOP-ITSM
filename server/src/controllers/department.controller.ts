import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import * as DeptService from '../services/department.service';
import { success, created } from '../utils/response';

const createSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
});

export async function getDepartments(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    return success(res, await DeptService.getDepartments());
  } catch (err) {
    return next(err);
  }
}

export async function createDepartment(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createSchema.parse(req.body);
    return created(res, await DeptService.createDepartment(data));
  } catch (err) {
    return next(err);
  }
}
