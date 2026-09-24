import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.post('/generate', requireAuth, DashboardController.generateInvoices);
router.get('/:id/download', requireAuth, DashboardController.downloadInvoicePdf);

export default router;
