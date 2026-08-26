import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { merchantId, billingDate } = body;

    if (!merchantId) {
      return NextResponse.json({ error: 'Please select a restaurant merchant.' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully compiled invoice statement for merchant on ${billingDate || 'current billing cycle'}.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to generate invoice.' }, { status: 500 });
  }
}
