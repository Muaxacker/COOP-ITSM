import { Request, Response } from 'express';
import { getAuditLogs } from '../services/audit.service';

export async function listAuditLogs(req: Request, res: Response): Promise<void> {
  try {
    const { page, limit, action, entityType, userId, startDate, endDate } = req.query;

    const result = await getAuditLogs({
      page: page ? parseInt(page as string, 10) : undefined,
      limit: limit ? parseInt(limit as string, 10) : undefined,
      action: action as string,
      entityType: entityType as string,
      userId: userId as string,
      startDate: startDate as string,
      endDate: endDate as string,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to retrieve audit trail',
    });
  }
}
