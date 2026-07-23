import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { PdfService } from '../services/pdf.service';
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
   * Generates statements based on vendorId and a billingDate.
   */
  static async generateInvoices(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, billingDate } = req.body;

      if (!vendorId || typeof vendorId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "vendorId"' });
        return;
      }
      if (!billingDate || typeof billingDate !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "billingDate"' });
        return;
      }

      const end = new Date(billingDate);
      end.setHours(23, 59, 59, 999);

      // Find all outstanding Reconciled logs for this vendor on or before the billing date
      const logs = await prisma.reconciliationLog.findMany({
        where: {
          status: 'RECONCILED',
          grabOrder: {
            storefront: {
              vendorId: vendorId,
            },
            orderDate: {
              lte: end,
            },
          },
        },
      });

      if (logs.length === 0) {
        res.status(404).json({ error: 'No outstanding reconciled orders found for this vendor on or before the selected date. Ensure you verify base prices first!' });
        return;
      }

      // Create a single consolidated Invoice for the vendor
      const invoiceNum = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const invoice = await prisma.invoice.create({
        data: {
          vendorId,
          invoiceNumber: invoiceNum,
          billingDate: new Date(billingDate),
          status: 'DRAFT',
        },
      });

      // Link logs to this invoice and update their status to INVOICED
      await prisma.reconciliationLog.updateMany({
        where: { id: { in: logs.map(l => l.id) } },
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
          logsLinked: logs.length,
        },
      });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to generate batch invoices.', details: error.message });
    }
  }
}
