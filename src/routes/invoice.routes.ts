import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

router.post('/generate', DashboardController.generateInvoices);

export default router;
