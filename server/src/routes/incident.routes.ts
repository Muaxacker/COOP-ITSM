import { Router } from 'express';
import {
  createIncident,
  getIncidents,
  getIncidentById,
  reviewIncident,
  assignTechnician,
  startInvestigation,
  requestMoreInfo,
  provideMoreInfo,
  addTroubleshootingLog,
  resolveIncident,
  verifyResolution,
  addNote,
} from '../controllers/incident.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', getIncidents);
router.post('/', authorize(Role.BRANCH_USER, Role.ADMIN), createIncident);

router.get('/:id', getIncidentById);

router.patch('/:id/review', authorize(Role.IT_SUPERVISOR, Role.ADMIN), reviewIncident);
router.post('/:id/assign', authorize(Role.IT_SUPERVISOR, Role.ADMIN), assignTechnician);

router.post('/:id/investigate', authorize(Role.TECHNICIAN, Role.ADMIN), startInvestigation);
router.post('/:id/request-info', authorize(Role.TECHNICIAN, Role.ADMIN), requestMoreInfo);
router.post('/:id/troubleshooting', authorize(Role.TECHNICIAN, Role.ADMIN), addTroubleshootingLog);
router.post('/:id/resolve', authorize(Role.TECHNICIAN, Role.ADMIN), resolveIncident);

router.post('/:id/provide-info', authorize(Role.BRANCH_USER, Role.ADMIN), provideMoreInfo);
router.post('/:id/verify', authorize(Role.BRANCH_USER, Role.ADMIN), verifyResolution);

router.post('/:id/notes', addNote);

export default router;

