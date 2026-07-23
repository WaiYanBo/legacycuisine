import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';

const router = Router();

// Routes for real-time financial tracking and metrics
router.get('/metrics', DashboardController.getMetrics);

// Routes for base price review and ledger correction
router.get('/products/needs-review', DashboardController.getNeedsReview);
router.patch('/products/:id', DashboardController.updateProductBasePrice);

// Routes for generating invoicing statements in batches
router.post('/invoices/generate', DashboardController.generateInvoices);

export default router;
