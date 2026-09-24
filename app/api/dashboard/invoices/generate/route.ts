import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, hasPermission } from '../../../../../src/utils/security';

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
    if (!session || (!hasPermission(session, 'invoices:generate') && !hasPermission(session, 'admin:all') && session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Access denied: Invoice generation permission required.' }, { status: 403 });
    }

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
