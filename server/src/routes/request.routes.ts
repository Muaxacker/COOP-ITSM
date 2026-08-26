import { Router } from 'express';
import * as RC from '../controllers/request.controller';
import * as FC from '../controllers/feedback.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.use(authenticate);

router.post('/', RC.createRequest);
router.get('/', RC.getRequests);
router.get('/:id', RC.getRequestById);

// State transitions
router.post('/:id/review', RC.reviewRequest);
router.post('/:id/assign', RC.assignRequest);
router.post('/:id/start', RC.startInvestigation);
router.post('/:id/note', RC.addNote);
router.post('/:id/escalate', RC.escalateRequest);
router.post('/:id/resolve', RC.resolveRequest);
router.post('/:id/reopen', RC.reopenRequest);
router.post('/:id/close', RC.closeRequest);

// Feedback
router.post('/:id/feedback', FC.submitFeedback);
router.get('/:id/feedback', FC.getFeedback);

export default router;
