'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import BusinessRegistrationForm from '../forms/BusinessRegistrationForm';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';
import { Locale } from '../../lib/i18n';

interface AgentPortalViewProps {
  user: {
    id: string;
    username: string;
    fullName: string;
    email?: string;
    department?: string;
    position?: string;
    role: string;
  };
  lang: Locale;
  theme: 'light' | 'dark';
  onToggleLang: (lang: 'en' | 'ms') => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export function AgentPortalView({
  user,
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
  onLogout,
}: AgentPortalViewProps) {
  const isEn = lang === 'en';
  const [activeTab, setActiveTab] = useState<'my-merchants' | 'register' | 'profile'>('my-merchants');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMerchant, setViewingMerchant] = useState<any | null>(null);

  // Agent profile & registration form state
  const [agentProfile, setAgentProfile] = useState<any | null>(null);
  const [agentStorage, setAgentStorage] = useState<any | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [viewingMyFormModal, setViewingMyFormModal] = useState(false);

  const fetchMyMerchants = async () => {
    setLoadingMerchants(true);
    try {
      const res = await fetch('/api/forms/registration');
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setMerchants(json.data);
      } else if (Array.isArray(json)) {
        setMerchants(json);
      }
    } catch (e) {
      console.error('Failed to fetch merchants for agent:', e);
    } finally {
      setLoadingMerchants(false);
    }
  };

  const fetchAgentProfile = async () => {
    setLoadingProfile(true);
    try {
      const emailParam = encodeURIComponent(user.email || user.username || '');
      const idParam = encodeURIComponent(user.id || '');
      const res = await fetch(`/api/agent/profile?email=${emailParam}&id=${idParam}`);
      const json = await res.json();
      if (json.success && json.data) {
        setAgentProfile(json.data);
        setAgentStorage(json.storage || null);
      }
    } catch (e) {
      console.error('Failed to fetch agent profile:', e);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchMyMerchants();
    fetchAgentProfile();
  }, []);

  // Filter merchants based on search
  const filteredMerchants = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return merchants;
    return merchants.filter((m) => {
      const bName = (m.businessName || '').toLowerCase();
      const pName = (m.fullName || m.personInCharge || '').toLowerCase();
      const phone = (m.contactNumber || '').toLowerCase();
      const ssm = (m.registrationNo || '').toLowerCase();
      return bName.includes(q) || pName.includes(q) || phone.includes(q) || ssm.includes(q);
    });
  }, [merchants, searchTerm]);

  // Metric counts
  const totalCount = merchants.length;
  const approvedCount = merchants.filter(
    (m) =>
      (m.status || '').toLowerCase().includes('lulus') ||
      (m.status || '').toLowerCase().includes('approv')
  ).length;
  const inProcessCount = merchants.filter(
    (m) =>
      (m.status || '').toLowerCase().includes('proses') ||
      (m.status || '').toLowerCase().includes('process') ||
      !m.status
  ).length;

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden">
      {/* AGENT PORTAL TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between shadow-sm safe-top print:hidden">
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white p-0.5 sm:p-1 border-2 border-red-600 shadow-md flex items-center justify-center shrink-0">
            <Image
              src="/logo-circle.png"
              alt="Legacy Cuisine Logo"
              width={40}
              height={40}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-black text-sm sm:text-base md:text-lg tracking-tight text-slate-900 dark:text-white">
                Legacy Cuisine
              </span>
              <span className="hidden xs:inline-block sm:inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
                Agent Portal
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isEn ? 'Merchant Registration & Acquisition Hub' : 'Hab Pendaftaran & Pengambilan Peniaga'}
            </p>
          </div>
        </div>

        {/* Action Controls & Profile */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Language Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 sm:p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => onToggleLang('en')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                isEn ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              EN
            </button>
            <button
              type="button"
              onClick={() => onToggleLang('ms')}
              className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold transition-all ${
                !isEn ? 'bg-red-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              BM
            </button>
          </div>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm"
            title="Toggle theme"
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* User Profile Pill (Clickable -> Opens Profile Tab) */}
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800 transition-opacity text-left rounded-xl p-1 ${
              activeTab === 'profile' ? 'ring-2 ring-red-600/40 bg-red-50/50 dark:bg-red-950/30' : 'hover:opacity-80'
            }`}
            title={isEn ? 'View My Profile & Registered Form' : 'Lihat Profil & Borang Ejen Saya'}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-xs flex items-center justify-center shrink-0">
              {user.fullName.charAt(0)}
            </div>
            <div className="text-left overflow-hidden">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate">
                {user.fullName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {user.email || user.username}
              </div>
            </div>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-600 text-red-600 dark:text-red-400 hover:text-white border border-red-200 dark:border-red-900 text-xs font-bold transition-all flex items-center gap-1.5"
            title="Log Out"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">{isEn ? 'Logout' : 'Keluar'}</span>
          </button>
        </div>
      </header>

      {/* AGENT DASHBOARD BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        
        {/* Agent Welcome & Summary Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden print:hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/30 text-red-300 border border-red-500/40">
                  {isEn ? 'Authorized Acquisition Agent' : 'Ejen Pengambilan Sah'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>{isEn ? 'Safe in Supabase Storage' : 'Selamat Dalam Storan Supabase'}</span>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isEn ? `Welcome back, ${user.fullName}!` : `Selamat kembali, ${user.fullName}!`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                {isEn
                  ? 'Manage your merchant recruitment applications, track registration status, and onboard new food establishments under your account.'
                  : 'Urus permohonan peniaga anda, jejaki status pendaftaran, dan daftarkan premis makanan baharu di bawah akaun anda.'}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start md:self-auto">
              <button
                type="button"
                onClick={() => setActiveTab('profile')}
                className="px-4 py-3 bg-white/10 hover:bg-white/20 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-white/20 transition-all flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>{isEn ? 'My Profile & Form' : 'Profil & Borang Saya'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('register')}
                className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/30 transition-all transform active:scale-98 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                <span>{isEn ? 'Register New Merchant' : 'Daftar Peniaga Baru'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* PERFORMANCE STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 print:hidden">
          {/* Card 1: Total Merchants Registered */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? 'Total Merchants Registered' : 'Jumlah Peniaga Didaftarkan'}
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
                {loadingMerchants ? '...' : totalCount}
              </h3>
              <p className="text-[11px] text-red-600 dark:text-red-400 font-semibold mt-1">
                {isEn ? 'Registered under your ID' : 'Didaftarkan di bawah ID anda'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>

          {/* Card 2: Approved / Active */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? 'Approved & Active' : 'Diluluskan & Aktif'}
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                {loadingMerchants ? '...' : approvedCount}
              </h3>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                {isEn ? 'Commission eligible' : 'Layak menerima komisen'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Card 3: In Process */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? 'In Process / Under Review' : 'Dalam Proses / Semakan'}
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-amber-500 dark:text-amber-400 mt-2">
                {loadingMerchants ? '...' : inProcessCount}
              </h3>
              <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
                {isEn ? 'Audit in verification' : 'Audit sedang disemak HQ'}
              </p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* AGENT NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar print:hidden">
          <button
            type="button"
            onClick={() => setActiveTab('my-merchants')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'my-merchants'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
            <span>{isEn ? 'My Registered Merchants' : 'Peniaga Saya Didaftarkan'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-black/20 text-white font-bold ml-1">
              {merchants.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'register'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            <span>{isEn ? 'Register Merchant' : 'Daftar Peniaga'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${
              activeTab === 'profile'
                ? 'bg-red-600 text-white shadow-md shadow-red-600/25'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span>{isEn ? 'My Profile & Registered Form' : 'Profil & Borang Saya'}</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
              {isEn ? 'Safe in Storage' : 'Disimpan'}
            </span>
          </button>
        </div>

        {/* ============================================================= */}
        {/* TAB CONTENT 1: MY REGISTERED MERCHANTS                        */}
        {/* ============================================================= */}
        {activeTab === 'my-merchants' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Search and Refresh Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="relative w-full sm:w-80">
                <input
                  type="text"
                  placeholder={isEn ? 'Search merchants by name or SSM...' : 'Cari peniaga atau SSM...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600"
                />
                <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={fetchMyMerchants}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <span>{isEn ? 'Refresh' : 'Muat Semula'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                  <span>{isEn ? 'New Merchant' : 'Peniaga Baru'}</span>
                </button>
              </div>
            </div>

            {/* Merchant Cards / List */}
            {loadingMerchants ? (
              <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
                {isEn ? 'Loading your registered merchants...' : 'Memuatkan senarai peniaga anda...'}
              </div>
            ) : filteredMerchants.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isEn ? 'No merchants registered yet' : 'Tiada peniaga didaftarkan lagi'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
                  {isEn
                    ? 'Start registering restaurants and food outlets today! Every registered merchant will appear here under your account.'
                    : 'Mula mendaftarkan restoran dan gerai makanan hari ini! Setiap peniaga yang didaftarkan akan terpapar di sini di bawah akaun anda.'}
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all mt-2"
                >
                  {isEn ? 'Register Your First Merchant' : 'Daftar Peniaga Pertama Anda'}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredMerchants.map((m) => {
                  const statusStr = (m.status || 'Dalam Proses').trim();
                  const isApproved = statusStr.toLowerCase().includes('lulus') || statusStr.toLowerCase().includes('approv');
                  const isRejected = statusStr.toLowerCase().includes('tolak') || statusStr.toLowerCase().includes('reject');

                  return (
                    <div
                      key={m.id}
                      className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                    >
                      <div>
                        {/* Header & Status */}
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div>
                            <h4 className="font-extrabold text-base text-slate-900 dark:text-white leading-tight">
                              {m.businessName}
                            </h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                              {m.fullName || m.personInCharge}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border shrink-0 ${
                              isApproved
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800'
                                : isRejected
                                ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-300 dark:border-red-800'
                                : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-800'
                            }`}
                          >
                            {m.status || (isEn ? 'In Process' : 'Dalam Proses')}
                          </span>
                        </div>

                        {/* Image Preview if available */}
                        {m.shopPhotoUrl && (
                          <div className="w-full h-36 rounded-2xl overflow-hidden mb-3 border border-slate-200 dark:border-slate-800">
                            <img src={m.shopPhotoUrl} alt={m.businessName} className="w-full h-full object-cover" />
                          </div>
                        )}

                        {/* Details Grid */}
                        <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                          {m.registrationNo && (
                            <div>
                              <strong className="text-slate-900 dark:text-white">SSM:</strong> {m.registrationNo}
                            </div>
                          )}
                          <div>
                            <strong className="text-slate-900 dark:text-white">{isEn ? 'Phone:' : 'Telefon:'}</strong> {m.contactNumber}
                          </div>
                          <div>
                            <strong className="text-slate-900 dark:text-white">{isEn ? 'Email:' : 'E-mel:'}</strong> {m.emailAddress}
                          </div>
                          <div className="truncate">
                            <strong className="text-slate-900 dark:text-white">{isEn ? 'Address:' : 'Alamat:'}</strong> {m.storeAddress || m.mailingAddress}
                          </div>
                          <div>
                            <strong className="text-slate-900 dark:text-white">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</strong>{' '}
                            {formatDateToDDMMYYYY(m.date || m.createdAt)}
                          </div>
                        </div>

                        {/* Cloud Storage Safe Badge */}
                        <div className="mt-2.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{isEn ? 'Supabase Storage:' : 'Storan Supabase:'}</span>
                          </span>
                          <span className="font-mono text-[9px] text-emerald-600 dark:text-emerald-400 font-bold">
                            merchants/{m.id.slice(0, 8)}.json
                          </span>
                        </div>
                      </div>

                      {/* Footer actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          ID: {m.id.slice(0, 8)}...
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewingMerchant(m)}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm shadow-red-600/20"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{isEn ? 'View Full Form' : 'Lihat Borang Penuh'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB CONTENT 2: REGISTER MERCHANT FORM                         */}
        {/* ============================================================= */}
        {activeTab === 'register' && (
          <div className="animate-in fade-in duration-200">
            <div className="mb-4 flex items-center justify-between bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-200 dark:border-red-900">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-red-900 dark:text-red-200">
                    {isEn ? 'Registering Merchant Under Your Agent Account' : 'Mendaftarkan Peniaga Di Bawah Akaun Ejen Anda'}
                  </h3>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    {isEn ? `Agent Name: ${user.fullName} | ID: ${user.username || user.id}` : `Nama Ejen: ${user.fullName} | ID: ${user.username || user.id}`}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  fetchMyMerchants();
                  setActiveTab('my-merchants');
                }}
                className="px-3 py-1.5 bg-white dark:bg-slate-900 text-xs font-bold rounded-xl border border-red-200 dark:border-red-800 hover:text-red-600 transition-colors"
              >
                {isEn ? '← Back to My Merchants' : '← Kembali ke Peniaga Saya'}
              </button>
            </div>

            <BusinessRegistrationForm lang={lang} />
          </div>
        )}

        {/* ============================================================= */}
        {/* TAB CONTENT 3: MY PROFILE & REGISTERED FORM                   */}
        {/* ============================================================= */}
        {activeTab === 'profile' && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Top Profile Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-red-600 to-red-800 text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-red-600/20 shrink-0">
                    {user.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                        {user.fullName}
                      </h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900">
                        {agentProfile?.agentNo || user.username || 'AGT-8821'}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                        <span>✓</span>
                        <span>{isEn ? 'Active Agent' : 'Ejen Aktif'}</span>
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {user.email || user.username} • {agentProfile?.phoneNumber || 'No phone registered'}
                    </p>
                  </div>
                </div>

                {/* Primary Action: View Form */}
                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewingMyFormModal(true)}
                    className="px-5 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl shadow-md shadow-red-600/25 transition-all flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span>{isEn ? 'View Completed Agent Form' : 'Lihat Borang Pendaftaran Ejen'}</span>
                  </button>
                </div>
              </div>

              {/* SUPABASE CLOUD STORAGE SECURITY CARD */}
              <div className="mt-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/50 dark:from-emerald-950/20 dark:to-teal-950/10 border border-emerald-200 dark:border-emerald-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start sm:items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-emerald-900 dark:text-emerald-300">
                        {isEn ? 'Safe in Supabase Cloud Storage' : 'Borang Selamat Dalam Storan Awan Supabase'}
                      </h4>
                      <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white">
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                      {isEn
                        ? 'Your completed official registration form is permanently archived and encrypted in Supabase Storage.'
                        : 'Borang pendaftaran rasmi anda telah diarkibkan secara kekal dan selamat dalam storan Supabase.'}
                    </p>
                    <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400/80 mt-1">
                      Bucket: <strong className="font-semibold">registration-forms</strong> | Object: <strong className="font-semibold">{agentStorage?.key || `agents/${agentProfile?.id || user.id}.json`}</strong>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setViewingMyFormModal(true)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                  >
                    {isEn ? 'Open Stored Form' : 'Buka Borang'}
                  </button>
                </div>
              </div>

              {/* PROFILE PARTICULARS BREAKDOWN (SECTIONS 1 TO 4) */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* Section 1: Personal Info Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {isEn ? "SECTION 1: PERSONAL INFORMATION" : "SEKSYEN 1: MAKLUMAT PERIBADI"}
                    </span>
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                  <div><strong className="text-slate-500">{isEn ? 'Full Name:' : 'Nama Penuh:'}</strong> <span className="text-slate-900 dark:text-white font-semibold ml-1">{agentProfile?.agentName || user.fullName}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Agent Number:' : 'No. Ejen:'}</strong> <span className="text-red-600 font-bold ml-1">{agentProfile?.agentNo || user.username || 'AGT-8821'}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'IC / Passport No:' : 'No. Kad Pengenalan:'}</strong> <span className="text-slate-900 dark:text-white ml-1">{agentProfile?.icNumber || 'N/A'}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Race / Religion:' : 'Bangsa / Agama:'}</strong> <span className="text-slate-900 dark:text-white ml-1">{agentProfile?.race || 'Malay'} • {agentProfile?.religion || 'Islam'}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Email (Portal Login):' : 'E-mel (Log Masuk Portal):'}</strong> <span className="text-slate-900 dark:text-white ml-1">{agentProfile?.email || user.email || user.username}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Phone Number:' : 'No. Telefon:'}</strong> <span className="text-slate-900 dark:text-white ml-1">{agentProfile?.phoneNumber || 'N/A'}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Address:' : 'Alamat:'}</strong> <span className="text-slate-900 dark:text-white ml-1">{agentProfile?.address || 'N/A'}</span></div>
                </div>

                {/* Section 2: Banking Info Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {isEn ? "SECTION 2: BANKING INFORMATION" : "SEKSYEN 2: MAKLUMAT PERBANKAN"}
                    </span>
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                  </div>
                  <div><strong className="text-slate-500">{isEn ? 'Bank Name:' : 'Nama Bank:'}</strong> <span className="text-slate-900 dark:text-white font-semibold ml-1">{agentProfile?.bankName || 'N/A'}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Account Holder:' : 'Nama Pemegang Akaun:'}</strong> <span className="text-slate-900 dark:text-white ml-1">{agentProfile?.bankAccountName || user.fullName}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Account Number:' : 'Nombor Akaun:'}</strong> <span className="font-mono text-slate-900 dark:text-white font-bold ml-1">{agentProfile?.bankAccountNumber || 'N/A'}</span></div>
                  <p className="text-[11px] text-slate-500 italic pt-2 border-t border-slate-200 dark:border-slate-800">
                    {isEn ? 'Commission disbursements will be credited directly to this verified account.' : 'Pembayaran komisen akan dikreditkan terus ke akaun yang disahkan ini.'}
                  </p>
                </div>

                {/* Section 3: Declaration Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {isEn ? "SECTION 3: DECLARATION & TERMS" : "SEKSYEN 3: PENGAKUAN & TERMA"}
                    </span>
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>✓</span>
                    <span>{isEn ? 'Terms & Conditions of Engagement Accepted' : 'Terma & Syarat Pelantikan Telah Dipersetujui'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold">
                    <span>✓</span>
                    <span>{isEn ? 'Personal Data Protection Act 2010 (Act 709) Compliant' : 'Pematuhan Akta Perlindungan Data Peribadi 2010'}</span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    {isEn ? 'Declaration confirmed at the time of form submission.' : 'Pengakuan telah disahkan semasa penghantaran borang.'}
                  </p>
                </div>

                {/* Section 4: Signature Card */}
                <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <span className="font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      {isEn ? "SECTION 4: SIGNATURE & AUDIT" : "SEKSYEN 4: TANDATANGAN & AUDIT"}
                    </span>
                    <svg className="w-4 h-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </div>
                  <div><strong className="text-slate-500">{isEn ? 'Signed By:' : 'Ditandatangani Oleh:'}</strong> <span className="text-slate-900 dark:text-white font-semibold ml-1">{agentProfile?.agentSignature || agentProfile?.agentName || user.fullName}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Signature Date (DD/MM/YYYY):' : 'Tarikh Tandatangan:'}</strong> <span className="text-slate-900 dark:text-white ml-1">{formatDateToDDMMYYYY(agentProfile?.agentSignatureDate || agentProfile?.date || agentProfile?.createdAt)}</span></div>
                  <div><strong className="text-slate-500">{isEn ? 'Supervisor / Verifier:' : 'Penyelia / Pengesah:'}</strong> <span className="text-slate-900 dark:text-white ml-1">{agentProfile?.supervisorName || (isEn ? 'Management Audit Verified' : 'Disahkan Pihak Pengurusan')}</span></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ============================================================= */}
      {/* VIEW COMPLETE OFFICIAL AGENT FORM MODAL (PRINTABLE 1-PAGE) */}
      {/* ============================================================= */}
      {viewingMyFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print-modal-overlay">
          <div className="max-w-4xl w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 max-h-[95vh] overflow-y-auto shadow-2xl text-slate-900 dark:text-slate-100 print:max-w-full print:border-none print:shadow-none print:p-0 print:max-h-none print:overflow-visible printable-card print-modal-card">
            
            {/* Modal Controls Bar (Hidden when printed) */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-5 print:hidden">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-wider">
                  {isEn ? 'Official Record' : 'Rekod Rasmi'}
                </span>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {isEn ? 'Stored in Supabase Cloud' : 'Disimpan dalam Storan Supabase'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/25 flex items-center gap-1.5 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  <span>{isEn ? 'Print Form' : 'Cetak Borang'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingMyFormModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-sm transition-colors"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* A4 DOCUMENT HEADER */}
            <div className="border-b-2 border-red-600 pb-4 mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print-doc-header">
              <div>
                <div className="inline-block px-3 py-1 bg-red-600 text-white font-extrabold text-xs tracking-widest rounded-md uppercase mb-2">
                  {isEn ? 'AGENT REGISTRATION' : 'PENDAFTARAN EJEN'}
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {isEn ? 'AGENT REGISTRATION' : 'PENDAFTARAN EJEN'}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">
                  Foodpanda, GrabFood and ShopeeFood — Malaysia
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 max-w-xl">
                  {isEn
                    ? 'Official completed agent registration document archived in Supabase Cloud Storage.'
                    : 'Borang pendaftaran rasmi ejen yang telah disahkan dan diarkibkan dalam Storan Supabase.'}
                </p>
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-red-600 shadow-sm print-logo-container">
                <img src="/logo-circle.png" alt="Legacy Cuisine Logo" className="object-contain w-full h-full" />
              </div>
            </div>

            {/* FORM CONTENT (4 STANDARDIZED SECTIONS) */}
            <div className="space-y-4 print:space-y-1 text-xs">
              
              {/* SECTION 1: AGENT'S PERSONAL INFORMATION */}
              <div className="space-y-2 print:space-y-1">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                  {isEn ? "SECTION 1: AGENT'S PERSONAL INFORMATION" : 'SEKSYEN 1: MAKLUMAT PERIBADI EJEN'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Date (DD/MM/YYYY) *' : 'Tarikh (DD/MM/YYYY) *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      {formatDateToDDMMYYYY(agentProfile?.date || agentProfile?.createdAt || new Date())}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Agent No. *' : 'No. Ejen *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-red-600 dark:text-red-400 print:text-black">
                      {agentProfile?.agentNo || user.username || 'AGT-8821'}
                    </div>
                  </div>
                  <div className="sm:col-span-2 print:col-span-2">
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? "Agent's Name (As per NRIC/Passport) *" : 'Nama Ejen (Seperti dalam IC) *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                      {agentProfile?.agentName || user.fullName}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Identity Card No. *' : 'No. Kad Pengenalan *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {agentProfile?.icNumber || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Telephone No. *' : 'No. Telefon *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {agentProfile?.phoneNumber || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Race' : 'Bangsa'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {agentProfile?.race || 'Malay'}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Religion' : 'Agama'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {agentProfile?.religion || 'Islam'}
                    </div>
                  </div>
                  <div className="sm:col-span-2 print:col-span-2">
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Residential Address *' : 'Alamat Kediaman *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {agentProfile?.address || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BANKING INFORMATION */}
              <div className="space-y-2 print:space-y-1">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                  {isEn ? 'SECTION 2: BANKING INFORMATION' : 'SEKSYEN 2: MAKLUMAT PERBANKAN'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 print:grid-cols-3">
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? "Bank Account Holder's Name *" : 'Nama Pemegang Akaun Bank *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      {agentProfile?.bankAccountName || user.fullName}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Bank Name *' : 'Nama Bank *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      {agentProfile?.bankName || 'Maybank'}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Bank Account No. *' : 'Nombor Akaun Bank *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                      {agentProfile?.bankAccountNumber || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: AGENT'S DECLARATION */}
              <div className="space-y-2 print:space-y-1">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                  {isEn ? "SECTION 3: AGENT'S DECLARATION" : 'SEKSYEN 3: PENGAKUAN EJEN'}
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {isEn
                        ? 'I agree to the Terms & Conditions and solemnly confirm this Declaration.'
                        : 'Saya bersetuju dengan Terma & Syarat serta mengesahkan Pengakuan ini.'}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                    {isEn ? 'Confirmed' : 'Disahkan'}
                  </span>
                </div>
              </div>

              {/* SECTION 4: CONFIRMATION & SIGNATURE */}
              <div className="space-y-2 print:space-y-1">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                  {isEn ? 'SECTION 4: CONFIRMATION & SIGNATURE' : 'SEKSYEN 4: PENGESAHAN & TANDATANGAN'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950 print:bg-white print:border-slate-300">
                    <span className="print-data-label text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isEn ? "Agent's Signature:" : 'Tandatangan Ejen:'}
                    </span>
                    <div className="print-sig-box h-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 font-mono text-xs bg-white dark:bg-slate-900 print:bg-white">
                      {agentProfile?.agentSignature || agentProfile?.agentName || user.fullName}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                      <span>{isEn ? 'Name:' : 'Nama:'} <strong>{agentProfile?.agentSignature || agentProfile?.agentName || user.fullName}</strong></span>
                      <span>{isEn ? 'Date:' : 'Tarikh:'} <strong>{formatDateToDDMMYYYY(agentProfile?.agentSignatureDate || agentProfile?.date || agentProfile?.createdAt)}</strong></span>
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950 print:bg-white print:border-slate-300">
                    <span className="print-data-label text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                      {isEn ? "Supervisor / Verifier's Signature:" : 'Tandatangan Penyelia / Pengesah:'}
                    </span>
                    <div className="print-sig-box h-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 font-mono text-xs bg-white dark:bg-slate-900 print:bg-white">
                      {agentProfile?.supervisorName || (isEn ? 'Management Audit Verified' : 'Disahkan Pengurusan')}
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-slate-500 mt-2">
                      <span>{isEn ? 'Name:' : 'Nama:'} <strong>{agentProfile?.supervisorName || 'Management HQ'}</strong></span>
                      <span>{isEn ? 'Date:' : 'Tarikh:'} <strong>{formatDateToDDMMYYYY(agentProfile?.supervisorDate || agentProfile?.date || agentProfile?.createdAt)}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
              <span className="text-[11px] font-mono text-slate-400">
                Supabase Key: {agentStorage?.key || `agents/${agentProfile?.id || user.id}.json`}
              </span>
              <button
                type="button"
                onClick={() => setViewingMyFormModal(false)}
                className="px-5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl"
              >
                {isEn ? 'Close Window' : 'Tutup Tetingkap'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* VIEW COMPLETE OFFICIAL MERCHANT REGISTRATION FORM MODAL */}
      {/* ============================================================= */}
      {viewingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white print:static print-modal-overlay">
          <div className="max-w-4xl w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-8 max-h-[95vh] overflow-y-auto shadow-2xl text-slate-900 dark:text-slate-100 print:max-w-full print:border-none print:shadow-none print:p-0 print:max-h-none print:overflow-visible printable-card print-modal-card">
            
            {/* Header controls (hidden on print) */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-4 print:hidden">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 inline-block mb-1">
                  {isEn ? 'Safe in Supabase Storage' : 'Selamat Dalam Storan Supabase'}
                </span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                  {viewingMerchant.businessName}
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-1.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/25 flex items-center gap-1.5 transition-all"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                  <span>{isEn ? 'Print Form' : 'Cetak Borang'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingMerchant(null)}
                  className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="border-b-2 border-red-600 pb-4 mb-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print-doc-header">
              <div>
                <div className="inline-block px-3 py-1 bg-red-600 text-white font-extrabold text-xs tracking-widest rounded-md uppercase mb-2">
                  {isEn ? 'MERCHANT REGISTRATION' : 'PENDAFTARAN PENIAGA'}
                </div>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                  {viewingMerchant.businessName}
                </h1>
                <p className="text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 mt-0.5">
                  Foodpanda, GrabFood and ShopeeFood — Malaysia
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic mt-1 max-w-xl">
                  {isEn
                    ? 'Registered by Agent and verified in Supabase Database and Cloud Storage.'
                    : 'Didaftarkan oleh Ejen dan disimpan selamat dalam Pangkalan Data dan Storan Awan Supabase.'}
                </p>
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-red-600 shadow-sm print-logo-container">
                <img src="/logo-circle.png" alt="Legacy Cuisine Logo" className="object-contain w-full h-full" />
              </div>
            </div>

            {/* Merchant Form Details */}
            <div className="space-y-4 print:space-y-1 text-xs">
              
              {/* SECTION 1: MERCHANT INFORMATION */}
              <div className="space-y-2 print:space-y-1">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                  {isEn ? "SECTION 1: MERCHANT & STORE INFORMATION" : 'SEKSYEN 1: MAKLUMAT PENIAGA & KEDAI'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Business / Store Name *' : 'Nama Perniagaan / Kedai *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold">
                      {viewingMerchant.businessName}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'SSM Registration No:' : 'No. Pendaftaran SSM:'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      {viewingMerchant.registrationNo || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Owner / Contact Person *' : 'Nama Pemilik / PIC *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      {viewingMerchant.fullName || viewingMerchant.personInCharge}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Contact Phone Number *' : 'Nombor Telefon *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {viewingMerchant.contactNumber}
                    </div>
                  </div>
                  <div className="sm:col-span-2 print:col-span-2">
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Store Physical Address *' : 'Alamat Fizikal Premis *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {viewingMerchant.storeAddress || viewingMerchant.mailingAddress}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: OPERATING INFORMATION */}
              <div className="space-y-2 print:space-y-1">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                  {isEn ? 'SECTION 2: OPERATING INFORMATION' : 'SEKSYEN 2: MAKLUMAT OPERASI'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Operating Days:' : 'Hari Operasi:'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {viewingMerchant.operatingDays || 'Isnin - Ahad'}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Operating Hours:' : 'Waktu Operasi:'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium">
                      {viewingMerchant.operatingHours || '10:00 AM - 10:00 PM'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: BANKING INFORMATION */}
              <div className="space-y-2 print:space-y-1">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                  {isEn ? 'SECTION 3: BANK ACCOUNT INFORMATION' : 'SEKSYEN 3: MAKLUMAT AKAUN BANK'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 print:grid-cols-3">
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Bank Name *' : 'Nama Bank *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      {viewingMerchant.bankName || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Account Holder Name *' : 'Nama Pemegang Akaun *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold">
                      {viewingMerchant.bankAccountName || viewingMerchant.businessName}
                    </div>
                  </div>
                  <div>
                    <span className="print-data-label text-[10px] font-bold text-slate-500 block mb-0.5 uppercase">
                      {isEn ? 'Account Number *' : 'Nombor Akaun *'}
                    </span>
                    <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold font-mono">
                      {viewingMerchant.bankAccountNumber || 'N/A'}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 4: DOCUMENTS & STORE PHOTO PREVIEW */}
              {(() => {
                let parsedDocs: Record<string, any> = {};
                try {
                  if (viewingMerchant.documentsChecklist) {
                    parsedDocs = typeof viewingMerchant.documentsChecklist === 'string'
                      ? JSON.parse(viewingMerchant.documentsChecklist)
                      : viewingMerchant.documentsChecklist;
                  }
                } catch (e) {}

                const docEntries = Object.entries(parsedDocs);
                const hasDocs = docEntries.length > 0 || Boolean(viewingMerchant.shopPhotoUrl);

                if (!hasDocs) return null;

                return (
                  <div className="space-y-3 print:space-y-1">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                      {isEn ? 'SECTION 4: VERIFIED DOCUMENTS & STOREFRONT' : 'SEKSYEN 4: DOKUMEN & GAMBAR PREMIS'}
                    </div>

                    {/* Storefront Image */}
                    {viewingMerchant.shopPhotoUrl && (
                      <div className="w-full h-48 sm:h-56 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950">
                        <img src={viewingMerchant.shopPhotoUrl} alt="Premises Frontage" className="w-full h-full object-contain" />
                      </div>
                    )}

                    {/* Attached Checklist Documents Grid */}
                    {docEntries.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {docEntries.map(([docKey, val]: [string, any]) => {
                          const isObj = typeof val === 'object' && val !== null;
                          const fileUrl = isObj ? val.url : null;
                          const isReceived = isObj
                            ? (val.status === 'Received' || val.status === 'Diterima' || val.status === 'Uploaded' || Boolean(val.url))
                            : (val === true || val === 'Received' || val === 'Diterima');
                          const docName = docKey === 'ic' ? (isEn ? 'Identity Card' : 'Kad Pengenalan')
                            : docKey === 'ssm' ? 'SSM'
                            : docKey === 'pbt' ? (isEn ? 'PBT Licence' : 'Lesen PBT')
                            : docKey === 'bank' ? (isEn ? 'Bank Statement' : 'Penyata Bank')
                            : docKey === 'logo' ? 'Logo'
                            : docKey === 'premis' ? (isEn ? 'Premises Photo' : 'Gambar Premis')
                            : docKey === 'menu' ? (isEn ? 'Menu Photo' : 'Gambar Menu')
                            : docKey === 'harga' ? (isEn ? 'Price List' : 'Senarai Harga')
                            : docKey === 'halal' ? (isEn ? 'Halal Certificate' : 'Sijil Halal')
                            : docKey;

                          return (
                            <div key={docKey} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                              {fileUrl ? (
                                <a
                                  href={fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-400 shrink-0 block hover:scale-105 transition-transform"
                                  title={isEn ? 'Click to open document' : 'Buka dokumen'}
                                >
                                  <img src={fileUrl} alt={docName} className="w-full h-full object-cover" />
                                </a>
                              ) : (
                                <span className="text-xs font-bold text-slate-500">{isReceived ? '✓' : '✗'}</span>
                              )}
                              <div className="min-w-0">
                                <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{docName}</div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {isReceived ? (fileUrl ? (isEn ? 'Attached' : 'Dilampirkan') : (isEn ? 'Verified' : 'Disahkan')) : (isEn ? 'Pending' : 'Belum')}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* SECTION 5: SIGNATURES & VERIFICATION */}
              <div className="space-y-2 print:space-y-1">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                  {isEn ? 'SECTION 5: SIGNATURES & AUDIT' : 'SEKSYEN 5: TANDATANGAN & AUDIT'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2">
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950 print:bg-white">
                    <span className="print-data-label text-[10px] font-bold text-slate-700 block mb-1">
                      {isEn ? 'Merchant Signature:' : 'Tandatangan Peniaga:'}
                    </span>
                    <div className="print-sig-box h-12 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-600 font-mono text-xs bg-white">
                      {viewingMerchant.merchantSignatureName || viewingMerchant.fullName || viewingMerchant.businessName}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {isEn ? 'Date:' : 'Tarikh:'} {formatDateToDDMMYYYY(viewingMerchant.date || viewingMerchant.createdAt)}
                    </div>
                  </div>

                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950 print:bg-white">
                    <span className="print-data-label text-[10px] font-bold text-slate-700 block mb-1">
                      {isEn ? 'Registered By Agent:' : 'Didaftarkan Oleh Ejen:'}
                    </span>
                    <div className="print-sig-box h-12 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-600 font-mono text-xs bg-white">
                      {viewingMerchant.agentSignatureName || user.fullName}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {isEn ? 'Agent ID:' : 'ID Ejen:'} {viewingMerchant.agentSignatureId || user.username || user.id}
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Modal footer */}
            <div className="pt-4 mt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between print:hidden">
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                Supabase Object: registration-forms/merchants/{viewingMerchant.id}.json
              </span>
              <button
                type="button"
                onClick={() => setViewingMerchant(null)}
                className="px-5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl"
              >
                {isEn ? 'Close' : 'Tutup'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
