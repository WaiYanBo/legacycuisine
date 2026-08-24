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
            <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-28"></div>
          ))}
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-80"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Analytics Insight Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Margin Rate Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Gross Profit Margin</span>
          <h2 className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">{marginRate.toFixed(1)}%</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Leftover profit ratio of Grab sales revenue.</p>
        </div>

        {/* Total Orders Ingested */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Total Orders Ingested</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{totalOrdersCount}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Total receipts parsed and reconciled.</p>
        </div>

        {/* Avg Payout Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Avg Storefront Profit</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {metrics?.storefrontsPerformance && metrics.storefrontsPerformance.length > 0
              ? formatCurrency(profit / metrics.storefrontsPerformance.length)
              : 'RM 0.00'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average margin collected per restaurant storefront.</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Total Gross Ingestion</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{formatCurrency(revenue)}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Sum value of all parsed subtotal columns.</p>
        </div>
      </div>

      {/* Visual Chart Section */}
      <div className="w-full">
        <ProfitChart data={metrics?.chartData || []} />
      </div>

      {/* Storefront Rankings Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Storefront Performance Rankings</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Detailed breakdown of gross revenue, restaurant payouts, and margin distributions per storefront.</p>
        </div>

        {(!metrics?.storefrontsPerformance || metrics.storefrontsPerformance.length === 0) ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium">
            No storefront performance data found. Import order receipts to build metrics!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-3.5 px-4">Storefront Details</th>
                  <th className="py-3.5 px-4 text-right">Orders</th>
                  <th className="py-3.5 px-4 text-right">Gross Revenue</th>
                  <th className="py-3.5 px-4 text-right">Merchant Payout</th>
                  <th className="py-3.5 px-4 text-right">Net Markup Margin</th>
                  <th className="py-3.5 px-4 text-right">Margin Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {metrics.storefrontsPerformance.map((sf, idx) => {
                  const sfMargin = sf.revenue > 0 ? (sf.profit / sf.revenue) * 100 : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all">
                      <td className="py-4 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">{sf.name}</div>
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">{sf.email}</div>
                      </td>
                      <td className="py-4 px-4 text-right text-slate-700 dark:text-slate-300 font-medium">{sf.count}</td>
                      <td className="py-4 px-4 text-right text-slate-900 dark:text-white font-bold">{formatCurrency(sf.revenue)}</td>
                      <td className="py-4 px-4 text-right text-slate-500 dark:text-slate-400">{formatCurrency(sf.payout)}</td>
                      <td className="py-4 px-4 text-right text-red-600 dark:text-red-400 font-extrabold">{formatCurrency(sf.profit)}</td>
                      <td className="py-4 px-4 text-right font-bold text-slate-900 dark:text-white">
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
