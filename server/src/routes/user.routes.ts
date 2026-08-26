import { Router } from 'express';
import { getUsers, getUserById, createUser, updateUser, toggleUserStatus } from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Officers can GET users (for assign dropdown) — but only ADMIN can create/edit/delete
router.get('/', authenticate, authorize('ADMIN', 'MANAGER', 'OFFICER'), getUsers);
router.post('/', authenticate, authorize('ADMIN'), createUser);
router.get('/:id', authenticate, authorize('ADMIN', 'MANAGER', 'OFFICER'), getUserById);
router.patch('/:id', authenticate, authorize('ADMIN'), updateUser);
router.patch('/:id/status', authenticate, authorize('ADMIN'), toggleUserStatus);

export default router;
