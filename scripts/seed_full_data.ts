import { prisma } from '../src/prisma';
import { hashPassword } from '../src/utils/security';
import { Prisma } from '@prisma/client';

async function seedComprehensiveData() {
  console.log('🚀 Starting comprehensive database seeding for Legacy Cuisine...');

  // -------------------------------------------------------------
  // 1. USERS & ACCESS CONTROL (RBAC)
  // -------------------------------------------------------------
  console.log('👤 Seeding System Users & Roles...');
  
  const superAdminPassword = hashPassword('Hahaha123!');
  const staffPassword = hashPassword('Password2026!');

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { passwordHash: superAdminPassword, isActive: true },
    create: {
      username: 'admin',
      fullName: 'Wai Yan Bo',
      email: 'admin@legacycuisine.com',
      passwordHash: superAdminPassword,
      department: 'IT & Systems Administration',
      position: 'IT Lead & Platform Administrator',
      role: 'SUPER_ADMIN',
      permissions: JSON.stringify([
        'admin:all',
        'dashboard:view',
        'analytics:view',
        'reconciliation:process',
        'invoices:generate',
        'products:edit',
        'forms:submit',
        'forms:review',
        'users:manage'
      ]),
      isActive: true,
    },
  });

  const managerUser = await prisma.user.upsert({
    where: { username: 'siti_finance' },
    update: { passwordHash: staffPassword, isActive: true },
    create: {
      username: 'siti_finance',
      fullName: 'Siti Nurhaliza binti Kamaruddin',
      email: 'siti.finance@legacycuisine.com',
      passwordHash: staffPassword,
      department: 'Finance & Accounts',
      position: 'Finance & Accounts Manager',
      role: 'MANAGER',
      permissions: JSON.stringify([
        'dashboard:view',
        'analytics:view',
        'reconciliation:process',
        'invoices:generate',
        'products:edit',
        'forms:review'
      ]),
      isActive: true,
    },
  });

  const staffUser = await prisma.user.upsert({
    where: { username: 'kitchen_lead' },
    update: { passwordHash: staffPassword, isActive: true },
    create: {
      username: 'kitchen_lead',
      fullName: 'Ahmad Zaki bin Othman',
      email: 'zaki@legacycuisine.com',
      passwordHash: staffPassword,
      department: 'Operations & Reconciliation',
      position: 'Central Kitchen Operations Lead',
      role: 'STAFF',
      permissions: JSON.stringify([
        'dashboard:view',
        'forms:submit'
      ]),
      isActive: true,
    },
  });

  const agentUser = await prisma.user.upsert({
    where: { username: 'agent_faizal' },
    update: { passwordHash: staffPassword, isActive: true },
    create: {
      username: 'agent_faizal',
      fullName: 'Faizal bin Mohamad Radzi',
      email: 'faizal.agent@legacycuisine.com',
      passwordHash: staffPassword,
      department: 'Field Recruitment',
      position: 'Senior Merchant Acquisition Agent',
      role: 'AGENT',
      permissions: JSON.stringify([
        'forms:submit'
      ]),
      isActive: true,
    },
  });

  // -------------------------------------------------------------
  // 2. MERCHANTS & STOREFRONTS
  // -------------------------------------------------------------
  console.log('🏪 Seeding Merchants & Storefronts...');

  // Merchant 1: Central flagship
  let merchantCentral = await prisma.merchant.findFirst({
    where: { contactEmail: 'waiyan.erasb@gmail.com' }
  });
  if (!merchantCentral) {
    merchantCentral = await prisma.merchant.create({
      data: {
        name: 'Wai Yan',
        businessName: 'Legacy Cuisine Group Sdn Bhd',
        contactEmail: 'waiyan.erasb@gmail.com',
        contactPhone: '+60 12-345 6789',
        status: 'ACTIVE',
      }
    });
  }

  // Merchant 2: Damansara
  let merchantDamansara = await prisma.merchant.findFirst({
    where: { contactEmail: 'selerakampung@gmail.com' }
  });
  if (!merchantDamansara) {
    merchantDamansara = await prisma.merchant.create({
      data: {
        name: 'Haji Razak bin Bakar',
        businessName: 'Restoran Selera Kampung Melayu',
        contactEmail: 'selerakampung@gmail.com',
        contactPhone: '+60 19-334 5671',
        status: 'ACTIVE',
      }
    });
  }

  // Merchant 3: Penang Heritage
  let merchantPenang = await prisma.merchant.findFirst({
    where: { contactEmail: 'heritage@legacycuisine.com' }
  });
  if (!merchantPenang) {
    merchantPenang = await prisma.merchant.create({
      data: {
        name: 'Tan Kim Hock',
        businessName: 'Heritage Flavours Sdn Bhd',
        contactEmail: 'heritage@legacycuisine.com',
        contactPhone: '+60 16-882 1920',
        status: 'ACTIVE',
      }
    });
  }

  // Storefronts
  const sf1 = await prisma.storefront.upsert({
    where: { grabEmail: 'store1@domain.com' },
    update: { name: 'Legacy Cuisine Central (KL)' },
    create: {
      merchantId: merchantCentral.id,
      grabEmail: 'store1@domain.com',
      name: 'Legacy Cuisine Central (KL)',
      isActive: true,
    }
  });

  const sf2 = await prisma.storefront.upsert({
    where: { grabEmail: '112121212' },
    update: { name: 'Legacy Cuisine Test Store' },
    create: {
      merchantId: merchantCentral.id,
      grabEmail: '112121212',
      name: 'Legacy Cuisine Test Store',
      isActive: true,
    }
  });

  const sf3 = await prisma.storefront.upsert({
    where: { grabEmail: 'damansara@legacycuisine.com' },
    update: { name: 'Legacy Cuisine Damansara Uptown' },
    create: {
      merchantId: merchantDamansara.id,
      grabEmail: 'damansara@legacycuisine.com',
      name: 'Legacy Cuisine Damansara Uptown',
      isActive: true,
    }
  });

  const sf4 = await prisma.storefront.upsert({
    where: { grabEmail: 'penang@legacycuisine.com' },
    update: { name: 'Heritage Kitchen Georgetown' },
    create: {
      merchantId: merchantPenang.id,
      grabEmail: 'penang@legacycuisine.com',
      name: 'Heritage Kitchen Georgetown',
      isActive: true,
    }
  });

  // -------------------------------------------------------------
  // 3. PRODUCT MASTER & PRICE LEDGER
  // -------------------------------------------------------------
  console.log('🏷️ Seeding Product Masters & Price Ledgers...');

  const productsDef = [
    // sf1: Legacy Cuisine Central
    { sfId: sf1.id, sku: 'legacy-nasi-lemak-deluxe', name: 'Legacy Nasi Lemak Deluxe', base: 12.00, grab: 16.50, review: false },
    { sfId: sf1.id, sku: 'special-hainanese-chicken-rice', name: 'Special Hainanese Chicken Rice', base: 13.50, grab: 18.00, review: false },
    { sfId: sf1.id, sku: 'fresh-iced-pandan-tea', name: 'Fresh Iced Pandan Tea', base: 3.50, grab: 5.50, review: false },
    { sfId: sf1.id, sku: 'iced-teh-tarik-kaw', name: 'Iced Teh Tarik Kaw', base: 3.00, grab: 5.00, review: false },
    { sfId: sf1.id, sku: 'heritage-curry-laksa', name: 'Heritage Curry Laksa', base: 12.50, grab: 17.00, review: false },
    // Flagged items needing review (for testing Action Required banner)
    { sfId: sf1.id, sku: 'signature-rendang-tok-beef-bowl', name: 'Signature Rendang Tok Beef Bowl', base: 18.00, grab: 24.00, review: true },
    { sfId: sf1.id, sku: 'salted-egg-calamari-platter', name: 'Salted Egg Calamari Platter', base: 16.00, grab: 22.50, review: true },

    // sf3: Damansara
    { sfId: sf3.id, sku: 'nasi-lemak-ayam-berempah-damansara', name: 'Nasi Lemak Ayam Berempah', base: 10.50, grab: 15.00, review: false },
    { sfId: sf3.id, sku: 'mee-rebus-utara', name: 'Mee Rebus Utara', base: 9.00, grab: 13.50, review: false },
    { sfId: sf3.id, sku: 'cendol-durian-special', name: 'Cendol Durian Special', base: 6.00, grab: 9.50, review: false },

    // sf4: Penang
    { sfId: sf4.id, sku: 'penang-char-kway-teow-special', name: 'Penang Char Kway Teow Special', base: 11.50, grab: 16.50, review: false },
    { sfId: sf4.id, sku: 'asam-laksa-kaw', name: 'Asam Laksa Kaw Penang', base: 10.00, grab: 15.00, review: false },
    { sfId: sf4.id, sku: 'kopi-o-beng', name: 'Kopi O Beng Tradisional', base: 3.00, grab: 4.50, review: false },
  ];

  const productMap = new Map<string, any>();

  for (const p of productsDef) {
    const record = await prisma.productMaster.upsert({
      where: {
        storefrontId_sku: {
          storefrontId: p.sfId,
          sku: p.sku
        }
      },
      update: {
        name: p.name,
        restaurantBasePrice: new Prisma.Decimal(p.base),
        grabExpectedPrice: new Prisma.Decimal(p.grab),
        needsReview: p.review
      },
      create: {
        storefrontId: p.sfId,
        sku: p.sku,
        name: p.name,
        restaurantBasePrice: new Prisma.Decimal(p.base),
        grabExpectedPrice: new Prisma.Decimal(p.grab),
        needsReview: p.review
      }
    });
    productMap.set(`${p.sfId}:${p.name}`, record);
  }

  // -------------------------------------------------------------
  // 4. GRAB ORDERS ACROSS DIFFERENT DATES (HISTORICAL & CURRENT)
  // -------------------------------------------------------------
  console.log('📦 Seeding Historical Orders across multiple dates...');

  // Multi-day order matrix (Aug 15, 2026 to Sep 15, 2026)
  const orderBatches = [
    // Date: 18/08/2026
    {
      date: new Date('2026-08-18T12:15:00Z'),
      storefront: sf1,
      orders: [
        {
          grabOrderId: 'GF-20260818-001',
          deliveryFee: 4.00,
          grabCommission: 13.00,
          items: [
            { name: 'Legacy Nasi Lemak Deluxe', qty: 2, unitPrice: 16.50 },
            { name: 'Fresh Iced Pandan Tea', qty: 2, unitPrice: 5.50 }
          ]
        },
        {
          grabOrderId: 'GF-20260818-002',
          deliveryFee: 5.00,
          grabCommission: 10.80,
          items: [
            { name: 'Special Hainanese Chicken Rice', qty: 2, unitPrice: 18.00 }
          ]
        }
      ]
    },
    // Date: 20/08/2026
    {
      date: new Date('2026-08-20T13:30:00Z'),
      storefront: sf1,
      orders: [
        {
          grabOrderId: 'GF-20260820-001',
          deliveryFee: 4.50,
          grabCommission: 17.50,
          items: [
            { name: 'Heritage Curry Laksa', qty: 3, unitPrice: 17.00 },
            { name: 'Iced Teh Tarik Kaw', qty: 3, unitPrice: 5.00 }
          ]
        }
      ]
    },
    // Date: 23/08/2026
    {
      date: new Date('2026-08-23T19:00:00Z'),
      storefront: sf3,
      orders: [
        {
          grabOrderId: 'GF-20260823-001',
          deliveryFee: 4.00,
          grabCommission: 14.50,
          items: [
            { name: 'Nasi Lemak Ayam Berempah', qty: 3, unitPrice: 15.00 },
            { name: 'Cendol Durian Special', qty: 2, unitPrice: 9.50 }
          ]
        },
        {
          grabOrderId: 'GF-20260823-002',
          deliveryFee: 3.50,
          grabCommission: 8.10,
          items: [
            { name: 'Mee Rebus Utara', qty: 2, unitPrice: 13.50 }
          ]
        }
      ]
    },
    // Date: 27/08/2026
    {
      date: new Date('2026-08-27T12:45:00Z'),
      storefront: sf4,
      orders: [
        {
          grabOrderId: 'GF-20260827-001',
          deliveryFee: 4.00,
          grabCommission: 12.60,
          items: [
            { name: 'Penang Char Kway Teow Special', qty: 2, unitPrice: 16.50 },
            { name: 'Kopi O Beng Tradisional', qty: 2, unitPrice: 4.50 }
          ]
        },
        {
          grabOrderId: 'GF-20260827-002',
          deliveryFee: 5.00,
          grabCommission: 15.00,
          items: [
            { name: 'Asam Laksa Kaw Penang', qty: 3, unitPrice: 15.00 },
            { name: 'Kopi O Beng Tradisional', qty: 3, unitPrice: 4.50 }
          ]
        }
      ]
    },
    // Date: 31/08/2026 (Merdeka Holiday Peak)
    {
      date: new Date('2026-08-31T12:00:00Z'),
      storefront: sf1,
      orders: [
        {
          grabOrderId: 'GF-20260831-001',
          deliveryFee: 5.50,
          grabCommission: 24.00,
          items: [
            { name: 'Legacy Nasi Lemak Deluxe', qty: 4, unitPrice: 16.50 },
            { name: 'Heritage Curry Laksa', qty: 2, unitPrice: 17.00 },
            { name: 'Fresh Iced Pandan Tea', qty: 4, unitPrice: 5.50 }
          ]
        },
        {
          grabOrderId: 'GF-20260831-002',
          deliveryFee: 4.00,
          grabCommission: 16.20,
          items: [
            { name: 'Special Hainanese Chicken Rice', qty: 3, unitPrice: 18.00 }
          ]
        }
      ]
    },
    // Date: 03/09/2026
    {
      date: new Date('2026-09-03T18:15:00Z'),
      storefront: sf3,
      orders: [
        {
          grabOrderId: 'GF-20260903-001',
          deliveryFee: 4.50,
          grabCommission: 18.00,
          items: [
            { name: 'Nasi Lemak Ayam Berempah', qty: 4, unitPrice: 15.00 }
          ]
        }
      ]
    },
    // Date: 07/09/2026
    {
      date: new Date('2026-09-07T12:20:00Z'),
      storefront: sf1,
      orders: [
        {
          grabOrderId: 'GF-20260907-001',
          deliveryFee: 4.00,
          grabCommission: 14.80,
          items: [
            { name: 'Legacy Nasi Lemak Deluxe', qty: 2, unitPrice: 16.50 },
            { name: 'Special Hainanese Chicken Rice', qty: 1, unitPrice: 18.00 },
            { name: 'Fresh Iced Pandan Tea', qty: 2, unitPrice: 5.50 }
          ]
        }
      ]
    },
    // Date: 10/09/2026
    {
      date: new Date('2026-09-10T13:00:00Z'),
      storefront: sf4,
      orders: [
        {
          grabOrderId: 'GF-20260910-001',
          deliveryFee: 4.00,
          grabCommission: 18.90,
          items: [
            { name: 'Penang Char Kway Teow Special', qty: 3, unitPrice: 16.50 },
            { name: 'Asam Laksa Kaw Penang', qty: 2, unitPrice: 15.00 },
            { name: 'Kopi O Beng Tradisional', qty: 3, unitPrice: 4.50 }
          ]
        }
      ]
    },
    // Date: 12/09/2026
    {
      date: new Date('2026-09-12T19:30:00Z'),
      storefront: sf1,
      orders: [
        {
          grabOrderId: 'GF-20260912-001',
          deliveryFee: 5.00,
          grabCommission: 21.00,
          items: [
            { name: 'Legacy Nasi Lemak Deluxe', qty: 3, unitPrice: 16.50 },
            { name: 'Heritage Curry Laksa', qty: 2, unitPrice: 17.00 },
            { name: 'Iced Teh Tarik Kaw', qty: 4, unitPrice: 5.00 }
          ]
        }
      ]
    },
    // Date: 14/09/2026
    {
      date: new Date('2026-09-14T12:45:00Z'),
      storefront: sf3,
      orders: [
        {
          grabOrderId: 'GF-20260914-001',
          deliveryFee: 4.50,
          grabCommission: 17.10,
          items: [
            { name: 'Nasi Lemak Ayam Berempah', qty: 3, unitPrice: 15.00 },
            { name: 'Cendol Durian Special', qty: 3, unitPrice: 9.50 }
          ]
        }
      ]
    },
    // Date: 15/09/2026 (TODAY)
    {
      date: new Date('2026-09-15T08:30:00Z'),
      storefront: sf1,
      orders: [
        {
          grabOrderId: 'GF-20260915-001',
          deliveryFee: 4.00,
          grabCommission: 15.60,
          items: [
            { name: 'Legacy Nasi Lemak Deluxe', qty: 2, unitPrice: 16.50 },
            { name: 'Special Hainanese Chicken Rice', qty: 2, unitPrice: 18.00 },
            { name: 'Fresh Iced Pandan Tea', qty: 2, unitPrice: 5.50 }
          ]
        },
        {
          grabOrderId: 'GF-20260915-002',
          deliveryFee: 4.50,
          grabCommission: 13.50,
          items: [
            { name: 'Heritage Curry Laksa', qty: 2, unitPrice: 17.00 },
            { name: 'Iced Teh Tarik Kaw', qty: 3, unitPrice: 5.00 }
          ]
        }
      ]
    }
  ];

  let orderCount = 0;
  for (const batch of orderBatches) {
    for (const ord of batch.orders) {
      let rawSubtotal = new Prisma.Decimal(0.00);
      let totalMerchantPayout = new Prisma.Decimal(0.00);

      // Compute subtotal and payout
      const lineItemsPrepared: any[] = [];
      for (const itm of ord.items) {
        const prod = productMap.get(`${batch.storefront.id}:${itm.name}`);
        if (!prod) continue;
        const itmSubtotal = new Prisma.Decimal(itm.unitPrice).mul(itm.qty);
        const itmPayout = prod.restaurantBasePrice.mul(itm.qty);
        rawSubtotal = rawSubtotal.add(itmSubtotal);
        totalMerchantPayout = totalMerchantPayout.add(itmPayout);

        lineItemsPrepared.push({
          productMasterId: prod.id,
          quantity: itm.qty,
          grabUnitPriceCharged: new Prisma.Decimal(itm.unitPrice),
          restaurantUnitPriceAtTimeOfSale: prod.restaurantBasePrice,
        });
      }

      const clientGrossProfit = rawSubtotal.sub(totalMerchantPayout);
      const totalCollectedByGrab = rawSubtotal.add(new Prisma.Decimal(ord.deliveryFee));

      // Upsert GrabOrder
      const grabOrder = await prisma.grabOrder.upsert({
        where: { grabOrderId: ord.grabOrderId },
        update: {
          orderDate: batch.date,
          rawSubtotal,
          rawDeliveryFee: new Prisma.Decimal(ord.deliveryFee),
          rawGrabCommission: new Prisma.Decimal(ord.grabCommission),
          totalCollectedByGrab,
        },
        create: {
          storefrontId: batch.storefront.id,
          grabOrderId: ord.grabOrderId,
          grabEmail: batch.storefront.grabEmail,
          orderDate: batch.date,
          rawSubtotal,
          rawDeliveryFee: new Prisma.Decimal(ord.deliveryFee),
          rawGrabCommission: new Prisma.Decimal(ord.grabCommission),
          totalCollectedByGrab,
        }
      });

      // Clear & recreate line items
      await prisma.orderLineItem.deleteMany({ where: { grabOrderId: grabOrder.id } });
      for (const lip of lineItemsPrepared) {
        await prisma.orderLineItem.create({
          data: {
            grabOrderId: grabOrder.id,
            productMasterId: lip.productMasterId,
            quantity: lip.quantity,
            grabUnitPriceCharged: lip.grabUnitPriceCharged,
            restaurantUnitPriceAtTimeOfSale: lip.restaurantUnitPriceAtTimeOfSale,
          }
        });
      }

      // Reconciliation Log
      await prisma.reconciliationLog.upsert({
        where: { grabOrderId: grabOrder.id },
        update: {
          totalGrabAmount: rawSubtotal,
          totalMerchantPayout,
          clientGrossProfit,
          status: 'RECONCILED'
        },
        create: {
          grabOrderId: grabOrder.id,
          totalGrabAmount: rawSubtotal,
          totalMerchantPayout,
          clientGrossProfit,
          status: 'RECONCILED'
        }
      });

      orderCount++;
    }
  }

  console.log(`✅ Ingested and reconciled ${orderCount} historical orders across 11 distinct dates!`);

  // -------------------------------------------------------------
  // 5. INVOICES
  // -------------------------------------------------------------
  console.log('🧾 Seeding Invoices...');

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-202608-001' },
    update: { status: 'PAID' },
    create: {
      merchantId: merchantCentral.id,
      invoiceNumber: 'INV-202608-001',
      billingDate: new Date('2026-08-31T23:59:59Z'),
      status: 'PAID',
    }
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-202609-002' },
    update: { status: 'SENT' },
    create: {
      merchantId: merchantCentral.id,
      invoiceNumber: 'INV-202609-002',
      billingDate: new Date('2026-09-15T23:59:59Z'),
      status: 'SENT',
    }
  });

  await prisma.invoice.upsert({
    where: { invoiceNumber: 'INV-202609-003' },
    update: { status: 'DRAFT' },
    create: {
      merchantId: merchantDamansara.id,
      invoiceNumber: 'INV-202609-003',
      billingDate: new Date('2026-09-15T23:59:59Z'),
      status: 'DRAFT',
    }
  });

  // -------------------------------------------------------------
  // 6. BORANG PENDAFTARAN EJEN (AGENT REGISTRATIONS)
  // -------------------------------------------------------------
  console.log('📋 Seeding Agent Registration forms...');

  const sampleMerchantsList1 = [
    { name: 'Restoran Selera Kampung Warisan', pic: 'Haji Razak bin Bakar', phone: '+60 19-334 5671', address: 'No 12, Jalan SS15/4D, Subang Jaya', cuisine: 'Masakan Melayu' },
    { name: 'Mee Tarik Jalan Sultan', pic: 'Chen Wei Loon', phone: '+60 16-228 9012', address: 'Lot 4, Jalan Sultan, KL', cuisine: 'Mee Tarik Segar' },
    { name: 'Nasi Kandar Subang Royale', pic: 'Mohamed Farook', phone: '+60 17-445 1209', address: 'No 85, Jalan USJ 10/1E, Subang Jaya', cuisine: 'Nasi Kandar' },
    { name: 'Dapur Nenek Salbiah', pic: 'Salbiah binti Hashim', phone: '+60 13-901 8843', address: 'Gerai 3, Medan Selera Seksyen 7, Shah Alam', cuisine: 'Lauk Kampung' },
    { name: 'Heritage Hainan Coffee & Toast', pic: 'Tan Kim Hock', phone: '+60 12-663 4519', address: 'No 18, Jalan Petaling, KL', cuisine: 'Kopi & Roti Bakar' }
  ];

  await prisma.agentRegistration.create({
    data: {
      date: new Date('2026-09-05T09:00:00Z'),
      agentNo: 'AGT-2026-008',
      agentName: 'Faizal bin Mohamad Radzi',
      icNumber: '910824-10-5471',
      race: 'Melayu',
      religion: 'Islam',
      address: 'No 28, Jalan Pinggiran USJ 2/3, 47600 Subang Jaya, Selangor',
      phoneNumber: '+60 12-892 3411',
      bankName: 'Malayan Banking Berhad (Maybank)',
      bankAccountName: 'Faizal bin Mohamad Radzi',
      bankAccountNumber: '164012984532',
      registeredMerchants: JSON.stringify(sampleMerchantsList1),
      prospectSource: 'Rujukan Pelanggan',
      approachedByOtherAgents: 'Ya, tetapi belum berdaftar',
      confidenceLevel: 'Tinggi',
      estimatedDuration: '1-2 Minggu',
      agentSignatureDate: new Date('2026-09-05T10:00:00Z'),
      supervisorName: 'Wai Yan Bo',
      supervisorDate: new Date('2026-09-06T14:30:00Z'),
    }
  });

  const sampleMerchantsList2 = [
    { name: 'Warisan Nasi Kukus Ayam Dara', pic: 'Amirul Hakim', phone: '+60 18-912 3001', address: 'No 5, Jalan Radin Bagus, Sri Petaling', cuisine: 'Nasi Kukus' },
    { name: 'Kopitiam Ah Kow 1958', pic: 'Kow Chee Meng', phone: '+60 12-384 9901', address: 'No 22, Jalan Pasar, Pudu', cuisine: 'Kopitiam Tradisional' },
    { name: 'Sate Kajang Pak Din', pic: 'Kamaruddin Din', phone: '+60 19-204 8812', address: 'Lot 10, Jalan Reko, Kajang', cuisine: 'Sate' },
    { name: 'Restoran Ikan Bakar Bellamy', pic: 'Norzila Aziz', phone: '+60 13-774 2190', address: 'Medan Ikan Bakar Jalan Bellamy, KL', cuisine: 'Ikan Bakar' },
    { name: 'Uncle Lim Hainan Delights', pic: 'Lim Guan Hock', phone: '+60 16-554 8123', address: 'No 45, Jalan Telawi 3, Bangsar', cuisine: 'Hainanese Food' }
  ];

  await prisma.agentRegistration.create({
    data: {
      date: new Date('2026-09-12T11:30:00Z'),
      agentNo: 'AGT-2026-015',
      agentName: 'Siti Sarah binti Yusoff',
      icNumber: '940315-14-6022',
      race: 'Melayu',
      religion: 'Islam',
      address: 'B-12-05, Residensi Kerinchi, Bangsar South, 59200 Kuala Lumpur',
      phoneNumber: '+60 17-642 9811',
      bankName: 'CIMB Bank Berhad',
      bankAccountName: 'Siti Sarah binti Yusoff',
      bankAccountNumber: '705412984012',
      registeredMerchants: JSON.stringify(sampleMerchantsList2),
      prospectSource: 'Media Sosial & WhatsApp',
      approachedByOtherAgents: 'Tidak',
      confidenceLevel: 'Sangat Tinggi',
      estimatedDuration: 'Kurang 1 Minggu',
      agentSignatureDate: new Date('2026-09-12T12:00:00Z'),
      supervisorName: 'Wai Yan Bo',
      supervisorDate: new Date('2026-09-13T09:00:00Z'),
    }
  });

  // -------------------------------------------------------------
  // 7. BORANG PENDAFTARAN PENIAGA (MERCHANT REGISTRATIONS)
  // -------------------------------------------------------------
  console.log('📝 Seeding Business Registrations (Borang Peniaga)...');

  await prisma.businessRegistration.create({
    data: {
      date: new Date('2026-09-02T10:00:00Z'),
      memberNo: 'LC-MBR-2026-001',
      fullName: 'Haji Razak bin Bakar',
      businessName: 'Restoran Selera Kampung Warisan Sdn Bhd',
      registrationNo: '202401039821-M',
      icPassportNo: '760412-10-5329',
      dateOfBirth: '12/04/1976',
      age: '50',
      gender: 'Lelaki',
      race: 'Melayu',
      religion: 'Islam',
      nationality: 'Warganegara Malaysia',
      contactNumber: '+60 19-334 5671',
      emailAddress: 'warisankampung.ss15@gmail.com',
      storeAddress: 'No 12, Ground Floor, Jalan SS15/4D, 47500 Subang Jaya, Selangor',
      mailingAddress: 'No 12, Ground Floor, Jalan SS15/4D, 47500 Subang Jaya, Selangor',
      operatingDays: 'Isnin hingga Sabtu (Ahad Tutup)',
      operatingHours: '08:00 - 22:00',
      typeOfFood: 'Masakan Melayu Kampung, Lauk Campur, Mee Kari & Minuman',
      bankName: 'CIMB Bank Berhad',
      bankAccountName: 'Restoran Selera Kampung Warisan Sdn Bhd',
      bankAccountNumber: '800923451298',
      documentsChecklist: JSON.stringify({
        icCopy: true,
        ssmCopy: true,
        bankStatement: true,
        shopPhoto: true,
        typhoidCert: true
      }),
      receivedDate: new Date('2026-09-02T14:00:00Z'),
      processingOfficer: 'Siti Nurhaliza',
      status: 'Diluluskan',
      activationDate: new Date('2026-09-04T08:00:00Z'),
      agreedToTerms: true,
      merchantSignatureName: 'Haji Razak bin Bakar',
      merchantSignatureIc: '760412-10-5329',
      merchantSignatureDate: new Date('2026-09-02T11:00:00Z'),
      agentSignatureName: 'Faizal bin Mohamad Radzi',
      agentSignatureId: 'AGT-2026-008',
      agentSignatureDate: new Date('2026-09-02T11:30:00Z'),
      reviewerName: 'Siti Nurhaliza',
      reviewerRole: 'Senior Officer',
      reviewerDate: new Date('2026-09-03T15:00:00Z'),
      approverName: 'Wai Yan Bo',
      approverRole: 'Operations Director',
      approverDate: new Date('2026-09-04T08:30:00Z'),
    }
  });

  await prisma.businessRegistration.create({
    data: {
      date: new Date('2026-09-10T14:20:00Z'),
      memberNo: 'LC-MBR-2026-002',
      fullName: 'Chen Wei Loon',
      businessName: 'Mee Tarik Jalan Sultan Enterprise',
      registrationNo: '002938411-V',
      icPassportNo: '880620-14-5109',
      dateOfBirth: '20/06/1988',
      age: '38',
      gender: 'Lelaki',
      race: 'Cina',
      religion: 'Buddha',
      nationality: 'Warganegara Malaysia',
      contactNumber: '+60 16-228 9012',
      emailAddress: 'meetarik.sultan@yahoo.com',
      storeAddress: 'Lot 4, Jalan Sultan, 50000 City Centre, Kuala Lumpur',
      mailingAddress: 'Lot 4, Jalan Sultan, 50000 City Centre, Kuala Lumpur',
      operatingDays: 'Setiap Hari (Isnin - Ahad)',
      operatingHours: '10:30 - 23:00',
      typeOfFood: 'Mee Tarik Segar, Sup Daging & Dumpling Kukus',
      bankName: 'Public Bank Berhad',
      bankAccountName: 'Mee Tarik Jalan Sultan Enterprise',
      bankAccountNumber: '3194029410',
      documentsChecklist: JSON.stringify({
        icCopy: true,
        ssmCopy: true,
        bankStatement: true,
        shopPhoto: true,
        typhoidCert: false
      }),
      receivedDate: new Date('2026-09-11T09:00:00Z'),
      processingOfficer: 'Nurul Izzati',
      status: 'Dalam Proses',
      agreedToTerms: true,
      merchantSignatureName: 'Chen Wei Loon',
      merchantSignatureIc: '880620-14-5109',
      merchantSignatureDate: new Date('2026-09-10T15:00:00Z'),
      agentSignatureName: 'Faizal bin Mohamad Radzi',
      agentSignatureId: 'AGT-2026-008',
      agentSignatureDate: new Date('2026-09-10T15:30:00Z'),
    }
  });

  // -------------------------------------------------------------
  // 8. MERCHANT CHECKLISTS
  // -------------------------------------------------------------
  console.log('📋 Seeding Merchant Checklists...');

  await prisma.merchantChecklist.create({
    data: {
      agentName: 'Faizal bin Mohamad Radzi',
      date: new Date('2026-09-02T09:30:00Z'),
      merchant: 'Restoran Selera Kampung Warisan',
      personInCharge: 'Haji Razak bin Bakar',
      mobileNumber: '+60 19-334 5671',
      emailAddress: 'warisankampung.ss15@gmail.com',
      outletAddress: 'No 12, Jalan SS15/4D, Subang Jaya',
      numberOfOutlets: 1,
      businessType: 'Restoran Fizikal & Penghantaran',
      targetPlatform: 'GrabFood & ShopeeFood',
      leadStatus: 'Hot Lead',
      language: 'BM',
      agentSelfCheck: JSON.stringify({
        signboardOk: true,
        deviceReady: true,
        kitchenClean: true,
        menuStandardized: true
      }),
      agentNotes: 'Peniaga sangat bersemangat. Lokasi strategik berdekatan kolej swasta dan kawasan pejabat.',
      qualificationCheck: JSON.stringify({
        licenseValid: 'YES',
        deviceAvailable: 'YES',
        internetStable: 'YES',
        bankAccountActive: 'YES',
        packagingReady: 'YES',
        hygieneStandard: 'YES',
        commissionAgreed: 'YES',
        onboardingReady: 'YES',
        halalCertified: 'NA',
        marketingPromoAgreed: 'YES'
      }),
      yesScore: 9,
      noScore: 0,
      naScore: 1,
      totalChecked: 10,
    }
  });

  await prisma.merchantChecklist.create({
    data: {
      agentName: 'Siti Sarah binti Yusoff',
      date: new Date('2026-09-11T14:00:00Z'),
      merchant: 'Warisan Nasi Kukus Ayam Dara',
      personInCharge: 'Amirul Hakim',
      mobileNumber: '+60 18-912 3001',
      emailAddress: 'nasikukus.ayamdara@gmail.com',
      outletAddress: 'No 5, Jalan Radin Bagus, Sri Petaling, KL',
      numberOfOutlets: 2,
      businessType: 'Restoran Makanan Segera Tempatan',
      targetPlatform: 'GrabFood',
      leadStatus: 'Qualified Lead',
      language: 'BM',
      agentSelfCheck: JSON.stringify({
        signboardOk: true,
        deviceReady: true,
        kitchenClean: true,
        menuStandardized: true
      }),
      agentNotes: 'Cawangan Sri Petaling mempunyai volum pelanggan tinggi waktu makan tengah hari.',
      qualificationCheck: JSON.stringify({
        licenseValid: 'YES',
        deviceAvailable: 'YES',
        internetStable: 'YES',
        bankAccountActive: 'YES',
        packagingReady: 'YES',
        hygieneStandard: 'YES',
        commissionAgreed: 'YES',
        onboardingReady: 'YES',
        halalCertified: 'YES',
        marketingPromoAgreed: 'YES'
      }),
      yesScore: 10,
      noScore: 0,
      naScore: 0,
      totalChecked: 10,
    }
  });

  console.log('\n===============================================================');
  console.log('🎉 COMPREHENSIVE TEST DATA SUCCESSFULLY SEEDED INTO SUPABASE!');
  console.log('===============================================================');
  console.log('• Users: Admin, Finance Manager, Kitchen Staff, Field Agent');
  console.log('• Merchants: Legacy Cuisine Central, Selera Kampung, Heritage Kitchen');
  console.log('• Storefronts: store1@domain.com, 112121212, damansara, penang');
  console.log('• Products: 13 items with established base prices + 2 flagged for review');
  console.log(`• Grab Orders: ${orderCount} historical & current orders across 11 dates`);
  console.log('• Invoices: 3 invoices (PAID, SENT, DRAFT)');
  console.log('• Registration Forms: 2 Agent Forms + 2 Merchant Forms + 2 Checklists');
  console.log('===============================================================\n');
}

seedComprehensiveData()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
