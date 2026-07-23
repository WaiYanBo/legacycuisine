import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';

const adapter = new PrismaLibSql({
  url: 'file:dev.db',
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding local SQLite database...');

  // 1. Create a local Vendor
  const vendor = await prisma.vendor.create({
    data: {
      name: 'Wai Yan',
      businessName: 'Legacy Cuisine',
      contactEmail: 'waiyan.erasb@gmail.com',
      status: 'ACTIVE',
    },
  });

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
        vendorId: vendor.id,
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
