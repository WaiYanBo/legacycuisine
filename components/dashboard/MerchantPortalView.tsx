'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Locale } from '../../lib/i18n';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';

interface MerchantUser {
  id: string;
  username: string;
  fullName: string;
  email?: string;
  role: string;
  department?: string;
  position?: string;
}

interface MerchantPortalViewProps {
  user: MerchantUser;
  lang: Locale;
  theme: 'light' | 'dark';
  onToggleLang: (lang: 'en' | 'ms') => void;
  onToggleTheme: () => void;
  onLogout: () => void;
}

export default function MerchantPortalView({
  user,
  lang,
  theme,
  onToggleLang,
  onToggleTheme,
  onLogout,
}: MerchantPortalViewProps) {
  const isEn = lang === 'en';

  const [merchantProfile, setMerchantProfile] = useState<any | null>(null);
  const [merchantStorage, setMerchantStorage] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);

  // Fetch Merchant Profile & Supabase Storage details
  const fetchMerchantProfile = async () => {
    setLoading(true);
    try {
      const emailParam = encodeURIComponent(user.email || user.username);
      const idParam = encodeURIComponent(user.id);
      const res = await fetch(`/api/merchant/profile?email=${emailParam}&id=${idParam}`);
      const json = await res.json();
      if (json.success && json.data) {
        setMerchantProfile(json.data);
        if (json.storage) {
          setMerchantStorage(json.storage);
        }
      }
    } catch (e) {
      console.error('Failed to fetch merchant profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMerchantProfile();
  }, [user]);

  // Download snapshot
  const downloadStorageJson = () => {
    if (!merchantProfile) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      archiveType: 'MERCHANT_REGISTRATION_FORM',
      archivedAt: new Date().toISOString(),
      storageBucket: 'registration-forms',
      storageKey: merchantStorage?.key || `merchants/${merchantProfile.id}.json`,
      data: merchantProfile,
    }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `merchant-registration-${merchantProfile.registrationNo || merchantProfile.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const statusDisplay = (status: string) => {
    const s = (status || '').toLowerCase();
    if (s.includes('lulus') || s.includes('approv')) return isEn ? 'Approved' : 'Diluluskan';
    if (s.includes('tolak') || s.includes('reject')) return isEn ? 'Rejected' : 'Ditolak';
    return isEn ? 'In Progress' : 'Dalam Proses';
  };

  // Parse document checklist if available
  let parsedChecklist: Record<string, any> = {};
  try {
    if (merchantProfile?.documentsChecklist) {
      parsedChecklist = typeof merchantProfile.documentsChecklist === 'string'
        ? JSON.parse(merchantProfile.documentsChecklist)
        : merchantProfile.documentsChecklist;
    }
  } catch (e) { }

  const [viewingDocModal, setViewingDocModal] = useState<{ title: string; url: string; fileName?: string } | null>(null);

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-black text-slate-900 dark:text-slate-100 flex flex-col overflow-x-hidden">
      {/* MERCHANT PORTAL TOP NAVIGATION BAR */}
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
              <span className="inline-block px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-wider bg-red-600 text-white shadow-sm">
                {isEn ? 'Merchant Portal' : 'Portal Peniaga'}
              </span>
            </div>
            <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {isEn ? 'Merchant Profile & Cloud Storage Records' : 'Profil Peniaga & Rekod Storan Awan'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
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

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-800/80">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-br from-red-600 to-red-700 text-white font-bold text-[11px] sm:text-xs flex items-center justify-center">
              {user.fullName.charAt(0).toUpperCase()}
            </div>
            <div className="hidden xs:block text-left">
              <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight max-w-[120px] truncate">
                {merchantProfile?.businessName || user.fullName}
              </span>
              <span className="block text-[9px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400 leading-tight">
                {isEn ? 'Merchant' : 'Peniaga'}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="px-2.5 sm:px-3 py-1.5 rounded-xl text-xs font-bold bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 hover:bg-red-600 hover:text-white transition-all flex items-center gap-1"
            title="Log out"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">{isEn ? 'Logout' : 'Keluar'}</span>
          </button>
        </div>
      </header>

      {/* MAIN CONTENT BODY */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 md:p-8 space-y-6">
        {/* TOP PROFILE BANNER */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-800 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-lg shadow-red-600/30">
              {(merchantProfile?.businessName || user.fullName).charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {merchantProfile?.businessName || user.fullName}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${(merchantProfile?.status || '').toLowerCase().includes('lulus') || (merchantProfile?.status || '').toLowerCase().includes('approv')
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                  : (merchantProfile?.status || '').toLowerCase().includes('tolak') || (merchantProfile?.status || '').toLowerCase().includes('reject')
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                    : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                  }`}>
                  {statusDisplay(merchantProfile?.status || 'Dalam Proses')}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isEn ? 'Person In Charge:' : 'Penama / PIC:'} <strong className="text-slate-700 dark:text-slate-300">{merchantProfile?.fullName || merchantProfile?.personInCharge || user.fullName}</strong> • {isEn ? 'SSM / Reg No:' : 'No. Pendaftaran:'} <strong className="text-slate-700 dark:text-slate-300">{merchantProfile?.registrationNo || 'N/A'}</strong>
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {merchantProfile?.emailAddress || user.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {merchantProfile?.contactNumber || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsFormModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs shadow-md shadow-red-600/25 flex items-center gap-2 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{isEn ? 'View Official Registration Form' : 'Lihat Borang Rasmi Pendaftaran'}</span>
            </button>
            <button
              type="button"
              onClick={downloadStorageJson}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all"
              title="Download Supabase Storage JSON Snapshot"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{isEn ? 'Download Snapshot' : 'Muat Turun Salinan'}</span>
            </button>
          </div>
        </div>

        {/* SUPABASE CLOUD STORAGE SECURITY CARD */}
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/30 rounded-2xl p-4 sm:p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-md shadow-emerald-500/30">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                  </span>
                  <span className="text-xs font-black tracking-wider uppercase text-emerald-700 dark:text-emerald-300">
                    {isEn ? 'Safe in Supabase Storage' : 'Selamat Disimpan di Storan Supabase'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {isEn
                    ? 'Your official merchant registration form snapshot and data are permanently secured in Supabase Cloud Object Storage.'
                    : 'Salinan dan borang rasmi pendaftaran peniaga anda disimpan dengan selamat secara kekal di Storan Objek Awan Supabase.'}
                </p>
                <div className="text-[11px] font-mono text-emerald-800 dark:text-emerald-400 mt-1.5">
                  Bucket: <strong className="font-semibold">registration-forms</strong> | Key: <strong className="font-semibold">{merchantStorage?.key || `merchants/${merchantProfile?.id || user.id}.json`}</strong>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <button
                type="button"
                onClick={() => setIsFormModalOpen(true)}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all flex items-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                <span>{isEn ? 'Print / View' : 'Cetak / Papar'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* PROFILE PARTICULARS BREAKDOWN (SECTIONS 1 TO 5) */}
        <div className="space-y-6">
          {/* SECTION 1: MAKLUMAT PENIAGA / PERSONAL DETAILS */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                {isEn ? "SECTION 1: MERCHANT'S PERSONAL DETAILS" : 'SEKSYEN 1: MAKLUMAT PERIBADI PENIAGA'}
              </h2>
              <span className="text-[10px] text-slate-400 font-mono">
                {merchantProfile?.date ? formatDateToDDMMYYYY(merchantProfile.date) : 'DD/MM/YYYY'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Full Name:' : 'Nama Penuh:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{merchantProfile?.fullName || user.fullName}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'IC / Passport No:' : 'No. Kad Pengenalan:'}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{merchantProfile?.icPassportNo || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Date of Birth (DD/MM/YYYY):' : 'Tarikh Lahir (DD/MM/YYYY):'}</span>
                <span className="text-slate-900 dark:text-white">{merchantProfile?.dateOfBirth ? formatDateToDDMMYYYY(merchantProfile.dateOfBirth) : 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Gender / Race / Religion:' : 'Jantina / Bangsa / Agama:'}</span>
                <span className="text-slate-900 dark:text-white">{merchantProfile?.gender || 'Lelaki'} • {merchantProfile?.race || 'Melayu'} • {merchantProfile?.religion || 'Islam'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Contact / Phone:' : 'No. Telefon:'}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{merchantProfile?.contactNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Email Address:' : 'Alamat Emel:'}</span>
                <span className="text-slate-900 dark:text-white">{merchantProfile?.emailAddress || user.email}</span>
              </div>
              <div className="sm:col-span-2 md:col-span-3">
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Store / Outlet Address:' : 'Alamat Premis Perniagaan:'}</span>
                <span className="text-slate-900 dark:text-white">{merchantProfile?.storeAddress || merchantProfile?.mailingAddress || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 2: MAKLUMAT OPERASI / BUSINESS OPERATIONS */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                {isEn ? 'SECTION 2: BUSINESS & STORE OPERATIONS' : 'SEKSYEN 2: MAKLUMAT OPERASI PERNIAGAAN'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Business Name:' : 'Nama Perniagaan:'}</span>
                <span className="font-bold text-slate-900 dark:text-white">{merchantProfile?.businessName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'SSM Registration No:' : 'No. Pendaftaran Perniagaan (SSM):'}</span>
                <span className="font-mono font-bold text-red-600 dark:text-red-400">{merchantProfile?.registrationNo || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Cuisine / Type of Food:' : 'Jenis Makanan:'}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{merchantProfile?.typeOfFood || 'Restoran / Makanan'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Operating Days:' : 'Hari Operasi:'}</span>
                <span className="text-slate-900 dark:text-white">{merchantProfile?.operatingDays || 'Isnin - Ahad'}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Operating Hours:' : 'Waktu Operasi:'}</span>
                <span className="text-slate-900 dark:text-white">{merchantProfile?.operatingHours || '10:00 AM - 10:00 PM'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 3: MAKLUMAT PERBANKAN / BANKING DETAILS */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                {isEn ? 'SECTION 3: BANKING INFORMATION' : 'SEKSYEN 3: MAKLUMAT PERBANKAN'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Bank Name:' : 'Nama Bank:'}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{merchantProfile?.bankName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Account Holder:' : 'Nama Pemegang Akaun:'}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{merchantProfile?.bankAccountName || merchantProfile?.fullName || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-[10px] uppercase font-bold text-slate-400">{isEn ? 'Account Number:' : 'Nombor Akaun Bank:'}</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{merchantProfile?.bankAccountNumber || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* SECTION 4: SENARAI SEMAK DOKUMEN & GAMBAR PREMIS */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                {isEn ? 'SECTION 4: VERIFIED DOCUMENTS & STOREFRONT' : 'SEKSYEN 4: SENARAI SEMAK DOKUMEN & PREMIS'}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-start">
              {/* Checklist Badges & Documents */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  {isEn ? 'Verified Documents Checklist:' : 'Senarai Semakan Dokumen Disahkan:'}
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {Object.keys(parsedChecklist).length > 0 ? (
                    Object.entries(parsedChecklist).map(([docKey, val]: [string, any]) => {
                      const isObj = typeof val === 'object' && val !== null;
                      const fileUrl = isObj ? val.url : null;
                      const fileName = isObj ? val.fileName : null;
                      const isReceived = isObj
                        ? (val.status === 'Received' || val.status === 'Diterima' || val.status === 'Uploaded' || Boolean(val.url))
                        : (val === true || val === 'Received' || val === 'Diterima');

                      const docName = docKey === 'ic' ? (isEn ? 'Identity Card' : 'Kad Pengenalan')
                        : docKey === 'ssm' ? (isEn ? 'SSM (Optional)' : 'SSM (Pilihan)')
                        : docKey === 'pbt' ? (isEn ? 'PBT Licence' : 'Lesen PBT')
                        : docKey === 'bank' ? (isEn ? 'Bank Statement' : 'Penyata Bank')
                        : docKey === 'logo' ? 'Logo'
                        : docKey === 'premis' ? (isEn ? 'Premises Photo' : 'Gambar Premis')
                        : docKey === 'menu' ? (isEn ? 'Menu Photo' : 'Gambar Menu')
                        : docKey === 'harga' ? (isEn ? 'Price List' : 'Senarai Harga')
                        : docKey === 'halal' ? (isEn ? 'Halal Certificate' : 'Sijil Halal')
                        : docKey.replace(/([A-Z])/g, ' $1');

                      return (
                        <div
                          key={docKey}
                          className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                            isReceived
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-semibold'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-400'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            {fileUrl ? (
                              <button
                                type="button"
                                onClick={() => setViewingDocModal({ title: docName, url: fileUrl, fileName })}
                                className="w-7 h-7 rounded-lg overflow-hidden border border-emerald-400 shrink-0 shadow-sm hover:scale-105 transition-transform"
                                title={isEn ? 'Click to inspect document' : 'Klik untuk lihat dokumen'}
                              >
                                <img src={fileUrl} alt={docName} className="w-full h-full object-cover" />
                              </button>
                            ) : (
                              <span>{isReceived ? '✓' : '✗'}</span>
                            )}
                            <span className="capitalize text-xs truncate">{docName}</span>
                          </div>

                          {fileUrl && (
                            <button
                              type="button"
                              onClick={() => setViewingDocModal({ title: docName, url: fileUrl, fileName })}
                              className="px-2 py-0.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold transition-all shrink-0"
                            >
                              {isEn ? 'View' : 'Lihat'}
                            </button>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500">
                      {isEn ? 'Documents verified during registration.' : 'Dokumen telah disahkan semasa pendaftaran.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Storefront Image */}
              <div>
                <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
                  {isEn ? 'Storefront / Premise Photo:' : 'Gambar Hadapan Premis Perniagaan:'}
                </span>
                {merchantProfile?.shopPhotoUrl ? (
                  <div
                    onClick={() =>
                      setViewingDocModal({
                        title: isEn ? 'Storefront & Premise Frontage' : 'Gambar Hadapan Premis Perniagaan',
                        url: merchantProfile.shopPhotoUrl,
                      })
                    }
                    className="w-full h-48 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 relative group cursor-pointer shadow-sm"
                  >
                    <img src={merchantProfile.shopPhotoUrl} alt="Storefront" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold text-xs gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                      </svg>
                      <span>{isEn ? 'Click to View Full Size' : 'Klik untuk Saiz Penuh'}</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-32 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 flex items-center justify-center text-xs text-slate-400">
                    {isEn ? 'No photo uploaded yet' : 'Tiada gambar premis dimuat naik'}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 5: PENGESAHAN & TANDATANGAN */}
          <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h2 className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                {isEn ? 'SECTION 5: CONFIRMATION & SIGNATURES' : 'SEKSYEN 5: PENGESAHAN & TANDATANGAN'}
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{isEn ? 'Merchant Signature:' : 'Tandatangan Peniaga:'}</span>
                <div className="font-bold text-slate-900 dark:text-white">{merchantProfile?.merchantSignatureName || merchantProfile?.fullName || user.fullName}</div>
                <div className="text-[11px] text-slate-500">IC: {merchantProfile?.merchantSignatureIc || merchantProfile?.icPassportNo || 'N/A'}</div>
                <div className="text-[11px] text-slate-500">{isEn ? 'Date:' : 'Tarikh:'} {formatDateToDDMMYYYY(merchantProfile?.merchantSignatureDate || merchantProfile?.createdAt)}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{isEn ? 'Registered By Agent:' : 'Didaftarkan Oleh Ejen:'}</span>
                <div className="font-bold text-red-600 dark:text-red-400">{merchantProfile?.agentSignatureName || merchantProfile?.agentEmail || (isEn ? 'Direct Registration' : 'Pendaftaran Terus')}</div>
                <div className="text-[11px] text-slate-500">ID: {merchantProfile?.agentSignatureId || merchantProfile?.agentUserId || 'N/A'}</div>
                <div className="text-[11px] text-slate-500">{isEn ? 'Date:' : 'Tarikh:'} {formatDateToDDMMYYYY(merchantProfile?.agentSignatureDate || merchantProfile?.createdAt)}</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 sm:col-span-2 md:col-span-1">
                <span className="text-[10px] font-bold text-slate-500 uppercase block">{isEn ? 'Reviewer / Approver:' : 'Pegawai Penyemak / Pelulus:'}</span>
                <div className="font-bold text-slate-900 dark:text-white">{merchantProfile?.processingOfficer || merchantProfile?.reviewerName || (isEn ? 'Management Audit Desk' : 'Audit Pengurusan')}</div>
                <div className="text-[11px] text-emerald-600 font-semibold">{statusDisplay(merchantProfile?.status || 'Dalam Proses')}</div>
                <div className="text-[11px] text-slate-500">{isEn ? 'Processed:' : 'Diproses:'} {formatDateToDDMMYYYY(merchantProfile?.receivedDate || merchantProfile?.createdAt)}</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* OFFICIAL MERCHANT REGISTRATION FORM MODAL (PRINTABLE) */}
      {isFormModalOpen && merchantProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn print-modal-overlay print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible">
          <div className="max-w-4xl w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-8 max-h-[94dvh] overflow-y-auto shadow-2xl space-y-6 text-slate-900 dark:text-slate-100 print-modal-card printable-card print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:max-h-none print:overflow-visible">

            {/* Modal Controls Bar */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 print:hidden">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-red-600 text-white font-extrabold text-xs tracking-wider rounded-lg uppercase">
                  {isEn ? 'OFFICIAL MERCHANT REGISTRATION FORM' : 'BORANG PENDAFTARAN PENIAGA RASMI'}
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  SSM: {merchantProfile.registrationNo || 'N/A'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>{isEn ? 'Print' : 'Cetak'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Document Header */}
            <div className="border-b-2 border-red-600 print:border-black pb-3 flex items-start justify-between gap-4 print-doc-header">
              <div className="flex-1">
                <span className="inline-block px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] tracking-wider rounded uppercase print:bg-black print:text-white print:px-2 print:py-0.5">
                  {isEn ? 'MERCHANT REGISTRATION' : 'PENDAFTARAN PENIAGA'}
                </span>
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black print:text-[14pt]">
                  {isEn ? 'OFFICIAL BUSINESS REGISTRATION & ONBOARDING' : 'BORANG PENDAFTARAN & ONBOARDING PERNIAGAAN'}
                </h1>
                <p className="text-xs font-bold text-red-600 dark:text-red-400 print:text-black">
                  Legacy Cuisine • Foodpanda, GrabFood & ShopeeFood Partner Network
                </p>
              </div>
              <div className="w-16 h-16 shrink-0 rounded-full bg-white p-1 border-2 border-red-600 print:border-black">
                <img src="/logo-circle.png" alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Form Section 1 */}
            <div className="space-y-1.5">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                {isEn ? "SECTION 1: MERCHANT'S PERSONAL DETAILS" : 'SEKSYEN 1: MAKLUMAT PERIBADI PENIAGA'}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-semibold">{formatDateToDDMMYYYY(merchantProfile.date || merchantProfile.createdAt)}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Member No / SSM:' : 'No. Ahli / SSM:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-bold text-red-600">{merchantProfile.memberNo || merchantProfile.registrationNo || 'N/A'}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Full Name:' : 'Nama Penuh:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-bold">{merchantProfile.fullName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'IC / Passport:' : 'No. Kad Pengenalan:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg">{merchantProfile.icPassportNo || 'N/A'}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Contact Number:' : 'No. Telefon:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg">{merchantProfile.contactNumber}</div>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Store Address:' : 'Alamat Premis:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg">{merchantProfile.storeAddress}</div>
                </div>
              </div>
            </div>

            {/* Form Section 2 */}
            <div className="space-y-1.5">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                {isEn ? 'SECTION 2: BUSINESS & OPERATIONS' : 'SEKSYEN 2: MAKLUMAT OPERASI PERNIAGAAN'}
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Business Name:' : 'Nama Perniagaan:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-bold">{merchantProfile.businessName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'SSM Number:' : 'No. Pendaftaran (SSM):'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-mono font-bold">{merchantProfile.registrationNo}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Food Cuisine:' : 'Jenis Masakan:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg">{merchantProfile.typeOfFood}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Operating Hours:' : 'Waktu Operasi:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg">{merchantProfile.operatingHours}</div>
                </div>
              </div>
            </div>

            {/* Form Section 3 */}
            <div className="space-y-1.5">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                {isEn ? 'SECTION 3: BANKING INFORMATION' : 'SEKSYEN 3: MAKLUMAT PERBANKAN'}
              </div>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Bank Name:' : 'Nama Bank:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg">{merchantProfile.bankName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Account Holder:' : 'Nama Pemegang:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg">{merchantProfile.bankAccountName}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 block uppercase">{isEn ? 'Account Number:' : 'Nombor Akaun:'}</span>
                  <div className="p-2 bg-slate-50 dark:bg-slate-950 border rounded-lg font-mono font-bold">{merchantProfile.bankAccountNumber}</div>
                </div>
              </div>
            </div>

            {/* Form Section 4 & 5 */}
            <div className="space-y-1.5">
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                {isEn ? 'SECTION 4: CONFIRMATION & SIGNATURES' : 'SEKSYEN 4: PENGESAHAN & TANDATANGAN'}
              </div>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{isEn ? 'Merchant Signature & Verification:' : 'Tandatangan & Pengesahan Peniaga:'}</span>
                  <div className="font-bold text-slate-900 dark:text-white">{merchantProfile.merchantSignatureName || merchantProfile.fullName}</div>
                  <div className="text-[10px] text-slate-500">IC: {merchantProfile.merchantSignatureIc || merchantProfile.icPassportNo}</div>
                  <div className="text-[10px] text-slate-500">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'} {formatDateToDDMMYYYY(merchantProfile.merchantSignatureDate || merchantProfile.createdAt)}</div>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-950 border rounded-xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">{isEn ? 'Agent / Processing Officer:' : 'Ejen / Pegawai Pemproses:'}</span>
                  <div className="font-bold text-red-600 dark:text-red-400">{merchantProfile.agentSignatureName || merchantProfile.processingOfficer || 'Agent Verified'}</div>
                  <div className="text-[10px] text-slate-500">ID: {merchantProfile.agentSignatureId || 'N/A'}</div>
                  <div className="text-[10px] text-slate-500">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'} {formatDateToDDMMYYYY(merchantProfile.agentSignatureDate || merchantProfile.createdAt)}</div>
                </div>
              </div>
            </div>

            {/* Footer Supabase Seal */}
            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
              <span>Legacy Cuisine F&B Management System • Verified & Safe in Supabase Storage</span>
              <span>{formatDateToDDMMYYYY(new Date())}</span>
            </div>
          </div>
        </div>
      )}
      {/* Document Lightbox Modal for Merchant */}
      {viewingDocModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-sm animate-fadeIn"
        >
          <div className="max-w-3xl w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90dvh]">
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
              <h3 className="font-black text-sm text-slate-900 dark:text-white truncate">
                {viewingDocModal.title}
              </h3>
              <button
                type="button"
                onClick={() => setViewingDocModal(null)}
                className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-red-600 hover:text-white flex items-center justify-center font-bold text-sm transition-all"
              >
                ✕
              </button>
            </div>
            <div className="p-4 bg-slate-950 flex items-center justify-center overflow-auto max-h-[70vh]">
              <img src={viewingDocModal.url} alt={viewingDocModal.title} className="max-w-full max-h-[65vh] object-contain rounded-lg shadow-xl" />
            </div>
            <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between text-xs">
              <span className="font-mono text-slate-500">{viewingDocModal.fileName || 'Verified Document'}</span>
              <a
                href={viewingDocModal.url}
                download={`${viewingDocModal.title.toLowerCase().replace(/\s+/g, '-')}.jpg`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-sm"
              >
                ⬇️ {isEn ? 'Download Image' : 'Muat Turun'}
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
