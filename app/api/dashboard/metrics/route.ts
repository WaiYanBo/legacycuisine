import { NextRequest, NextResponse } from 'next/server';
import { DashboardService } from '../../../../src/services/dashboard.service';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
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
