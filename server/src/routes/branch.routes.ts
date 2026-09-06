import { Router } from 'express';
import {
  getBranches,
  getBranchById,
  createBranch,
  updateBranch,
} from '../controllers/branch.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', getBranches);
router.get('/:id', getBranchById);
router.post('/', authorize(Role.ADMIN), createBranch);
router.patch('/:id', authorize(Role.ADMIN), updateBranch);

export default router;

