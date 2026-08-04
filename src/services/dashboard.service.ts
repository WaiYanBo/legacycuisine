import { prisma } from '../prisma';
import { Prisma } from '@prisma/client';

export class DashboardService {
  /**
   * Fetches gross revenue, payouts, net profits, and data points for the dashboard chart.
   */
  static async getMetrics(range: string) {
    const now = new Date();
    let startDate = new Date();

    switch (range.toLowerCase()) {
      case 'daily':
        startDate.setHours(0, 0, 0, 0); // Start of today
        break;
      case 'weekly':
        startDate.setDate(now.getDate() - 7); // 7 days ago
        break;
      case 'yearly':
        startDate.setDate(now.getDate() - 365); // 365 days ago
        break;
      case 'all':
        startDate = new Date(0); // Beginning of UNIX epoch (all-time)
        break;
      case 'monthly':
      default:
        startDate.setDate(now.getDate() - 30); // 30 days ago
        break;
    }

    // Query reconciliation logs within the timeframe
    const logs = await prisma.reconciliationLog.findMany({
      where: {
        grabOrder: {
          orderDate: {
            gte: startDate,
          },
        },
      },
      include: {
        grabOrder: {
          include: {
            storefront: true,
          },
        },
      },
    });

    let totalRevenue = new Prisma.Decimal(0.00);
    let totalPayouts = new Prisma.Decimal(0.00);
    let netProfit = new Prisma.Decimal(0.00);

    const groups: Record<string, { vendorPayouts: number; clientProfit: number }> = {};
    const storefrontGroups: Record<string, { name: string; email: string; revenue: number; payout: number; profit: number; count: number }> = {};

    for (const log of logs) {
      // Metrics totals
      totalRevenue = totalRevenue.add(log.totalGrabAmount);
      totalPayouts = totalPayouts.add(log.totalVendorPayout);
      netProfit = netProfit.add(log.clientGrossProfit);

      // Group chart data points by order date (YYYY-MM-DD)
      const dateStr = log.grabOrder.orderDate.toISOString().split('T')[0];
      if (!groups[dateStr]) {
        groups[dateStr] = { vendorPayouts: 0.00, clientProfit: 0.00 };
      }
      groups[dateStr].vendorPayouts += log.totalVendorPayout.toNumber();
      groups[dateStr].clientProfit += log.clientGrossProfit.toNumber();

      // Group by storefront performance
      const sf = log.grabOrder.storefront;
      if (sf) {
        if (!storefrontGroups[sf.id]) {
          storefrontGroups[sf.id] = {
            name: sf.name,
            email: sf.grabEmail,
            revenue: 0,
            payout: 0,
            profit: 0,
            count: 0
          };
        }
        storefrontGroups[sf.id].revenue += log.totalGrabAmount.toNumber();
        storefrontGroups[sf.id].payout += log.totalVendorPayout.toNumber();
        storefrontGroups[sf.id].profit += log.clientGrossProfit.toNumber();
        storefrontGroups[sf.id].count += 1;
      }
    }

    const chartData = Object.entries(groups).map(([date, vals]) => ({
      date,
      vendorPayouts: Number(vals.vendorPayouts.toFixed(2)),
      clientProfit: Number(vals.clientProfit.toFixed(2)),
    })).sort((a, b) => a.date.localeCompare(b.date));

    const storefrontsPerformance = Object.values(storefrontGroups).map(sf => ({
      name: sf.name,
      email: sf.email,
      revenue: Number(sf.revenue.toFixed(2)),
      payout: Number(sf.payout.toFixed(2)),
      profit: Number(sf.profit.toFixed(2)),
      count: sf.count
    }));

    return {
      totalRevenue: Number(totalRevenue.toFixed(2)),
      totalPayouts: Number(totalPayouts.toFixed(2)),
      netProfit: Number(netProfit.toFixed(2)),
      chartData,
      storefrontsPerformance,
    };
  }

  /**
   * Fetches all products requiring restaurant base price updates.
   */
  static async getNeedsReview() {
    return await prisma.productMaster.findMany({
      where: { needsReview: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Updates base price of a product, resolves needsReview status, and re-calculates pending orders.
   * Runs in an ACID database transaction.
   */
  static async updateProductBasePrice(productId: string, basePrice: number) {
    return await prisma.$transaction(async (tx: any) => {
      // 1. Update the price mapping in the product ledger
      const product = await tx.productMaster.update({
        where: { id: productId },
        data: {
          restaurantBasePrice: new Prisma.Decimal(basePrice),
          needsReview: false,
        },
      });

      // 2. Locate all PENDING reconciliation logs referencing this product
      const pendingLogs = await tx.reconciliationLog.findMany({
        where: {
          status: 'PENDING',
          grabOrder: {
            orderLineItems: {
              some: {
                productMasterId: product.id,
              },
            },
          },
        },
        include: {
          grabOrder: {
            include: {
              orderLineItems: {
                include: {
                  productMaster: true,
                },
              },
            },
          },
        },
      });

      // 3. Re-reconcile logs dynamically
      for (const log of pendingLogs) {
        // Update price charged for this product at sale time
        await tx.orderLineItem.updateMany({
          where: {
            grabOrderId: log.grabOrderId,
            productMasterId: product.id,
          },
          data: {
            restaurantUnitPriceAtTimeOfSale: new Prisma.Decimal(basePrice),
          },
        });

        // Pull fresh values to re-compute totals
        const lineItems = await tx.orderLineItem.findMany({
          where: { grabOrderId: log.grabOrderId },
          include: { productMaster: true },
        });

        let totalVendorPayoutSum = new Prisma.Decimal(0.00);
        let orderStillNeedsReview = false;

        for (const item of lineItems) {
          // Resolve current base price mapping
          const itemPrice = item.productMasterId === product.id
            ? new Prisma.Decimal(basePrice)
            : item.restaurantUnitPriceAtTimeOfSale;

          totalVendorPayoutSum = totalVendorPayoutSum.add(itemPrice.mul(item.quantity));

          // If the order contains other products that still need base price review
          if (item.productMasterId !== product.id && item.productMaster.needsReview) {
            orderStillNeedsReview = true;
          }
        }

        const totalGrabAmount = log.totalGrabAmount;
        const clientGrossProfit = totalGrabAmount.sub(totalVendorPayoutSum);
        const newStatus = orderStillNeedsReview ? 'PENDING' : 'RECONCILED';

        // Update the transaction log
        await tx.reconciliationLog.update({
          where: { id: log.id },
          data: {
            totalVendorPayout: totalVendorPayoutSum,
            clientGrossProfit,
            status: newStatus,
          },
        });
      }

      return product;
    });
  }
}
