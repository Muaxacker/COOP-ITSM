import { Router } from 'express';
import {
  getUsers,
  getTechnicians,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
} from '../controllers/user.controller';
import { authenticate, authorize } from '../middleware/auth';
import { Role } from '../types';

const router = Router();

router.use(authenticate);

router.get('/technicians', authorize(Role.ADMIN, Role.IT_SUPERVISOR), getTechnicians);
router.get('/', authorize(Role.ADMIN, Role.IT_SUPERVISOR), getUsers);
router.get('/:id', authorize(Role.ADMIN, Role.IT_SUPERVISOR), getUserById);

router.post('/', authorize(Role.ADMIN), createUser);
router.patch('/:id', authorize(Role.ADMIN), updateUser);
router.patch('/:id/status', authorize(Role.ADMIN), toggleUserStatus);

export default router;
