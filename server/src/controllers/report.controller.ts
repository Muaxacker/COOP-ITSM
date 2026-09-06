import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as reportService from '../services/report.service';
import { success } from '../utils/response';

export async function getReports(_req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = await reportService.getOperationalReports();
    return success(res, data);
  } catch (err) {
    return next(err);
  }
}

