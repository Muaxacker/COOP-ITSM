import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import * as branchService from '../services/branch.service';
import { success, created } from '../utils/response';
import { param } from '../utils/params';

const createBranchSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  code: z.string().min(2, 'Code must be at least 2 characters'),
  location: z.string().min(2, 'Location is required'),
  phone: z.string().optional(),
});

const updateBranchSchema = z.object({
  name: z.string().min(2).optional(),
  code: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  phone: z.string().optional(),
  isActive: z.boolean().optional(),
});

export async function getBranches(req: Request, res: Response, next: NextFunction) {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const branches = await branchService.getBranches(includeInactive);
    return success(res, branches);
  } catch (err) {
    return next(err);
  }
}

export async function getBranchById(req: Request, res: Response, next: NextFunction) {
  try {
    const branch = await branchService.getBranchById(param(req.params.id));
    return success(res, branch);
  } catch (err) {
    return next(err);
  }
}

export async function createBranch(req: Request, res: Response, next: NextFunction) {
  try {
    const data = createBranchSchema.parse(req.body);
    const branch = await branchService.createBranch(data);
    return created(res, branch, 'Branch created successfully');
  } catch (err) {
    return next(err);
  }
}

export async function updateBranch(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateBranchSchema.parse(req.body);
    const branch = await branchService.updateBranch(param(req.params.id), data);
    return success(res, branch, 'Branch updated successfully');
  } catch (err) {
    return next(err);
  }
}

