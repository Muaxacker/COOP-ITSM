import { Router } from 'express';
import {
  getDivisions,
  getDivisionById,
  getCategories,
  createCategory,
  updateCategory,
} from '../controllers/division.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate);

router.get('/', getDivisions);
router.get('/categories', getCategories);
router.get('/:id', getDivisionById);

router.post('/categories', authorize(Role.ADMIN), createCategory);
router.patch('/categories/:id', authorize(Role.ADMIN), updateCategory);

export default router;

