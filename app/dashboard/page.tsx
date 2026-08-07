'use client';

import React, { useState, useEffect } from 'react';
import { ActionRequiredAlert } from '../../components/dashboard/ActionRequiredAlert';
import { MetricsGrid } from '../../components/dashboard/MetricsGrid';
import { InvoiceTrigger } from '../../components/dashboard/InvoiceTrigger';
import { AnalyticsView } from '../../components/dashboard/AnalyticsView';
import { MerchantsView } from '../../components/dashboard/MerchantsView';
import { RegistrationFormsView } from '../../components/dashboard/RegistrationFormsView';
import { ManualOrderModal } from '../../components/dashboard/ManualOrderModal';
import { DashboardMetrics } from '../../types/dashboard';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
type TabName = 'dashboard' | 'analytics' | 'merchants' | 'registration';

export default function DashboardOverviewPage() {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('all'); // Set default to 'all' to show test order out of the box
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);


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
    <div className="flex h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white transition-colors duration-200">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 h-full bg-white dark:bg-black border-r border-[#b0712d] flex flex-col justify-between shrink-0 shadow-sm z-10">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-[#b0712d] flex items-center gap-2">
            <div className="bg-[#aa0505] rounded-lg p-1.5 text-white">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-black dark:text-white">Legacy Cuisine</span>
              <span className="block text-[10px] text-[#b0712d] font-bold uppercase tracking-wider">Reconciliations</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Sidebar Navigation">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-[#aa0505] text-white border border-[#b0712d]'
                  : 'text-black dark:text-white hover:bg-[#b0712d]/15 hover:text-[#b0712d]'
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
                  ? 'bg-[#aa0505] text-white border border-[#b0712d]'
                  : 'text-black dark:text-white hover:bg-[#b0712d]/15 hover:text-[#b0712d]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('merchants')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'merchants'
                  ? 'bg-[#aa0505] text-white border border-[#b0712d]'
                  : 'text-black dark:text-white hover:bg-[#b0712d]/15 hover:text-[#b0712d]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Merchants Registry
            </button>

            <button
              onClick={() => setActiveTab('registration')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === 'registration'
                  ? 'bg-[#aa0505] text-white border border-[#b0712d]'
                  : 'text-black dark:text-white hover:bg-[#b0712d]/15 hover:text-[#b0712d]'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Registration & Forms
            </button>
          </nav>
        </div>

        {/* Footer Theme Toggle */}
        <div className="p-4 border-t border-[#b0712d]">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-semibold border border-[#b0712d] hover:bg-[#b0712d]/10 transition-all text-black dark:text-white"
          >
            <span className="capitalize">{theme} Mode</span>
            {theme === 'light' ? (
              <svg className="w-5 h-5 text-[#b0712d]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-[#b0712d]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto h-full w-full bg-white dark:bg-black text-black dark:text-white">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#b0712d] pb-5">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">Storefront Reconciliation</h1>
                <p className="text-sm text-[#b0712d] mt-1">
                  Aggregate storefront invoicing ledger, margin metrics, and base-price adjustments.
                </p>
              </div>

              {/* Data Ingestion Mode Status & Manual Entry Trigger */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-black border border-[#b0712d] text-black dark:text-white text-xs px-3 py-1.5 rounded-xl">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#aa0505] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#aa0505]"></span>
                  </span>
                  <span className="font-semibold text-black dark:text-white">n8n Webhook: Online</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="bg-[#aa0505] hover:bg-[#b0712d] text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm transition-all flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>n8n Down? Manual Data Input</span>
                </button>
              </div>
            </div>

            {/* Manual Data Entry Modal */}
            <ManualOrderModal
              isOpen={isManualModalOpen}
              onClose={() => setIsManualModalOpen(false)}
              onSuccess={fetchDashboardMetrics}
            />


            {/* Ingestion Alerts Banner */}
            <section aria-label="Urgent Action Items" className="w-full">
              <ActionRequiredAlert onReconciliationTrigger={fetchDashboardMetrics} />
            </section>

            {/* Financial metrics Section */}
            <section aria-label="Financial Metrics Overview" className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-black p-4 border border-[#b0712d] rounded-xl shadow-sm">
                <div>
                  <h3 className="font-bold text-black dark:text-white text-sm">Key Performance Indicators</h3>
                  <p className="text-xs text-[#b0712d]">Summarized gross revenue, base payouts, and agency commissions.</p>
                </div>

                <div className="flex items-center gap-1 bg-white dark:bg-black p-1 rounded-lg border border-[#b0712d]">
                  {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`text-[11px] font-bold px-2.5 py-1 rounded-md capitalize transition-all ${
                        timeRange === range
                          ? 'bg-[#aa0505] text-white shadow-sm border border-[#b0712d]'
                          : 'text-black dark:text-white hover:text-[#b0712d]'
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
                    <div key={n} className="bg-white dark:bg-black border border-[#b0712d] rounded-xl p-6 h-32"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-[#aa0505]/10 border border-[#aa0505] text-black dark:text-white p-4 rounded-xl text-center text-sm font-medium">
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#b0712d] pb-5">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">Financial Analytics</h1>
                <p className="text-sm text-[#b0712d] mt-1">
                  Track markup margins, commission ratios, and storefront payouts over time.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-white dark:bg-black p-1 rounded-lg border border-[#b0712d]">
                {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-md capitalize transition-all ${
                      timeRange === range
                        ? 'bg-[#aa0505] text-white shadow-sm border border-[#b0712d]'
                        : 'text-black dark:text-white hover:text-[#b0712d]'
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

        {/* VIEW 3: MERCHANTS REGISTRY */}
        {activeTab === 'merchants' && (
          <div className="space-y-8 animate-fadeIn">
            <div className="border-b border-[#b0712d] pb-5">
              <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">Merchants Registry</h1>
              <p className="text-sm text-[#b0712d] mt-1">
                Register new restaurant accounts and associate them with storefront Grab email addresses.
              </p>
            </div>

            <section className="w-full">
              <MerchantsView />
            </section>
          </div>
        )}

        {/* VIEW 4: REGISTRATION & FORMS PORTAL */}
        {activeTab === 'registration' && (
          <RegistrationFormsView />
        )}

      </main>
    </div>
  );
}
