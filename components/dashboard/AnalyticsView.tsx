import React from 'react';
import { DashboardMetrics } from '../../types/dashboard';
import { ProfitChart } from './ProfitChart';
import { getDictionary, Locale } from '../../lib/i18n';

interface AnalyticsViewProps {
  metrics: DashboardMetrics | null;
  loading: boolean;
  lang?: Locale;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ metrics, loading, lang = 'en' }) => {
  const dict = getDictionary(lang).analytics;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MY', {
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
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">{dict.cards.grossMargin}</span>
          <h2 className="text-3xl font-black text-red-600 dark:text-red-400 mt-2">{marginRate.toFixed(1)}%</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{dict.cards.grossMarginDesc}</p>
        </div>

        {/* Total Orders Ingested */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">{dict.cards.totalOrders}</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{totalOrdersCount}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{dict.cards.totalOrdersDesc}</p>
        </div>

        {/* Avg Payout Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">{dict.cards.avgProfit}</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">
            {metrics?.storefrontsPerformance && metrics.storefrontsPerformance.length > 0
              ? formatCurrency(profit / metrics.storefrontsPerformance.length)
              : 'RM 0.00'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{dict.cards.avgProfitDesc}</p>
        </div>

        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">{dict.cards.totalIngestion}</span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mt-2">{formatCurrency(revenue)}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{dict.cards.totalIngestionDesc}</p>
        </div>
      </div>

      {/* Visual Chart Section */}
      <div className="w-full">
        <ProfitChart data={metrics?.chartData || []} lang={lang} />
      </div>

      {/* Storefront Rankings Grid */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
        <div className="mb-6">
          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">{dict.rankings.title}</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{dict.rankings.subtitle}</p>
        </div>

        {(!metrics?.storefrontsPerformance || metrics.storefrontsPerformance.length === 0) ? (
          <div className="text-center py-10 text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-950/50 text-xs font-medium">
            {dict.rankings.noData}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  <th className="py-3.5 px-4">{dict.rankings.colStorefront}</th>
                  <th className="py-3.5 px-4 text-right">{dict.rankings.colOrders}</th>
                  <th className="py-3.5 px-4 text-right">{dict.rankings.colGrossRevenue}</th>
                  <th className="py-3.5 px-4 text-right">{dict.rankings.colMerchantPayout}</th>
                  <th className="py-3.5 px-4 text-right">{dict.rankings.colNetMargin}</th>
                  <th className="py-3.5 px-4 text-right">{dict.rankings.colMarginRate}</th>
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
