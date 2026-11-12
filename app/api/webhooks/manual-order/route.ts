import { NextRequest, NextResponse } from 'next/server';
import { ReceiptService } from '../../../../src/services/receipt.service';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      storeIdentifier,
      grabOrderId,
      orderDate,
      rawSubtotal,
      totalCollectedByGrab,
      orderLineItems,
    } = body;

    if (!storeIdentifier || typeof storeIdentifier !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid string: "storeIdentifier"' }, { status: 400 });
    }
    if (!grabOrderId || typeof grabOrderId !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid string: "grabOrderId"' }, { status: 400 });
    }
    if (!orderDate || typeof orderDate !== 'string') {
      return NextResponse.json({ error: 'Missing or invalid string: "orderDate"' }, { status: 400 });
    }
    if (rawSubtotal === undefined || typeof rawSubtotal !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid number: "rawSubtotal"' }, { status: 400 });
    }
    if (totalCollectedByGrab === undefined || typeof totalCollectedByGrab !== 'number') {
      return NextResponse.json({ error: 'Missing or invalid number: "totalCollectedByGrab"' }, { status: 400 });
    }
    if (!Array.isArray(orderLineItems) || orderLineItems.length === 0) {
      return NextResponse.json({ error: 'Missing or invalid non-empty array: "orderLineItems"' }, { status: 400 });
    }

    const rawDeliveryFee = typeof body.rawDeliveryFee === 'number' ? body.rawDeliveryFee : 0.0;
    const rawTax = typeof body.rawTax === 'number' ? body.rawTax : 0.0;
    const rawGrabCommission = typeof body.rawGrabCommission === 'number' ? body.rawGrabCommission : 0.0;
    const voucherBarcode = typeof body.voucherBarcode === 'string' ? body.voucherBarcode : undefined;

    const result = await ReceiptService.ingestGrabReceipt({
      storeIdentifier,
      grabOrderId,
      orderDate,
      rawSubtotal,
      rawDeliveryFee,
      rawTax,
      rawGrabCommission,
      totalCollectedByGrab,
      voucherBarcode,
      orderLineItems,
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    const message = error.message || 'Internal Server Error';
    if (message.includes('Storefront not registered')) {
      return NextResponse.json({ error: 'Storefront Not Found', details: message }, { status: 404 });
    }
    if (message.includes('Duplicate Order')) {
      return NextResponse.json({ error: 'Duplicate Order Conflict', details: message }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Database Server Error', details: message }, { status: 500 });
  }
}

