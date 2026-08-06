import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

// Endpoint for receiving webhook payload from n8n automation
router.post('/grab-receipts', WebhookController.handleGrabReceipt);

// Endpoint for manual data input fallback when n8n is offline or bypassed
router.post('/manual-order', WebhookController.handleGrabReceipt);

// Endpoint for batch Excel / CSV order import
router.post('/batch-orders', WebhookController.handleBatchGrabReceipts);

export default router;


