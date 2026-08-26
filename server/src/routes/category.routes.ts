import { Router } from 'express';
import { getCategories, createCategory, updateCategory } from '../controllers/category.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getCategories);
router.post('/', authenticate, authorize('ADMIN'), createCategory);
router.patch('/:id', authenticate, authorize('ADMIN'), updateCategory);

export default router;
