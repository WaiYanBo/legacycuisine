import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export interface OrderLineItemInput {
  quantity: number;
  itemName: string;
  unitPrice: number;
  totalPrice: number;
}

export interface GrabReceiptInput {
  storeIdentifier: string;
  grabOrderId: string;
  orderDate: string;
  rawSubtotal: number;
  rawDeliveryFee: number;
  rawTax: number;
  rawGrabCommission: number;
  totalCollectedByGrab: number;
  voucherBarcode?: string;
  orderLineItems: OrderLineItemInput[];
}

export class ReceiptService {
  /**
   * Ingests a raw Grab receipt, maps it to storefront/products, and creates a reconciliation log.
   * Runs in an ACID database transaction.
   */
  static async ingestGrabReceipt(data: GrabReceiptInput) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Resolve Storefront by email or name
      const storefront = await tx.storefront.findFirst({
        where: {
          OR: [
            { grabEmail: data.storeIdentifier },
            { name: data.storeIdentifier }
          ]
        }
      });

      if (!storefront) {
        throw new Error(`Storefront not registered in system: "${data.storeIdentifier}"`);
      }

      // 2. Prevent Duplicate Imports
      const existingOrder = await tx.grabOrder.findUnique({
        where: { grabOrderId: data.grabOrderId }
      });

      if (existingOrder) {
        throw new Error(`Duplicate Order: GrabOrder ID "${data.grabOrderId}" has already been processed.`);
      }

      // 3. Parse and Validate Date
      const parsedDate = new Date(data.orderDate);
      if (isNaN(parsedDate.getTime())) {
        throw new Error(`Invalid date format for orderDate: "${data.orderDate}"`);
      }

      // 4. Create the GrabOrder record
      const grabOrder = await tx.grabOrder.create({
        data: {
          storefrontId: storefront.id,
          grabOrderId: data.grabOrderId,
          grabEmail: storefront.grabEmail,
          orderDate: parsedDate,
          rawSubtotal: new Prisma.Decimal(data.rawSubtotal),
          rawDeliveryFee: new Prisma.Decimal(data.rawDeliveryFee),
          rawTax: new Prisma.Decimal(data.rawTax),
          rawGrabCommission: new Prisma.Decimal(data.rawGrabCommission),
          totalCollectedByGrab: new Prisma.Decimal(data.totalCollectedByGrab)
        }
      });

      let totalVendorPayoutSum = new Prisma.Decimal(0.00);

      // 5. Process Line Items and resolve ProductMaster reference
      for (const item of data.orderLineItems) {
        // Try finding product in storefront's menu ledger by name (case-insensitive)
        let product = await tx.productMaster.findFirst({
          where: {
            storefrontId: storefront.id,
            name: item.itemName
          }
        });

        // Dynamic product mapping if it is a new item
        if (!product) {
          const generatedSku = item.itemName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

          product = await tx.productMaster.create({
            data: {
              storefrontId: storefront.id,
              sku: generatedSku || `sku-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
              name: item.itemName,
              restaurantBasePrice: new Prisma.Decimal(item.unitPrice), // Baseline base price is the grab price charged
              grabExpectedPrice: new Prisma.Decimal(item.unitPrice),
              needsReview: true
            }
          });
        }

        // Add to total payout sum: base price * quantity
        const itemPayout = product.restaurantBasePrice.mul(item.quantity);
        totalVendorPayoutSum = totalVendorPayoutSum.add(itemPayout);

        // Record individual line item
        await tx.orderLineItem.create({
          data: {
            grabOrderId: grabOrder.id,
            productMasterId: product.id,
            quantity: item.quantity,
            grabUnitPriceCharged: new Prisma.Decimal(item.unitPrice),
            restaurantUnitPriceAtTimeOfSale: product.restaurantBasePrice
          }
        });
      }

      // 6. Calculate Reconciliation Margins
      // Client Profit = Grab Receipt Price (Subtotal) - Restaurant Base Price (totalVendorPayoutSum)
      const totalGrabAmount = new Prisma.Decimal(data.rawSubtotal);
      const clientGrossProfit = totalGrabAmount.sub(totalVendorPayoutSum);

      // Save reconciliation log record
      const reconciliationLog = await tx.reconciliationLog.create({
        data: {
          grabOrderId: grabOrder.id,
          totalGrabAmount,
          totalVendorPayout: totalVendorPayoutSum,
          clientGrossProfit,
          adjustmentAmount: new Prisma.Decimal(0.00),
          adjustmentNote: data.voucherBarcode ? `Voucher/Promo Barcode: ${data.voucherBarcode}` : null,
          status: 'PENDING'
        }
      });

      return {
        success: true,
        orderId: grabOrder.id,
        grabOrderId: grabOrder.grabOrderId,
        reconciliationLogId: reconciliationLog.id,
        totals: {
          subtotal: totalGrabAmount.toNumber(),
          vendorPayout: totalVendorPayoutSum.toNumber(),
          clientProfit: clientGrossProfit.toNumber()
        }
      };
    });
  }
}
