import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class MerchantController {
  /**
   * GET /api/merchants
   * Lists all merchants with storefronts and order counts.
   */
  static async getMerchants(req: Request, res: Response): Promise<void> {
    try {
      const merchants = await prisma.merchant.findMany({
        include: {
          storefronts: {
            include: {
              _count: {
                select: { grabOrders: true },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.status(200).json(merchants);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve merchants list.', details: error.message });
    }
  }

  /**
   * POST /api/merchants
   * Registers a new merchant/restaurant partner.
   */
  static async createMerchant(req: Request, res: Response): Promise<void> {
    try {
      const { name, businessName, contactEmail, contactPhone } = req.body;

      if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "name"' });
        return;
      }
      if (!businessName || typeof businessName !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "businessName"' });
        return;
      }
      if (!contactEmail || typeof contactEmail !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "contactEmail"' });
        return;
      }

      const merchant = await prisma.merchant.create({
        data: {
          name,
          businessName,
          contactEmail,
          contactPhone: contactPhone || null,
          status: 'ACTIVE',
        },
      });

      res.status(201).json({ message: 'Merchant registered successfully.', merchant });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to register merchant.', details: error.message });
    }
  }

  /**
   * POST /api/merchants/storefronts
   * Maps a new Grab storefront account linked to a merchant.
   */
  static async createStorefront(req: Request, res: Response): Promise<void> {
    try {
      const { merchantId, name, grabEmail } = req.body;

      if (!merchantId || typeof merchantId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "merchantId"' });
        return;
      }
      if (!name || typeof name !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "name"' });
        return;
      }
      if (!grabEmail || typeof grabEmail !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "grabEmail"' });
        return;
      }

      // Check if merchant exists
      const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } });
      if (!merchant) {
        res.status(404).json({ error: `Merchant with ID "${merchantId}" not found.` });
        return;
      }

      // Check for unique grabEmail
      const existing = await prisma.storefront.findUnique({ where: { grabEmail } });
      if (existing) {
        res.status(409).json({ error: `Storefront with Grab email "${grabEmail}" is already registered.` });
        return;
      }

      const storefront = await prisma.storefront.create({
        data: {
          merchantId,
          name,
          grabEmail,
          isActive: true,
        },
      });

      res.status(201).json({ message: 'Storefront mapped to merchant successfully.', storefront });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create storefront link.', details: error.message });
    }
  }
}
