import { Request, Response } from 'express';
import { prisma } from '../prisma';

export class VendorController {
  /**
   * GET /api/vendors
   * Lists all vendors with storefronts and order counts.
   */
  static async getVendors(req: Request, res: Response): Promise<void> {
    try {
      const vendors = await prisma.vendor.findMany({
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

      res.status(200).json(vendors);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to retrieve vendors list.', details: error.message });
    }
  }

  /**
   * POST /api/vendors
   * Registers a new vendor/restaurant partner.
   */
  static async createVendor(req: Request, res: Response): Promise<void> {
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

      const vendor = await prisma.vendor.create({
        data: {
          name,
          businessName,
          contactEmail,
          contactPhone: contactPhone || null,
          status: 'ACTIVE',
        },
      });

      res.status(201).json({ message: 'Vendor registered successfully.', vendor });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to register vendor.', details: error.message });
    }
  }

  /**
   * POST /api/vendors/storefronts
   * Maps a new Grab storefront account linked to a vendor.
   */
  static async createStorefront(req: Request, res: Response): Promise<void> {
    try {
      const { vendorId, name, grabEmail } = req.body;

      if (!vendorId || typeof vendorId !== 'string') {
        res.status(400).json({ error: 'Missing or invalid string: "vendorId"' });
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

      // Check if vendor exists
      const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
      if (!vendor) {
        res.status(404).json({ error: `Vendor with ID "${vendorId}" not found.` });
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
          vendorId,
          name,
          grabEmail,
          isActive: true,
        },
      });

      res.status(201).json({ message: 'Storefront mapped to vendor successfully.', storefront });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create storefront link.', details: error.message });
    }
  }
}
