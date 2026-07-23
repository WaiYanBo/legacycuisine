import React from 'react';
import { DashboardMetrics } from '../../types/dashboard';
import { ProfitChart } from './ProfitChart';

interface AnalyticsViewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics, loading }) => {
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'MYR',
    }).format(val);
  };

  const revenue = metrics?.totalRevenue || 0;
  const payouts = metrics?.totalPayouts || 0;
  const profit = metrics?.netProfit || 0;

  // Margin Rate = (Profit / Revenue) * 100
  const marginRate = revenue > 0 ? (profit / revenue) * 100 : 0;

  // Total Ingested Orders across all active storefronts
  const totalOrdersCount = metrics?.storefrontsPerformance?.reduce((acc, sf) => acc + sf.count, 0) || 0;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-28"></div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 h-80"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Analytics Insight Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Margin Rate Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Gross Profit Margin</span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{marginRate.toFixed(1)}%</h2>
          <p className="text-xs text-slate-400 mt-1">Leftover profit ratio of Grab sales revenue.</p>
        </div>

        {/* Total Orders Ingested */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Total Orders Ingested</span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{totalOrdersCount}</h2>
          <p className="text-xs text-slate-400 mt-1">Total receipts parsed and reconciled.</p>
        </div>

        {/* Avg Payout Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Avg Storefront Profit</span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">
            {metrics?.storefrontsPerformance && metrics.storefrontsPerformance.length > 0
              ? formatCurrency(profit / metrics.storefrontsPerformance.length)
              : 'RM 0.00'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Average margin collected per restaurant storefront.</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
          <span className="text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">Total Gross Ingestion</span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-2">{formatCurrency(revenue)}</h2>
          <p className="text-xs text-slate-400 mt-1">Sum value of all parsed subtotal columns.</p>
        </div>
      </div>

      {/* Visual Chart Section */}
      <div className="w-full">
        <ProfitChart data={metrics?.chartData || []} />
      </div>

      {/* Storefront Rankings Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Storefront Performance Rankings</h3>
          <p className="text-xs text-slate-400">Detailed breakdown of gross revenue, restaurant payouts, and margin distributions per storefront.</p>
        </div>

        {(!metrics?.storefrontsPerformance || metrics.storefrontsPerformance.length === 0) ? (
          <div className="text-center py-10 text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            No storefront performance data found. Import order receipts to build metrics!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-150 dark:border-slate-800 text-xs font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                  <th className="py-3 px-4">Storefront Details</th>
                  <th className="py-3 px-4 text-right">Orders</th>
                  <th className="py-3 px-4 text-right">Gross Revenue</th>
                  <th className="py-3 px-4 text-right">Vendor Payout</th>
                  <th className="py-3 px-4 text-right">Net Markup Margin</th>
                  <th className="py-3 px-4 text-right">Margin Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-sm">
                {metrics.storefrontsPerformance.map((sf, idx) => {
                  const sfMargin = sf.revenue > 0 ? (sf.profit / sf.revenue) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-all">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-800 dark:text-slate-200">{sf.name}</div>
                        <div className="text-xs text-slate-400">{sf.email}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400 font-medium">{sf.count}</td>
                      <td className="py-3.5 px-4 text-right text-slate-800 dark:text-slate-200 font-semibold">{formatCurrency(sf.revenue)}</td>
                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-slate-400">{formatCurrency(sf.payout)}</td>
                      <td className="py-3.5 px-4 text-right text-emerald-600 dark:text-emerald-400 font-bold">{formatCurrency(sf.profit)}</td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                        {sfMargin.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
