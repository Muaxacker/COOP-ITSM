import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as dashboardService from '../services/dashboard.service';
import { success } from '../utils/response';

export async function getDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await dashboardService.getDashboardData(req.user!);
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}
