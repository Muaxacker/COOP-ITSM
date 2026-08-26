import { param } from '../utils/params';
import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as NotifService from '../services/notification.service';
import { success } from '../utils/response';

export async function getNotifications(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const [notifications, unreadCount] = await Promise.all([
      NotifService.getNotifications(req.user!.userId),
      NotifService.getUnreadCount(req.user!.userId),
    ]);
    return success(res, { notifications, unreadCount });
  } catch (err) {
    return next(err);
  }
}

export async function markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await NotifService.markAsRead(param(req.params.id), req.user!.userId);
    return success(res, null, 'Notification marked as read');
  } catch (err) {
    return next(err);
  }
}

export async function markAllAsRead(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    await NotifService.markAllAsRead(req.user!.userId);
    return success(res, null, 'All notifications marked as read');
  } catch (err) {
    return next(err);
  }
}
