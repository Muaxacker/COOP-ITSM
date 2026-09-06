import { Router } from 'express';
import { listAuditLogs } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate);
router.get('/', authorize(Role.ADMIN, Role.IT_SUPERVISOR), listAuditLogs);

export default router;
