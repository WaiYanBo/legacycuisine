'use client';

import React, { useState, useEffect } from 'react';
import { ActionRequiredAlert } from '../../components/dashboard/ActionRequiredAlert';
import { MetricsGrid } from '../../components/dashboard/MetricsGrid';
import { InvoiceTrigger } from '../../components/dashboard/InvoiceTrigger';
import { AnalyticsView } from '../../components/dashboard/AnalyticsView';
import { RegistrationFormsView } from '../../components/dashboard/RegistrationFormsView';
import { ManualOrderModal } from '../../components/dashboard/ManualOrderModal';
import { SettingsView } from '../../components/dashboard/SettingsView';
import { DashboardMetrics } from '../../types/dashboard';

type TimeRange = 'daily' | 'weekly' | 'monthly' | 'yearly' | 'all';
type TabName = 'dashboard' | 'analytics' | 'registration' | 'settings';

interface SessionUser {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'AGENT';
}

export default function DashboardOverviewPage() {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [timeRange, setTimeRange] = useState<TimeRange>('all'); // Set default to 'all' to show test order out of the box
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isManualModalOpen, setIsManualModalOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);

  // Light/Dark Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize and load theme & session from localStorage / API
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    setTheme(savedTheme);
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const savedUser = localStorage.getItem('lc_user');
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {}
    }

    // Verify session
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.user) {
          setCurrentUser(data.user);
          localStorage.setItem('lc_user', JSON.stringify(data.user));
        }
      })
      .catch(() => {});
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

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    document.cookie = 'lc_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    document.cookie = 'lc_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('lc_session');
    localStorage.removeItem('lc_auth');
    localStorage.removeItem('lc_user');
    window.location.href = '/';
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
    <div id="dashboard-root" className="flex h-screen overflow-hidden bg-white dark:bg-black text-black dark:text-white transition-colors duration-200 print:block print:h-auto print:overflow-visible print:bg-white">
      
      {/* 1. LEFT SIDEBAR NAVIGATION */}
      <aside className="w-64 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 shadow-sm z-10 print:hidden">
        <div>
          {/* Logo Brand Header */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="bg-gradient-to-br from-red-600 to-red-800 rounded-xl p-2 text-white shadow-md shadow-red-600/20">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
            </div>
            <div>
              <span className="text-base font-black tracking-tight text-slate-900 dark:text-white block">Legacy Cuisine</span>
              <span className="block text-[10px] text-red-600 dark:text-red-400 font-extrabold uppercase tracking-wider">Reconciliations</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5" aria-label="Sidebar Navigation">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
              </svg>
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 002 2h2a2 2 0 002-2z" />
              </svg>
              Analytics
            </button>

            <button
              onClick={() => setActiveTab('registration')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'registration'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Registration & Forms
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Settings & Access
            </button>
          </nav>
        </div>

        {/* Footer: User Profile, Theme Toggle & Logout */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          {currentUser && (
            <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-xs flex items-center justify-center shrink-0">
                  {currentUser.fullName.charAt(0)}
                </div>
                <div className="overflow-hidden">
                  <div className="text-xs font-bold text-slate-900 dark:text-white truncate">{currentUser.fullName}</div>
                  <div className="text-[10px] text-red-600 dark:text-red-400 font-extrabold uppercase">{currentUser.role.replace('_', ' ')}</div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Log Keluar / Logout"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          )}

          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-between px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 transition-all text-slate-700 dark:text-slate-200"
          >
            <span className="capitalize">{theme} Mode</span>
            {theme === 'light' ? (
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 100 2h1z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
              </svg>
            )}
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT AREA */}
      <main id="dashboard-main" className="flex-1 p-6 sm:p-10 space-y-8 overflow-y-auto h-full w-full bg-slate-50/60 dark:bg-slate-950 text-slate-900 dark:text-slate-100 print:p-0 print:m-0 print:overflow-visible print:h-auto print:block print:bg-white print:space-y-0">
        
        {/* VIEW 1: DASHBOARD OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Header info */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Storefront Reconciliation</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Aggregate storefront invoicing ledger, margin metrics, and base-price adjustments.
                </p>
              </div>

              {/* Data Ingestion Mode Status & Manual Entry Trigger */}
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs px-3.5 py-2 rounded-xl shadow-sm">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="font-semibold">Automated Ingestion: Active</span>
                </div>

                <button
                  type="button"
                  onClick={() => setIsManualModalOpen(true)}
                  className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-red-600/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>Manual Data Input</span>
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
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Key Performance Indicators</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Summarized gross revenue, base payouts, and agency commissions.</p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                  {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-lg capitalize transition-all ${
                        timeRange === range
                          ? 'bg-red-600 text-white shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
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
                    <div key={n} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 h-32"></div>
                  ))}
                </div>
              ) : error ? (
                <div className="bg-rose-50 dark:bg-red-950/40 border border-rose-200 dark:border-red-900/50 text-red-700 dark:text-red-300 p-4 rounded-2xl text-center text-sm font-medium shadow-sm">
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5">
              <div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Financial Analytics</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  Track markup margins, commission ratios, and storefront payouts over time.
                </p>
              </div>

              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                {(['all', 'daily', 'weekly', 'monthly', 'yearly'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-lg capitalize transition-all ${
                      timeRange === range
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400'
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

        {/* VIEW 3: REGISTRATION & FORMS PORTAL */}
        {activeTab === 'registration' && (
          <RegistrationFormsView />
        )}

        {/* VIEW 4: SETTINGS & ACCESS CONTROL */}
        {activeTab === 'settings' && (
          <SettingsView />
        )}

      </main>
    </div>
  );
}
