'use client';

import React, { useState, useEffect } from 'react';
import { ActionRequiredAlert } from '../../components/dashboard/ActionRequiredAlert';
import { MetricsGrid } from '../../components/dashboard/MetricsGrid';
import { InvoiceTrigger } from '../../components/dashboard/InvoiceTrigger';
import { AnalyticsView } from '../../components/dashboard/AnalyticsView';
import { VendorsView } from '../../components/dashboard/VendorsView';
import { DashboardMetrics } from '../../types/dashboard';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
type TabName = 'dashboard' | 'analytics' | 'vendors';

export default function DashboardOverviewPage() {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('all'); // Set default to 'all' to show test order out of the box
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Light/Dark Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize and load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

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
    <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 transition-colors duration-200">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 h-full bg-white dark:bg-[#0d1117] border-r border-slate-200 dark:border-slate-850 flex flex-col justify-between shrink-0 shadow-sm z-10">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-850/50 flex items-center gap-2">
            <div className="bg-emerald-600 rounded-lg p-1.5 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-800 dark:text-slate-100">Legacy Cuisine</span>
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-450 font-bold uppercase tracking-wider">Reconciliations</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Sidebar Navigation">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-100/50 dark:border-emerald-900/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-100/50 dark:border-emerald-900/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('vendors')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'vendors'
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border border-emerald-100/50 dark:border-emerald-900/30'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Vendors Registry
            </button>
          </nav>
        </div>

        {/* Footer Theme Toggle */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-850/50">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-all text-slate-650 dark:text-slate-300"
          >
            <span className="capitalize">{theme} Mode</span>
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-indigo-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto h-full w-full">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850/50 pb-5">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-850 dark:text-slate-100">Storefront Reconciliation</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Aggregate storefront invoicing ledger, margin metrics, and base-price adjustments.
                </p>
              </div>
            </div>

            {/* Ingestion Alerts Banner */}
            <section aria-label="Urgent Action Items" className="w-full">
              <ActionRequiredAlert onReconciliationTrigger={fetchDashboardMetrics} />
            </section>

            {/* Financial metrics Section */}
            <section aria-label="Financial Metrics Overview" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-[#0d1117] p-4 border border-slate-200 dark:border-slate-850 rounded-xl shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Key Performance Indicators</h3>
                  <p className="text-xs text-slate-400">Summarized gross revenue, base payouts, and agency commissions.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-850">
                  {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md capitalize transition-all ${
                        timeRange === range
                          ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-850'
                          : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {range === 'all' ? 'All-Time' : range}
                    </button>
                  ))}
                </div>
              </div>

              {loading && !metrics ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full animate-pulse">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-xl p-6 h-32"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-800 dark:text-rose-450 p-4 rounded-xl text-center text-sm font-medium">
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

            {/* Invoicing Trigger */}
            <section aria-label="Statement Generation Engine" className="w-full">
              <InvoiceTrigger />
            </section>
          </div>
        )}

        {/* VIEW 2: ANALYTICS OVERVIEW */}
        {activeTab === 'analytics' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-850/50 pb-5">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-850 dark:text-slate-100">Financial Analytics</h1>
                <p className="text-sm text-slate-400 mt-1">
                  Track markup margins, commission ratios, and storefront payouts over time.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-lg border border-slate-200 dark:border-slate-850">
                {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md capitalize transition-all ${
                      timeRange === range
                        ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-sm border border-slate-200/50 dark:border-slate-850'
                        : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {range === 'all' ? 'All-Time' : range}
                  </button>
                ))}
              </div>
            </div>

            <section className="w-full">
              <AnalyticsView metrics={metrics} loading={loading} />
            </section>
          </div>
        )}

        {/* VIEW 3: VENDORS REGISTRY */}
        {activeTab === 'vendors' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-slate-100 dark:border-slate-850/50 pb-5">
              <h1 className="text-3xl font-black tracking-tight text-slate-850 dark:text-slate-100">Vendors Registry</h1>
              <p className="text-sm text-slate-400 mt-1">
                Register new restaurant accounts and associate them with storefront Grab email addresses.
              </p>
            </div>

            <section className="w-full">
              <VendorsView />
            </section>
          </div>
        )}

      </main>
    </div>
  );
}
