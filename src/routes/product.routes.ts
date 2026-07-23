import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.get('/needs-review', DashboardController.getNeedsReview);
router.patch('/:id/review', DashboardController.updateProductBasePrice);

export default router;
