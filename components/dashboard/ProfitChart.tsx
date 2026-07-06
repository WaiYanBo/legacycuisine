import React from 'react';
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
  const formatValue = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-slate-800">Margin Breakdown Trends</h3>
        <p className="text-xs text-slate-400">Comparing base payouts against leftover agency profit margins.</p>
      </div>

      <div className="h-80 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-100 rounded-lg text-slate-400">
            No data available for the selected dates.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `$${value}`}
                tick={{ fill: '#64748b', fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value: number) => [formatValue(value), '']}
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  fontSize: '13px'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px' }}
              />
              {/* Stacked or side-by-side bars */}
              <Bar 
                name="Vendor Payout" 
                dataKey="vendorPayouts" 
                fill="#64748b" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
              <Bar 
                name="Agency Profit" 
                dataKey="clientProfit" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
