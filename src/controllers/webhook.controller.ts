import { Request, Response } from 'express';
import { ReceiptService } from '../services/receipt.service';

export class WebhookController {
  /**
   * Controller for parsing, validating, and routing webhook receipt data to the service layer.
   */
  static async handleGrabReceipt(req: Request, res: Response): Promise<void> {
    try {
      const {
        storeIdentifier,
        grabOrderId,
        orderDate,
        rawSubtotal,
        totalCollectedByGrab,
        orderLineItems
      } = req.body;


      // Basic parameter validations
      if (!storeIdentifier || typeof storeIdentifier !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "storeIdentifier"' });
        return;
      }
      if (!grabOrderId || typeof grabOrderId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "grabOrderId"' });
        return;
      }
      if (!orderDate || typeof orderDate !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "orderDate"' });
        return;
      }
      if (rawSubtotal === undefined || typeof rawSubtotal !== 'number') {
        res.status(400).json({ error: 'Missing or invalid number: "rawSubtotal"' });
        return;
      }
      if (totalCollectedByGrab === undefined || typeof totalCollectedByGrab !== 'number') {
        res.status(400).json({ error: 'Missing or invalid number: "totalCollectedByGrab"' });
        return;
      }
      if (!Array.isArray(orderLineItems) || orderLineItems.length === 0) {
        res.status(400).json({ error: 'Missing or invalid non-empty array: "orderLineItems"' });
        return;
      }

      // Map optional parameters with safety defaults
      const rawDeliveryFee = typeof req.body.rawDeliveryFee === 'number' ? req.body.rawDeliveryFee : 0.00;
      const rawTax = typeof req.body.rawTax === 'number' ? req.body.rawTax : 0.00;
      const rawGrabCommission = typeof req.body.rawGrabCommission === 'number' ? req.body.rawGrabCommission : 0.00;
      const voucherBarcode = typeof req.body.voucherBarcode === 'string' ? req.body.voucherBarcode : undefined;

      // Invoke transaction database logic
      const result = await ReceiptService.ingestGrabReceipt({
        storeIdentifier,
        grabOrderId,
        orderDate,
        rawSubtotal,
        rawDeliveryFee,
        rawTax,
        rawGrabCommission,
        totalCollectedByGrab,
        voucherBarcode,
        orderLineItems
      });

      res.status(201).json(result);
    } catch (error: any) {
      const message = error.message || 'Internal Server Error';

      // Route-level HTTP Code Mapping
      if (message.includes('Storefront not registered')) {
        res.status(404).json({ error: 'Storefront Not Found', details: message });
        return;
      }

      if (message.includes('Duplicate Order')) {
        res.status(409).json({ error: 'Duplicate Order Conflict', details: message });
        return;
      }

      res.status(500).json({ error: 'Internal Database Server Error', details: message });
    }
  }
}
