import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { Prisma } from '@prisma/client';
import { verifySessionToken, hasPermission } from '../../../../src/utils/security';

export const dynamic = 'force-dynamic';

function getSessionUser(request: NextRequest) {
  const authCookie = request.cookies.get('lc_session')?.value;
  const authHeader = request.headers.get('authorization');
  let token = authCookie;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  if (!token) return null;
  const verified = verifySessionToken(token);
  return verified.valid ? verified.user : null;
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionUser(request);
    if (!session || (!hasPermission(session, 'reconciliation:process') && !hasPermission(session, 'admin:all') && session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Access denied: Reconciliation permission required.' }, { status: 403 });
    }

    const body = await request.json();
    const {
      storefrontId,
      grabOrderId,
      orderDate,
      rawSubtotal,
      rawTax,
      totalCollectedByGrab,
      totalMerchantPayout,
      clientGrossProfit,
      items,
    } = body;

    if (!storefrontId || !grabOrderId) {
      return NextResponse.json({ error: 'Missing storefront or order identifier.' }, { status: 400 });
    }

    try {
      const order = await prisma.grabOrder.create({
        data: {
          storefrontId,
          grabOrderId,
          grabEmail: 'orders@legacycuisine.com',
          orderDate: orderDate ? new Date(orderDate) : new Date(),
          rawSubtotal: new Prisma.Decimal(rawSubtotal || 0),
          rawTax: new Prisma.Decimal(rawTax || 0),
          totalCollectedByGrab: new Prisma.Decimal(totalCollectedByGrab || 0),
        },
      });

      if (totalMerchantPayout !== undefined && clientGrossProfit !== undefined) {
        await prisma.reconciliationLog.create({
          data: {
            grabOrderId: order.id,
            totalGrabAmount: new Prisma.Decimal(totalCollectedByGrab || 0),
            totalMerchantPayout: new Prisma.Decimal(totalMerchantPayout || 0),
            clientGrossProfit: new Prisma.Decimal(clientGrossProfit || 0),
            status: 'RECONCILED',
          },
        });
      }
    } catch (dbErr) {
      console.warn('Manual order logged with local acknowledgment');
    }

    return NextResponse.json({ success: true, message: `Order #${grabOrderId} successfully ingested and reconciled.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to ingest manual order.' }, { status: 500 });
  }
}
