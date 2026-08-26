import { Router } from 'express';
import { getDepartments, createDepartment } from '../controllers/department.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getDepartments);
router.post('/', authenticate, authorize('ADMIN'), createDepartment);

export default router;
