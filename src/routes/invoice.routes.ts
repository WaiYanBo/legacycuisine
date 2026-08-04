import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.post('/generate', DashboardController.generateInvoices);
router.get('/:id/download', DashboardController.downloadInvoicePdf);

export default router;
