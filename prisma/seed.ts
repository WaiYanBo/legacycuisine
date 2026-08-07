import { prisma } from '../src/prisma';

async function main() {
  console.log('Seeding database...');

  // 1. Create a Merchant (or find existing)
  let merchant = await prisma.merchant.findFirst({
    where: { contactEmail: 'waiyan.erasb@gmail.com' },
  });

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        name: 'Wai Yan',
        businessName: 'Legacy Cuisine',
        contactEmail: 'waiyan.erasb@gmail.com',
        status: 'ACTIVE',
      },
    });
  }

  // 2. Create storefront mappings using upsert
  const storefronts = [
    { grabEmail: 'store1@domain.com', name: 'Legacy Cuisine Central' },
    { grabEmail: '112121212', name: 'Legacy Cuisine Test' },
  ];

  for (const sf of storefronts) {
    await prisma.storefront.upsert({
      where: { grabEmail: sf.grabEmail },
      update: { name: sf.name },
      create: {
        merchantId: merchant.id,
        grabEmail: sf.grabEmail,
        name: sf.name,
        isActive: true,
      },
    });
  }

  console.log('\n======================================');
  console.log('🎉 Database Seeded/Updated Successfully!');
  console.log('Registered Storefronts:');
  console.log('- store1@domain.com');
  console.log('- 112121212 (Matches PDF metadata)');
  console.log('======================================\n');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
