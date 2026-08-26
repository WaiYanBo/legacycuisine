import { NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await prisma.productMaster.findMany({
      where: { needsReview: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(products);
  } catch (error) {
    // Graceful fallback when database is starting up or has no review items
    return NextResponse.json([]);
  }
}
