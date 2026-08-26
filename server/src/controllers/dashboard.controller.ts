import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as DashboardService from '../services/dashboard.service';
import { success, forbidden } from '../utils/response';

export async function customerDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'CUSTOMER') return forbidden(res);
    return success(res, await DashboardService.getCustomerDashboard(req.user!.userId));
  } catch (err) {
    return next(err);
  }
}

export async function officerDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'OFFICER') return forbidden(res);
    return success(res, await DashboardService.getOfficerDashboard(req.user!.userId));
  } catch (err) {
    return next(err);
  }
}

export async function managerDashboard(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'MANAGER' && req.user!.role !== 'ADMIN') return forbidden(res);
    return success(res, await DashboardService.getManagerDashboard());
  } catch (err) {
    return next(err);
  }
}
