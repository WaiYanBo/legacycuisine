import { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';

const router = Router();

// Endpoint for receiving webhook payload from n8n automation
router.post('/grab-receipts', WebhookController.handleGrabReceipt);

export default router;
