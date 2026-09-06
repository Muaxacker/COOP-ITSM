import { Router } from 'express';
import { getReports } from '../controllers/report.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate);
router.get('/', authorize(Role.IT_SUPERVISOR, Role.ADMIN), getReports);

export default router;

