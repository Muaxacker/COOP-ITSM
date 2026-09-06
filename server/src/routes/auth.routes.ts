import { Router } from 'express';
import {
  login,
  logout,
  me,
  updateMyProfile,
  changeMyPassword,
  verify2faLogin,
  setup2fa,
  enable2fa,
  disable2fa,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/login', login);
router.post('/logout', logout);
router.post('/2fa/verify-login', verify2faLogin);

router.get('/me', authenticate, me);
router.patch('/profile', authenticate, updateMyProfile);
router.post('/change-password', authenticate, changeMyPassword);

// 2FA Management (Authenticated Staff)
router.post('/2fa/setup', authenticate, setup2fa);
router.post('/2fa/enable', authenticate, enable2fa);
router.post('/2fa/disable', authenticate, disable2fa);

export default router;

