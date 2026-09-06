import { Router } from 'express';
import {
  uploadAttachment,
  listAttachments,
  removeAttachment,
} from '../controllers/attachment.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/incidents/:id/attachments', uploadAttachment);
router.get('/incidents/:id/attachments', listAttachments);
router.delete('/attachments/:attachmentId', removeAttachment);

export default router;
