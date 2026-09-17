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
  const [activeTab, setActiveTab] = useState<'register' | 'my-merchants'>('my-merchants');
  const [merchants, setMerchants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingMerchant, setViewingMerchant] = useState<any | null>(null);

  const fetchMyMerchants = async () => {
    setLoading(true);
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
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyMerchants();
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
      {/* 🌟 AGENT PORTAL TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-3 sm:px-6 md:px-8 py-2.5 sm:py-3.5 flex items-center justify-between shadow-sm safe-top">
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
            className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-amber-500 border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-xs sm:text-sm"
            title="Toggle theme"
          >
            {theme === 'light' ? '☀️' : '🌙'}
          </button>

          {/* User Profile Pill */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-red-700 text-white font-black text-xs flex items-center justify-center">
              {user.fullName.charAt(0)}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {user.fullName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400">
                {user.email || user.username}
              </div>
            </div>
          </div>

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

      {/* 🚀 AGENT DASHBOARD BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        
        {/* Agent Welcome & Summary Header */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-600/30 text-red-300 border border-red-500/40 inline-block mb-3">
                {isEn ? 'Authorized Acquisition Agent' : 'Ejen Pengambilan Sah'}
              </span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                {isEn ? `Welcome back, ${user.fullName}!` : `Selamat kembali, ${user.fullName}!`}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1.5 max-w-2xl leading-relaxed">
                {isEn
                  ? 'Manage your merchant recruitment applications, track registration status, and onboard new food establishments under your account.'
                  : 'Urus permohonan peniaga anda, jejaki status pendaftaran, dan daftarkan premis makanan baharu di bawah akaun anda.'}
              </p>
            </div>

            {/* Quick Action Button */}
            <button
              type="button"
              onClick={() => setActiveTab('register')}
              className="px-5 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider rounded-2xl shadow-lg shadow-red-600/30 transition-all transform active:scale-98 flex items-center justify-center gap-2 shrink-0 self-start md:self-auto"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>{isEn ? 'Register New Merchant' : 'Daftar Peniaga Baru'}</span>
            </button>
          </div>
        </div>

        {/* 📊 PERFORMANCE STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Card 1: Total Merchants Registered */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                {isEn ? 'Total Merchants Registered' : 'Jumlah Peniaga Didaftarkan'}
              </p>
              <h3 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white mt-2">
                {loading ? '...' : totalCount}
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
                {loading ? '...' : approvedCount}
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
                {loading ? '...' : inProcessCount}
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

        {/* 📑 AGENT NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 overflow-x-auto no-scrollbar">
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
        </div>

        {/* TAB CONTENT 1: MY REGISTERED MERCHANTS */}
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
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">🔍</span>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                  type="button"
                  onClick={fetchMyMerchants}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <span>🔄</span>
                  <span>{isEn ? 'Refresh' : 'Muat Semula'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <span>➕</span>
                  <span>{isEn ? 'New Merchant' : 'Peniaga Baru'}</span>
                </button>
              </div>
            </div>

            {/* Merchant Cards / List */}
            {loading ? (
              <div className="p-12 text-center text-slate-400 text-sm animate-pulse">
                {isEn ? 'Loading your registered merchants...' : 'Memuatkan senarai peniaga anda...'}
              </div>
            ) : filteredMerchants.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto text-2xl">
                  🏪
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
                      </div>

                      {/* Footer actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <span className="text-[10px] text-slate-400">
                          ID: {m.id.slice(0, 8)}...
                        </span>
                        <button
                          type="button"
                          onClick={() => setViewingMerchant(m)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-xs font-bold transition-all flex items-center gap-1"
                        >
                          <span>📄</span>
                          <span>{isEn ? 'View Application' : 'Lihat Borang'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB CONTENT 2: REGISTER MERCHANT FORM */}
        {activeTab === 'register' && (
          <div className="animate-in fade-in duration-200">
            <div className="mb-4 flex items-center justify-between bg-red-50 dark:bg-red-950/30 p-4 rounded-2xl border border-red-200 dark:border-red-900">
              <div className="flex items-center gap-2">
                <span className="text-xl">✍️</span>
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
      </main>

      {/* 📄 VIEW MERCHANT APPLICATION MODAL */}
      {viewingMerchant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-h-[90vh] overflow-y-auto shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  {isEn ? 'Official Merchant Record' : 'Rekod Rasmi Peniaga'}
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  {viewingMerchant.businessName}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setViewingMerchant(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div><strong>{isEn ? 'Status:' : 'Status:'}</strong> {viewingMerchant.status || 'Dalam Proses'}</div>
                <div><strong>{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</strong> {formatDateToDDMMYYYY(viewingMerchant.date || viewingMerchant.createdAt)}</div>
                <div><strong>{isEn ? 'Contact Person:' : 'Orang Dihubungi:'}</strong> {viewingMerchant.fullName || viewingMerchant.personInCharge}</div>
                <div><strong>{isEn ? 'Phone Number:' : 'No. Telefon:'}</strong> {viewingMerchant.contactNumber}</div>
                <div><strong>{isEn ? 'Email Address:' : 'Alamat E-mel:'}</strong> {viewingMerchant.emailAddress}</div>
                <div><strong>{isEn ? 'SSM Reg No:' : 'No. SSM:'}</strong> {viewingMerchant.registrationNo || 'N/A'}</div>
              </div>

              <div>
                <strong className="block text-slate-500 mb-1">{isEn ? 'Premises Store Address:' : 'Alamat Premis Perniagaan:'}</strong>
                <p className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  {viewingMerchant.storeAddress || viewingMerchant.mailingAddress}
                </p>
              </div>

              {viewingMerchant.bankName && (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <strong>{isEn ? 'Banking Details:' : 'Maklumat Perbankan:'}</strong>{' '}
                  {viewingMerchant.bankName} — {viewingMerchant.bankAccountNumber} ({viewingMerchant.bankAccountName})
                </div>
              )}

              {viewingMerchant.shopPhotoUrl && (
                <div>
                  <strong className="block text-slate-500 mb-1">{isEn ? 'Premises Photo:' : 'Gambar Premis:'}</strong>
                  <div className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
                    <img src={viewingMerchant.shopPhotoUrl} alt="Store frontage" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setViewingMerchant(null)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-bold rounded-xl"
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
