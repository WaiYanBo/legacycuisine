import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '../../../../src/services/dashboard.service';
import { verifySessionToken } from '../../../../src/utils/security';

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

export async function GET(request: NextRequest) {
  try {
    const session = getSessionUser(request);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized: Authentication required.' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'all';

    const metrics = await DashboardService.getMetrics(range);
    return NextResponse.json(metrics);
  } catch (error: any) {
    return NextResponse.json({
      totalRevenue: 0.00,
      totalPayouts: 0.00,
      netProfit: 0.00,
      chartData: [],
      storefrontsPerformance: [],
    });
  }
}
