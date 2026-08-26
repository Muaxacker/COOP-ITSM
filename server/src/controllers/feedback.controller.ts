import { param } from '../utils/params';
import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../types';
import * as FeedbackService from '../services/feedback.service';
import { success, created, forbidden } from '../utils/response';

const submitSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export async function submitFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'CUSTOMER') return forbidden(res, 'Only customers can submit feedback');
    const { rating, comment } = submitSchema.parse(req.body);
    const feedback = await FeedbackService.submitFeedback({
      requestId: param(req.params.id),
      customerId: req.user!.userId,
      rating,
      comment,
    });
    return created(res, feedback, 'Thank you for your feedback!');
  } catch (err) {
    return next(err);
  }
}

export async function getFeedback(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const feedback = await FeedbackService.getFeedback(param(req.params.id), req.user!.userId);
    return success(res, feedback);
  } catch (err) {
    return next(err);
  }
}
