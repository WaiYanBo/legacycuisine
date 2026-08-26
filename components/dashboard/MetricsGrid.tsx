import React from 'react';
import { getDictionary, Locale } from '../../lib/i18n';

interface MetricsGridProps {
  totalRevenue: number;
  totalPayouts: number;
  netProfit: number;
  lang?: Locale;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  totalRevenue = 0,
  totalPayouts = 0,
  netProfit = 0,
  lang = 'en',
}) => {
  const dict = getDictionary(lang).dashboard.kpi;

  // Safe parsing helper
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
    }).format(val);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
      {/* Total Grab Revenue Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-slate-900 dark:text-white relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">{dict.totalRevenue}</span>
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl p-2.5 border border-slate-200 dark:border-slate-700">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalRevenue)}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{dict.totalRevenueDesc}</p>
      </div>

      {/* Total Merchant Payouts Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow text-slate-900 dark:text-white relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-extrabold tracking-wider text-slate-500 dark:text-slate-400 uppercase">{dict.merchantPayouts}</span>
          <div className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 rounded-xl p-2.5 border border-red-200/60 dark:border-red-900/40">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 00-2 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formatCurrency(totalPayouts)}</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">{dict.merchantPayoutsDesc}</p>
      </div>

      {/* Net Client Profit Card */}
      <div className="bg-gradient-to-br from-red-600 via-rose-600 to-red-700 rounded-2xl p-6 shadow-lg shadow-red-600/20 text-white relative overflow-hidden group">
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-extrabold tracking-wider text-white/90 uppercase">{dict.netProfit}</span>
          <div className="bg-white/20 text-white rounded-xl p-2.5 backdrop-blur-sm border border-white/20">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-white tracking-tight">{formatCurrency(netProfit)}</h2>
        <p className="text-xs text-white/80 mt-2">
          {dict.netProfitDesc}
        </p>
      </div>
    </div>
  );
};
