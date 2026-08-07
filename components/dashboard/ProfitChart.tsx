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
      <div className="w-full bg-white dark:bg-black border border-[#b0712d] rounded-xl p-6 h-80 flex items-center justify-center text-[#b0712d]">
        Loading chart visualization...
      </div>
    );
  }

  return (
    <div className="w-full bg-white dark:bg-black border border-[#b0712d] rounded-xl p-6 shadow-sm">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-black dark:text-white">Margin Breakdown Trends</h3>
        <p className="text-xs text-[#b0712d]">Comparing base payouts against leftover agency profit margins.</p>
      </div>

      <div className="h-80 w-full">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center border-2 border-dashed border-[#b0712d] rounded-lg text-[#b0712d]">
            No data available for the selected dates.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#b0712d" strokeOpacity={0.3} />
              <XAxis 
                dataKey="date" 
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#b0712d', fontSize: 11 }}
              />
              <YAxis 
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `RM${value}`}
                tick={{ fill: '#b0712d', fontSize: 11 }}
              />
              <Tooltip 
                formatter={(value: number) => [formatValue(value), '']}
                contentStyle={{
                  backgroundColor: '#000000',
                  border: '1px solid #b0712d',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.5)',
                  color: '#ffffff',
                  fontSize: '13px'
                }}
              />
              <Legend 
                verticalAlign="top"
                height={36}
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: '12px', color: '#b0712d' }}
              />
              <Bar 
                name="Merchant Payout" 
                dataKey="merchantPayouts" 
                fill="#b0712d" 
                radius={[4, 4, 0, 0]} 
                maxBarSize={40}
              />
              <Bar 
                name="Agency Profit" 
                dataKey="clientProfit" 
                fill="#aa0505" 
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
