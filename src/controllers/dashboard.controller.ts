import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { DashboardService } from '../services/dashboard.service';
import { PdfService } from '../services/pdf.service';
import { CompressionUtil } from '../utils/compression.util';
import { prisma } from '../prisma';

export class DashboardController {
  /**
   * GET /api/dashboard/metrics
   * Fetches gross revenue, base payouts, net profits, and visual chart datasets.
   */
  static async getMetrics(req: Request, res: Response): Promise<void> {
    try {
      const range = typeof req.query.range === 'string' ? req.query.range : 'monthly';
      const metrics = await DashboardService.getMetrics(range);
      res.status(200).json(metrics);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve dashboard metrics.', details: error.message });
    }
  }

  /**
   * GET /api/dashboard/products/needs-review
   * Fetches all products requiring manual storefront restaurant base price review.
   */
  static async getNeedsReview(req: Request, res: Response): Promise<void> {
    try {
      const products = await DashboardService.getNeedsReview();
      res.status(200).json(products);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve items requiring review.', details: error.message });
    }
  }

  /**
   * PATCH /api/dashboard/products/:id
   * Updates base restaurant price and triggers dynamic re-reconciliation for matching PENDING logs.
   */
  static async updateProductBasePrice(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { restaurantBasePrice } = req.body;

      if (restaurantBasePrice === undefined || typeof restaurantBasePrice !== 'number' || restaurantBasePrice < 0) {
        res.status(400).json({ error: 'Missing or invalid positive number: "restaurantBasePrice"' });
        return;
      }

      const updatedProduct = await DashboardService.updateProductBasePrice(id, restaurantBasePrice);
      res.status(200).json({
        message: 'Product price updated and pending logs re-reconciled successfully.',
        product: updatedProduct,
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update product base price.', details: error.message });
    }
  }

  /**
   * POST /api/dashboard/invoices/generate
   * Generates statements based on merchantId and a billingDate.
   */
  static async generateInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId: reqMerchantId, vendorId, billingDate } = req.body;
      const merchantId = reqMerchantId || vendorId;

      if (!merchantId || typeof merchantId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "merchantId"' });
        return;
      }
      if (!billingDate || typeof billingDate !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "billingDate"' });
        return;
      }

      const end = new Date(billingDate);
      end.setHours(23, 59, 59, 999);

      // Find all outstanding Reconciled logs for this merchant on or before the billing date
      const logs = await prisma.reconciliationLog.findMany({
        where: {
          status: 'RECONCILED',
          grabOrder: {
            storefront: {
              merchantId: merchantId,
            },
            orderDate: {
              lte: end,
            },
          },
        },
      });

      if (logs.length === 0) {
        res.status(404).json({ error: 'No outstanding reconciled orders found for this merchant on or before the selected date. Ensure you verify base prices first!' });
        return;
      }

      // Create a single consolidated Invoice for the merchant
      const invoiceNum = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const invoice = await prisma.invoice.create({
        data: {
          merchantId,
          invoiceNumber: invoiceNum,
          billingDate: new Date(billingDate),
          status: 'DRAFT',
        },
      });

      // Link logs to this invoice and update their status to INVOICED
      await prisma.reconciliationLog.updateMany({
        where: { id: { in: logs.map((l: any) => l.id) } },
        data: {
          invoiceId: invoice.id,
          status: 'INVOICED',
        },
      });

      // Render the PDF
      const pdfPath = await PdfService.generateInvoicePdf(invoice.id);

      res.status(201).json({
        message: `Successfully generated invoice ${invoiceNum} compiling ${logs.length} order(s).`,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoiceNum,
          pdfPath,
          downloadUrl: `/api/invoices/${invoice.id}/download`,
          logsLinked: logs.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate batch invoices.', details: error.message });
    }
  }

  /**
   * GET /api/invoices/:id/download
   * Decompresses and streams generated PDF statement directly to browser.
   */
  static async downloadInvoicePdf(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const invoice = await prisma.invoice.findUnique({ where: { id } });

      if (!invoice || !invoice.pdfPath) {
        res.status(404).json({ error: `Invoice with ID "${id}" or its PDF statement was not found.` });
        return;
      }

      const relativePath = invoice.pdfPath.replace(/^\//, '');
      const fullPath = path.join(process.cwd(), relativePath);

      if (!fs.existsSync(fullPath)) {
        res.status(404).json({ error: 'PDF file not found on disk storage.' });
        return;
      }

      const compressedBuffer = fs.readFileSync(fullPath);
      let pdfBuffer: Buffer;
      if (fullPath.endsWith('.gz')) {
        pdfBuffer = await CompressionUtil.decompressBuffer(compressedBuffer);
      } else {
        pdfBuffer = compressedBuffer;
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="${invoice.invoiceNumber}.pdf"`);
      res.send(pdfBuffer);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to download invoice PDF.', details: error.message });
    }
  }
}
