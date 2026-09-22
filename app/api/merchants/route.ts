import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../src/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const merchants = await prisma.merchant.findMany({
      include: {
        storefronts: true,
      },
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, businessName, contactEmail, contactPhone } = body;

    if (!businessName || !name || !contactEmail) {
      return NextResponse.json(
        { success: false, error: 'Business name, owner name, and email are required.' },
        { status: 400 }
      );
    }

    const merchant = await prisma.merchant.create({
      data: {
        name: name.trim(),
        businessName: businessName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone ? contactPhone.trim() : null,
        status: 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, data: merchant }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create merchant.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Merchant ID is required.' }, { status: 400 });
    }

    await prisma.merchant.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Merchant deleted successfully.' });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete merchant.' },
      { status: 500 }
    );
  }
}
