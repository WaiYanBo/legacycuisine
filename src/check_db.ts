import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('\n==================================================');
  console.log('🔍 QUERYING LOCAL SQLITE DATABASE');
  console.log('==================================================\n');

  // 1. Fetch Storefronts and Orders (including productMaster to get names)
  const storefronts = await prisma.storefront.findMany({
    include: {
      grabOrders: {
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

  console.log('--- 🏪 REGISTERED STOREFRONTS & ORDERS ---');
  for (const sf of storefronts) {
    console.log(`\nStorefront: ${sf.name} (${sf.grabEmail})`);
    console.log(`Orders Ingested: ${sf.grabOrders.length}`);
    
    for (const order of sf.grabOrders) {
      console.log(`  - 📝 Order ID: ${order.grabOrderId}`);
      console.log(`    Date:      ${order.orderDate.toISOString().split('T')[0]}`);
      console.log(`    Subtotal:  MYR ${order.rawSubtotal}`);
      console.log(`    Tax (SST): MYR ${order.rawTax}`);
      console.log(`    Total:     MYR ${order.totalCollectedByGrab}`);
      console.log(`    Items:`);
      for (const item of order.orderLineItems) {
        console.log(`      * ${item.quantity}x ${item.productMaster.name} (MYR ${item.grabUnitPriceCharged})`);
      }
    }
  }

  // 2. Fetch Flagged Products needing Price Review
  const flaggedProducts = await prisma.productMaster.findMany({
    where: { needsReview: true },
  });

  console.log('\n\n--- ⚠️ PRODUCTS REQUIRING PRICE REVIEW ---');
  if (flaggedProducts.length === 0) {
    console.log('No products currently need review. All base prices set!');
  } else {
    console.log(`Found ${flaggedProducts.length} new items needing restaurantBasePrice:`);
    for (const prod of flaggedProducts) {
      console.log(`  * [Flagged] Item Name: "${prod.name}" (SKU: ${prod.sku})`);
    }
    console.log('\n💡 These items were auto-created because they were seen for the first time.');
    console.log('Admins can now set their base price in the dashboard.');
  }

  console.log('\n==================================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
