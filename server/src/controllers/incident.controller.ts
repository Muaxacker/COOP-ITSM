import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest, Priority, IncidentStatus, DivisionCode } from '../types';
import * as incidentService from '../services/incident.service';
import { success, created } from '../utils/response';
import { param } from '../utils/params';

const createIncidentSchema = z.object({
  branchId: z.string().uuid('Invalid branch ID'),
  categoryId: z.string().uuid('Invalid category ID'),
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.nativeEnum(Priority).optional(),
});

const reviewIncidentSchema = z.object({
  priority: z.nativeEnum(Priority).optional(),
  categoryId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

const assignTechnicianSchema = z.object({
  technicianId: z.string().uuid('Invalid technician ID'),
  notes: z.string().optional(),
});

const troubleshootingSchema = z.object({
  action: z.string().min(2, 'Action is required'),
  observation: z.string().min(2, 'Observation is required'),
  result: z.string().min(2, 'Result is required'),
});

const resolveIncidentSchema = z.object({
  rootCause: z.string().min(5, 'Root cause must be detailed'),
  resolution: z.string().min(5, 'Resolution must be detailed'),
  notes: z.string().optional(),
});

const verifyResolutionSchema = z.object({
  isResolved: z.boolean(),
  feedback: z.string().optional(),
});

const noteSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  isInternal: z.boolean().optional(),
});

export async function createIncident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = createIncidentSchema.parse(req.body);
    const incident = await incidentService.createIncident({
      ...data,
      reportedById: req.user!.userId,
    });
    return created(res, incident, 'Incident submitted successfully');
  } catch (err) {
    return next(err);
  }
}

export async function getIncidents(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const {
      status,
      priority,
      divisionId,
      divisionCode,
      categoryId,
      branchId,
      assignedTechnicianId,
      reportedById,
      slaBreached,
      search,
      page,
      limit,
    } = req.query;

    const filters = {
      status: status as IncidentStatus,
      priority: priority as Priority,
      divisionId: divisionId as string,
      divisionCode: divisionCode as DivisionCode,
      categoryId: categoryId as string,
      branchId: branchId as string,
      assignedTechnicianId: assignedTechnicianId as string,
      reportedById: reportedById as string,
      slaBreached: slaBreached !== undefined ? slaBreached === 'true' : undefined,
      search: search as string,
    };

    const pagination = {
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 20,
    };

    const result = await incidentService.getIncidents(filters, pagination, req.user!);
    return success(res, result);
  } catch (err) {
    return next(err);
  }
}

export async function getIncidentById(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const incident = await incidentService.getIncidentById(param(req.params.id), req.user!);
    return success(res, incident);
  } catch (err) {
    return next(err);
  }
}

export async function reviewIncident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = reviewIncidentSchema.parse(req.body);
    const incident = await incidentService.reviewIncident(param(req.params.id), req.user!.userId, data);
    return success(res, incident, 'Incident reviewed successfully');
  } catch (err) {
    return next(err);
  }
}

export async function assignTechnician(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { technicianId, notes } = assignTechnicianSchema.parse(req.body);
    const incident = await incidentService.assignTechnician(
      param(req.params.id),
      req.user!.userId,
      technicianId,
      notes
    );
    return success(res, incident, 'Technician assigned successfully');
  } catch (err) {
    return next(err);
  }
}

export async function startInvestigation(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const incident = await incidentService.startInvestigation(param(req.params.id), req.user!.userId);
    return success(res, incident, 'Investigation started');
  } catch (err) {
    return next(err);
  }
}

export async function requestMoreInfo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { question } = z.object({ question: z.string().min(3) }).parse(req.body);
    const incident = await incidentService.requestMoreInfo(param(req.params.id), req.user!.userId, question);
    return success(res, incident, 'Information requested from branch');
  } catch (err) {
    return next(err);
  }
}

export async function provideMoreInfo(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { response } = z.object({ response: z.string().min(3) }).parse(req.body);
    const incident = await incidentService.provideMoreInfo(param(req.params.id), req.user!.userId, response);
    return success(res, incident, 'Information provided to technician');
  } catch (err) {
    return next(err);
  }
}

export async function addTroubleshootingLog(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = troubleshootingSchema.parse(req.body);
    const log = await incidentService.addTroubleshootingLog(param(req.params.id), req.user!.userId, data);
    return created(res, log, 'Troubleshooting step recorded');
  } catch (err) {
    return next(err);
  }
}

export async function resolveIncident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = resolveIncidentSchema.parse(req.body);
    const incident = await incidentService.resolveIncident(param(req.params.id), req.user!.userId, data);
    return success(res, incident, 'Incident marked as resolved');
  } catch (err) {
    return next(err);
  }
}

export async function verifyResolution(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const data = verifyResolutionSchema.parse(req.body);
    const incident = await incidentService.verifyResolution(param(req.params.id), req.user!.userId, data);
    return success(
      res,
      incident,
      data.isResolved ? 'Resolution confirmed. Incident closed.' : 'Incident reopened for troubleshooting.'
    );
  } catch (err) {
    return next(err);
  }
}

export async function addNote(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { message, isInternal } = noteSchema.parse(req.body);
    const note = await incidentService.addIncidentNote(
      param(req.params.id),
      req.user!.userId,
      message,
      isInternal
    );
    return created(res, note, 'Note added');
  } catch (err) {
    return next(err);
  }
}


const reclassifySchema = z.object({
  categoryId: z.string().uuid(),
  notes: z.string().optional(),
});

export async function reclassifyIncident(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const { categoryId, notes } = reclassifySchema.parse(req.body);
    const incident = await incidentService.reclassifyIncident(
      param(req.params.id),
      req.user!.userId,
      { categoryId, notes }
    );
    return success(res, incident, 'Incident reclassified successfully');
  } catch (err) {
    return next(err);
  }
}
