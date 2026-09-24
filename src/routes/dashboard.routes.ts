import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Routes for real-time financial tracking and metrics
router.get('/metrics', requireAuth, DashboardController.getMetrics);

// Routes for base price review and ledger correction
router.get('/products/needs-review', requireAuth, DashboardController.getNeedsReview);
router.patch('/products/:id', requireAuth, DashboardController.updateProductBasePrice);

// Routes for generating invoicing statements in batches
router.post('/invoices/generate', requireAuth, DashboardController.generateInvoices);

export default router;
