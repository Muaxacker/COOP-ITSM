import { Router } from 'express';
import { customerDashboard, officerDashboard, managerDashboard } from '../controllers/dashboard.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/customer', customerDashboard);
router.get('/officer', officerDashboard);
router.get('/manager', managerDashboard);

export default router;
