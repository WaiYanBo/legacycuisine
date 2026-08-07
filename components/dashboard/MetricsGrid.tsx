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
      <div className="bg-white dark:bg-black border border-[#b0712d] rounded-xl p-6 shadow-sm text-black dark:text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold tracking-wider text-[#b0712d] uppercase">Total Grab Revenue</span>
          <div className="bg-[#b0712d]/15 text-black dark:text-white rounded-lg p-2 border border-[#b0712d]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-black dark:text-white tracking-tight">{formatCurrency(totalRevenue)}</h2>
        <p className="text-xs text-[#b0712d] mt-2">Aggregate transaction sales recorded by Grab receipts.</p>
      </div>

      {/* Total Vendor Payouts Card */}
      <div className="bg-white dark:bg-black border border-[#b0712d] rounded-xl p-6 shadow-sm text-black dark:text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold tracking-wider text-[#b0712d] uppercase">Merchant Payouts</span>
          <div className="bg-[#b0712d]/15 text-black dark:text-white rounded-lg p-2 border border-[#b0712d]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-black dark:text-white tracking-tight">{formatCurrency(totalPayouts)}</h2>
        <p className="text-xs text-[#b0712d] mt-2">Cost of goods sold based on restaurant menu base prices.</p>
      </div>

      {/* Net Client Profit Card */}
      <div className="bg-white dark:bg-black border border-[#aa0505] rounded-xl p-6 shadow-sm text-black dark:text-white">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold tracking-wider text-[#aa0505] uppercase">Net Agency Profit</span>
          <div className="bg-[#aa0505]/15 text-[#aa0505] rounded-lg p-2 border border-[#aa0505]">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
        </div>
        <h2 className="text-3xl font-black text-black dark:text-white tracking-tight">{formatCurrency(netProfit)}</h2>
        <p className="text-xs text-[#b0712d] mt-2">
          Remaining markup revenues collected after clearing restaurant payouts.
        </p>
      </div>
    </div>
  );
};
