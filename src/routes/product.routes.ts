import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/needs-review', requireAuth, DashboardController.getNeedsReview);
router.patch('/:id/review', requireAuth, DashboardController.updateProductBasePrice);

export default router;
