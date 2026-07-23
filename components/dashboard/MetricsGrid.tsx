import React from 'react';

interface MetricsGridProps {
  totalRevenue: number;
  totalPayouts: number;
  netProfit: number;
}

export const MetricsGrid: React.FC<MetricsGridProps> = ({
  totalRevenue = 0,
  totalPayouts = 0,
  netProfit = 0,
}) => {
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
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Total Grab Revenue</span>
          <div className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-lg p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{formatCurrency(totalRevenue)}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-550 mt-2">Aggregate transaction sales recorded by Grab receipts.</p>
      </div>

      {/* Total Vendor Payouts Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 text-slate-900 dark:text-slate-100">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">Vendor Payouts</span>
          <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350 rounded-lg p-2">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100 tracking-tight">{formatCurrency(totalPayouts)}</h2>
        <p className="text-xs text-slate-400 dark:text-slate-550 mt-2">Cost of goods sold based on restaurant menu base prices.</p>
      </div>

      {/* Net Client Profit Card */}
      <div className={`border rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 ${
        netProfit >= 0 
          ? 'bg-emerald-50/30 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30 text-emerald-900 dark:text-emerald-300' 
          : 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200 dark:border-rose-900/30 text-rose-900 dark:text-rose-300'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold tracking-wider text-slate-500 dark:text-slate-450 uppercase">Net Agency Profit</span>
          <div className={`rounded-lg p-2 ${
            netProfit >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-350' : 'bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-350'
          }`}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black tracking-tight">{formatCurrency(netProfit)}</h2>
        <p className="text-xs mt-2">
          Remaining markup revenues collected after clearing restaurant payouts.
        </p>
      </div>
    </div>
  );
};
