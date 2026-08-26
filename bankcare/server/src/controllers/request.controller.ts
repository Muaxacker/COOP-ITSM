import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest, Role } from '../types';
import * as RequestService from '../services/request.service';
import { success, created, forbidden } from '../utils/response';
import { param } from '../utils/params';

const createSchema = z.object({
  categoryId: z.string().uuid(),
  title: z.string().min(5, 'Title must be at least 5 characters').max(200),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000),
});

const assignSchema = z.object({
  officerId: z.string().uuid(),
});

const noteSchema = z.object({
  note: z.string().min(1).max(2000),
  isCustomerVisible: z.boolean().default(false),
});

const escalateSchema = z.object({
  reason: z.string().min(5).max(1000),
});

const resolveSchema = z.object({
  resolution: z.string().min(5).max(2000),
});

const reopenSchema = z.object({
  reason: z.string().min(5).max(1000),
});

export async function createRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'CUSTOMER') {
      return forbidden(res, 'Only customers can create requests');
    }
    const data = createSchema.parse(req.body);
    const request = await RequestService.createRequest({
      customerId: req.user!.userId,
      ...data,
    });
    return created(res, request, 'Request submitted successfully');
  } catch (err) {
    return next(err);
  }
}

export async function getRequests(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { status, priority, categoryId, search, page, limit } = req.query;
    const result = await RequestService.getRequests(
      { userId: req.user!.userId, role: req.user!.role as Role },
      {
        status: status as any,
        priority: priority as any,
        categoryId: categoryId as string,
        search: search as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      }
    );
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getRequestById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const isCustomer = req.user!.role === 'CUSTOMER';
    const request = await RequestService.getRequestById(
      param(req.params.id),
      { userId: req.user!.userId, role: req.user!.role as Role },
      isCustomer
    );
    return success(res, request);
  } catch (err) {
    return next(err);
  }
}

export async function reviewRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    if (role !== 'OFFICER' && role !== 'MANAGER' && role !== 'ADMIN') {
      return forbidden(res, 'Not authorized');
    }
    const request = await RequestService.reviewRequest(param(req.params.id), req.user!.userId);
    return success(res, request, 'Request reviewed');
  } catch (err) {
    return next(err);
  }
}

export async function assignRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    if (role !== 'OFFICER' && role !== 'MANAGER' && role !== 'ADMIN') {
      return forbidden(res, 'Not authorized');
    }
    const { officerId } = assignSchema.parse(req.body);
    const request = await RequestService.assignRequest(param(req.params.id), officerId, req.user!.userId);
    return success(res, request, 'Request assigned');
  } catch (err) {
    return next(err);
  }
}

export async function startInvestigation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'OFFICER') return forbidden(res, 'Only officers can start investigations');
    const request = await RequestService.startInvestigation(param(req.params.id), req.user!.userId);
    return success(res, request, 'Investigation started');
  } catch (err) {
    return next(err);
  }
}

export async function addNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    if (role !== 'OFFICER' && role !== 'MANAGER' && role !== 'ADMIN') {
      return forbidden(res, 'Not authorized');
    }
    const { note, isCustomerVisible } = noteSchema.parse(req.body);
    const activity = await RequestService.addNote(param(req.params.id), req.user!.userId, note, isCustomerVisible);
    return created(res, activity, 'Note added');
  } catch (err) {
    return next(err);
  }
}

export async function escalateRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'OFFICER') return forbidden(res, 'Only officers can escalate requests');
    const { reason } = escalateSchema.parse(req.body);
    const request = await RequestService.escalateRequest(param(req.params.id), req.user!.userId, reason);
    return success(res, request, 'Request escalated');
  } catch (err) {
    return next(err);
  }
}

export async function resolveRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const role = req.user!.role;
    if (role !== 'OFFICER' && role !== 'MANAGER' && role !== 'ADMIN') {
      return forbidden(res, 'Not authorized');
    }
    const { resolution } = resolveSchema.parse(req.body);
    const request = await RequestService.resolveRequest(param(req.params.id), req.user!.userId, resolution);
    return success(res, request, 'Request resolved');
  } catch (err) {
    return next(err);
  }
}

export async function reopenRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    if (req.user!.role !== 'CUSTOMER') return forbidden(res, 'Only customers can reopen requests');
    const { reason } = reopenSchema.parse(req.body);
    const request = await RequestService.reopenRequest(param(req.params.id), req.user!.userId, reason);
    return success(res, request, 'Request reopened');
  } catch (err) {
    return next(err);
  }
}

export async function closeRequest(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const request = await RequestService.closeRequest(param(req.params.id), req.user!.userId);
    return success(res, request, 'Request closed');
  } catch (err) {
    return next(err);
  }
}
