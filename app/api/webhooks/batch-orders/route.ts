import { NextRequest, NextResponse } from 'next/server';
import { ReceiptService } from '../../../../src/services/receipt.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orders } = body;

    if (!Array.isArray(orders) || orders.length === 0) {
      return NextResponse.json({ error: 'Missing or empty orders array.' }, { status: 400 });
    }

    const results: any[] = [];
    const errors: any[] = [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      try {
        const result = await ReceiptService.ingestGrabReceipt(order);
        results.push(result);
      } catch (err: any) {
        errors.push({
          orderIndex: i,
          grabOrderId: order.grabOrderId,
          error: err.message || 'Unknown processing error',
        });
      }
    }

    return NextResponse.json(
      {
        message: 'Batch processing finished.',
        totalReceived: orders.length,
        importedCount: results.length,
        failedCount: errors.length,
        errors,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to process batch order payload', details: error.message },
      { status: 500 }
    );
  }
}

