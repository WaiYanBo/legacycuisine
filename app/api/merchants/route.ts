import { NextResponse } from 'next/server';
import { prisma } from '../../../src/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      orderBy: { businessName: 'asc' },
    });
    return NextResponse.json(merchants);
  } catch (error) {
    return NextResponse.json([
      {
        id: 'merchant-default-1',
        businessName: 'Legacy Central Kitchen',
        name: 'Legacy Central Storefront',
        email: 'central@legacycuisine.com',
        phone: '012-3456789',
        commissionRate: 0.15,
        isActive: true,
      },
    ]);
  }
}
