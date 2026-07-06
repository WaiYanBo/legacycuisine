'use client';

import React, { useState, useEffect } from 'react';
import { ActionRequiredAlert } from '../../components/dashboard/ActionRequiredAlert';
import { MetricsGrid } from '../../components/dashboard/MetricsGrid';
import { ProfitChart } from '../../components/dashboard/ProfitChart';
import { InvoiceTrigger } from '../../components/dashboard/InvoiceTrigger';
import { DashboardMetrics } from '../../types/dashboard';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function DashboardOverviewPage() {
  const [timeRange, setTimeRange] = useState<TimeRange>('monthly');
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch metrics based on time-range filter
  const fetchDashboardMetrics = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/dashboard/metrics?range=${timeRange}`);
      if (!res.ok) {
        throw new Error(`Failed to load metrics data: ${res.statusText}`);
      }
      const data: DashboardMetrics = await res.json();
      setMetrics(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Error loading dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardMetrics();
  }, [timeRange]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-6 sm:p-10 space-y-8 max-w-7xl mx-auto">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-800">Storefront Reconciliation</h1>
          <p className="text-sm text-slate-500 mt-1">
            Aggregate storefront invoicing ledger, margin metrics, and base-price adjustments.
          </p>
        </div>
      </div>

      {/* SECTION 1: Action Required Alert Banner (High Priority) */}
      <section aria-label="Urgent Action Items" className="w-full">
        {/* We pass the fetch function as a refresh trigger so that verifying a price updates the charts */}
        <ActionRequiredAlert onReconciliationTrigger={fetchDashboardMetrics} />
      </section>

      {/* SECTION 2: Key Financial Metrics Section */}
      <section aria-label="Financial Metrics Overview" className="space-y-4">
        {/* Date-range picker / filter controls at the top of the metrics section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Key Performance Indicators</h3>
            <p className="text-xs text-slate-400">Summarized gross revenue, base payouts, and agency commissions.</p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
            {(['daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-md capitalize transition-all ${
                  timeRange === range
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {loading && !metrics ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-pulse">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-slate-200 rounded-xl p-6 h-32"></div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-center text-sm font-medium">
            {error}
          </div>
        ) : (
          <MetricsGrid
            totalRevenue={metrics?.totalRevenue || 0}
            totalPayouts={metrics?.totalPayouts || 0}
            netProfit={metrics?.netProfit || 0}
          />
        )}
      </section>

      {/* SECTION 3: Profit Visualization Chart */}
      <section aria-label="Payout vs Profit Chart" className="w-full">
        {loading && !metrics ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6 h-80 animate-pulse"></div>
        ) : (
          <ProfitChart data={metrics?.chartData || []} />
        )}
      </section>

      {/* SECTION 4: Invoice Generation Trigger */}
      <section aria-label="Statement Generation Engine" className="w-full">
        <InvoiceTrigger />
      </section>
    </div>
  );
}
