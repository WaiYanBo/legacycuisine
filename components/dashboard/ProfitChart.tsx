import React, { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { ChartDataPoint } from '../../types/dashboard';

interface ProfitChartProps {
  data: ChartDataPoint[];
}

export const ProfitChart: React.FC<ProfitChartProps> = ({ data = [] }) => {
  const [mounted, setMounted] = useState(false);

  // Prevent Next.js hydration warnings by rendering only after mounting on the client
  useEffect(() => {
    setMounted(true);
  }, []);

  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (!mounted) {
    return (
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-80 flex items-center justify-center text-slate-400 text-xs">
        Loading chart visualization...
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-white">
      <div className="mb-4">
        <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">Margin Breakdown Trends</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comparing base payouts against leftover agency profit margins.</p>
      </div>

      <div className="h-80 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
            No data available for the selected dates.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" strokeOpacity={0.5} />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `RM${value}`}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value: number) => [formatValue(value), '']}
                contentStyle={{
                  backgroundColor: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: '#64748b' }}
              />
              <Bar 
                name="Merchant Payout" 
                dataKey="merchantPayouts" 
                fill="#f59e0b" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={36}
              />
              <Bar 
                name="Agency Profit" 
                dataKey="clientProfit" 
                fill="#c81e1e" 
                radius={[6, 6, 0, 0]} 
                maxBarSize={36}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
