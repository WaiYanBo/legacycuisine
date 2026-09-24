'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Locale } from '../../lib/i18n';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';

interface PotentialClientFormProps {
  lang?: Locale;
  onSuccessNavigate?: () => void;
}

export default function PotentialClientForm({ lang = 'ms', onSuccessNavigate }: PotentialClientFormProps) {
  const isEn = lang === 'en';
  const formTopRef = useRef<HTMLDivElement>(null);

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Core Required Fields (Only 3 required)
  const [fullName, setFullName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  // 2. Lead Discussion & Tracking Notes (Optional)
  const [leadStatus, setLeadStatus] = useState<string>(
    isEn ? 'Interested - Discussing with Owner' : 'Berminat - Perlu Bincang Dengan Pemilik'
  );
  const [discussionNotes, setDiscussionNotes] = useState('');

  // 3. Optional Fields (Can be altered and updated day by day)
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [storeAddress, setStoreAddress] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [icPassportNo, setIcPassportNo] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [typeOfFood, setTypeOfFood] = useState(isEn ? 'Restaurant / Food Stall' : 'Restoran / Gerai Makanan');
  
  // Bank Details (Optional)
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');

  // Operating Info (Optional)
  const [operatingHours, setOperatingHours] = useState('');
  const [operatingDays, setOperatingDays] = useState<string[]>([]);

  // Premises Photo (Optional)
  const [shopPhotoUrl, setShopPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  // Agent Auto-binding
  const [agentSignatureName, setAgentSignatureName] = useState('');
  const [agentSignatureId, setAgentSignatureId] = useState('');

  // Collapsible section toggles
  const [showAdvancedDetails, setShowAdvancedDetails] = useState(false);

  useEffect(() => {
    try {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('lc_user') : null;
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.role === 'AGENT') {
          setAgentSignatureName(u.fullName || '');
          setAgentSignatureId(u.username || u.email || '');
        }
      }
    } catch {}
  }, []);

  const scrollToTop = () => {
    const performScroll = () => {
      if (formTopRef.current) {
        formTopRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      const dashboardMain = document.getElementById('dashboard-main');
      if (dashboardMain) {
        dashboardMain.scrollTo({ top: 0, behavior: 'smooth' });
      }
      const dashboardRoot = document.getElementById('dashboard-root');
      if (dashboardRoot) {
        dashboardRoot.scrollTo({ top: 0, behavior: 'smooth' });
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (typeof document !== 'undefined') {
        document.documentElement?.scrollTo({ top: 0, behavior: 'smooth' });
        document.body?.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    performScroll();
    setTimeout(performScroll, 60);
    setTimeout(performScroll, 180);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isEn ? 'Please upload an image file (JPG, PNG).' : 'Sila muat naik fail gambar (JPG, PNG).');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setShopPhotoUrl(event.target?.result as string);
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleDay = (day: string) => {
    if (operatingDays.includes(day)) {
      setOperatingDays(operatingDays.filter((d) => d !== day));
    } else {
      setOperatingDays([...operatingDays, day]);
    }
  };

  const resetForm = () => {
    setFullName('');
    setBusinessName('');
    setContactNumber('');
    setDiscussionNotes('');
    setStoreAddress('');
    setMailingAddress('');
    setEmailAddress('');
    setIcPassportNo('');
    setRegistrationNo('');
    setBankName('');
    setBankAccountName('');
    setBankAccountNumber('');
    setOperatingHours('');
    setOperatingDays([]);
    setShopPhotoUrl(null);
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    // Strict validation ONLY for the 3 required fields
    if (!fullName.trim()) {
      setErrorMsg(
        isEn
          ? 'Merchant / Owner Name is required.'
          : 'Nama Peniaga / Pemilik adalah wajib.'
      );
      scrollToTop();
      return;
    }

    if (!businessName.trim()) {
      setErrorMsg(
        isEn
          ? 'Store / Business Name is required.'
          : 'Nama Kedai / Syarikat adalah wajib.'
      );
      scrollToTop();
      return;
    }

    if (!contactNumber.trim()) {
      setErrorMsg(
        isEn
          ? 'Phone Number (WhatsApp) is required.'
          : 'Nombor Telefon (WhatsApp) adalah wajib.'
      );
      scrollToTop();
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        date,
        fullName: fullName.trim(),
        businessName: businessName.trim(),
        contactNumber: contactNumber.trim(),
        storeAddress: storeAddress.trim() || mailingAddress.trim() || '',
        mailingAddress: mailingAddress.trim() || '',
        emailAddress: emailAddress.trim() || '',
        registrationNo: registrationNo.trim() || null,
        icPassportNo: icPassportNo.trim() || null,
        typeOfFood: typeOfFood || 'Restoran / Gerai Makanan',
        operatingDays,
        operatingHours: operatingHours.trim() || '',
        bankName: bankName.trim() || '',
        bankAccountName: bankAccountName.trim() || fullName.trim() || '',
        bankAccountNumber: bankAccountNumber.trim() || '',
        shopPhotoUrl: shopPhotoUrl || null,
        rejectionReason: `${leadStatus} ${discussionNotes ? `| Notes: ${discussionNotes.trim()}` : ''}`.trim(),
        status: 'Potential',
        agentSignatureName: agentSignatureName || null,
        agentSignatureId: agentSignatureId || null,
        agentUserId: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lc_user') || '{}')?.id : undefined,
        agentEmail: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lc_user') || '{}')?.email : undefined,
        language: lang.toUpperCase(),
      };

      const res = await fetch('/api/forms/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEn ? 'Failed to save potential client.' : 'Gagal menyimpan rekod klien berpotensi.'));
      }

      setSuccessMsg(
        isEn
          ? `Potential Client "${businessName}" saved successfully! You can update their details day-by-day or convert them to an official merchant when ready.`
          : `Klien Berpotensi "${businessName}" berjaya disimpan! Anda boleh mengemaskini maklumat ini dari semasa ke semasa atau menukarnya kepada Peniaga Rasmi apabila sudah muktamad.`
      );
      scrollToTop();
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? 'An error occurred while saving potential client.' : 'Ralat berlaku semasa menyimpan klien berpotensi.'));
      scrollToTop();
    } finally {
      setSubmitting(false);
    }
  };

  const daysList = isEn
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];

  return (
    <div ref={formTopRef} className="max-w-4xl mx-auto bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-3 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:p-0 printable-card">
      
      {/* HEADER SECTION */}
      <div className="border-b-2 border-amber-500 pb-4 sm:pb-5 mb-5 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
            <div className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-[11px] sm:text-xs tracking-wider sm:tracking-widest rounded-md uppercase">
              <span>★</span>
              <span>{isEn ? 'POTENTIAL CLIENTS' : 'KLIEN BERPOTENSI'}</span>
            </div>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              {isEn ? 'Flexible Lead Onboarding' : 'Pendaftaran Fleksibel'}
            </span>
          </div>

          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:white">
            {isEn ? 'POTENTIAL CLIENT REGISTRATION' : 'PENDAFTARAN KLIEN BERPOTENSI'}
          </h1>
          <p className="text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 mt-1">
            Foodpanda, GrabFood & ShopeeFood — Malaysia
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2 max-w-2xl leading-relaxed">
            {isEn
              ? 'Fast flexible lead capture for merchants who are interested or still in discussion with the owner. Only Merchant Name, Store Name, and WhatsApp Number are required. All other information can be updated day-by-day and converted to an official merchant registration once finalized.'
              : 'Pendaftaran pantas dan fleksibel bagi peniaga yang berminat atau masih dalam perbincangan. Hanya Nama Peniaga, Nama Kedai, dan No. Telefon (WhatsApp) yang wajib. Maklumat lain boleh dikemaskini dari semasa ke semasa dan ditukar kepada Peniaga Rasmi apabila sudah muktamad.'}
          </p>
        </div>

        <div className="flex flex-row md:flex-col items-center justify-between md:items-end w-full md:w-auto gap-2.5 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
          <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-white p-1.5 sm:p-2 flex items-center justify-center border-2 border-amber-500 shadow-md ring-4 ring-amber-500/15 shrink-0">
            <Image src="/logo-circle.png" alt="Legacy Cuisine Logo" width={80} height={80} className="object-contain w-full h-full" priority />
          </div>
          <div className="bg-slate-50 dark:bg-slate-900 px-2.5 sm:px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm text-[11px] sm:text-xs">
            <span className="font-semibold text-slate-500 dark:text-slate-400">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</span>{' '}
            <span className="font-bold text-slate-900 dark:text-white">{formatDateToDDMMYYYY(date)}</span>
          </div>
        </div>
      </div>

      {/* ALERT MESSAGES */}
      {successMsg && (
        <div id="form-alert-success" className="mb-6 p-4 sm:p-5 bg-emerald-50 dark:bg-emerald-950/50 border-2 border-emerald-500 dark:border-emerald-600 text-emerald-900 dark:text-emerald-100 text-sm font-semibold rounded-2xl animate-fadeIn shadow-lg flex items-start gap-3">
          <div className="p-1 rounded-full bg-emerald-600 text-white shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-xs sm:text-sm font-bold">{successMsg}</div>
            <div className="mt-3 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={resetForm}
                className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm transition-all text-center"
              >
                {isEn ? '+ Register Another Potential Client' : '+ Daftar Klien Berpotensi Lain'}
              </button>
              {onSuccessNavigate && (
                <button
                  type="button"
                  onClick={onSuccessNavigate}
                  className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 hover:bg-emerald-50 font-bold text-xs shadow-sm transition-all text-center"
                >
                  {isEn ? 'View Potential Clients Records →' : 'Lihat Rekod Klien Berpotensi →'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {errorMsg && (
        <div id="form-alert-error" className="mb-6 p-4 sm:p-5 bg-red-50 dark:bg-red-950/50 border-2 border-red-500 dark:border-red-600 text-red-900 dark:text-red-100 text-sm font-semibold rounded-2xl animate-fadeIn shadow-lg flex items-start gap-3">
          <div className="p-1 rounded-full bg-red-600 text-white shrink-0 mt-0.5">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <div className="flex-1 text-xs sm:text-sm leading-relaxed">{errorMsg}</div>
        </div>
      )}

      {/* FORM */}
      <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: MANDATORY INFORMATION (ONLY 3 FIELDS REQUIRED) */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 p-3 sm:p-3.5 rounded-xl font-black text-xs sm:text-sm uppercase tracking-wider shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-950 shrink-0" />
            <span>{isEn ? 'SECTION 1: CORE REQUIRED INFORMATION (3 FIELDS ONLY)' : 'SEKSYEN 1: MAKLUMAT WAJIB (3 MEDAN SAHAJA)'}</span>
          </div>
          <span className="text-[11px] sm:text-xs bg-slate-950/20 px-2 py-0.5 rounded font-extrabold uppercase shrink-0">
            {isEn ? 'Mandatory' : 'Wajib'}
          </span>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border-2 border-amber-300 dark:border-amber-800/60 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
            
            {/* 1. Merchant / Owner Name */}
            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {isEn ? '1. Merchant / Owner Name *' : '1. Nama Peniaga / Pemilik *'}
              </label>
              <input
                type="text"
                required
                placeholder={isEn ? 'e.g. Ahmad bin Ismail' : 'Contoh: Ahmad bin Ismail'}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 text-slate-900 dark:text-white text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isEn ? 'Name of applicant or person in charge.' : 'Nama pemohon atau orang yang dihubungi.'}
              </p>
            </div>

            {/* 2. Store / Business Name */}
            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {isEn ? '2. Store / Business Name *' : '2. Nama Kedai / Syarikat *'}
              </label>
              <input
                type="text"
                required
                placeholder={isEn ? 'e.g. Warung Kopi Tok Abah' : 'Contoh: Warung Kopi Tok Abah'}
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 text-slate-900 dark:text-white text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
              />
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isEn ? 'Name of restaurant, stall or business.' : 'Nama premis, gerai atau kedai perniagaan.'}
              </p>
            </div>

            {/* 3. Phone Number (WhatsApp) */}
            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1.5">
                {isEn ? '3. Phone No. (WhatsApp) *' : '3. No. Telefon (WhatsApp) *'}
              </label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  placeholder={isEn ? 'e.g. 0123456789' : 'Contoh: 0123456789'}
                  value={contactNumber}
                  onChange={(e) => setContactNumber(e.target.value)}
                  className="w-full px-3.5 sm:px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-700 text-slate-900 dark:text-white text-base sm:text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all shadow-sm"
                />
                <span className="absolute right-3 top-2.5 text-emerald-600 font-bold text-xs pointer-events-none">
                  WA
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                {isEn ? 'Active WhatsApp number for follow-up.' : 'Nombor WhatsApp aktif untuk tindakan susulan.'}
              </p>
            </div>

          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: LEAD STATUS & DISCUSSION NOTES */}
        {/* ------------------------------------------------------------- */}
        <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              {isEn ? 'Lead Discussion & Status Tracking' : 'Status Perbincangan & Tindakan Susulan'}
            </h3>
            <span className="text-[11px] font-semibold text-slate-400">
              {isEn ? '(Optional / Editable day-by-day)' : '(Pilihan / Boleh dikemaskini hari-hari)'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {isEn ? 'Lead Stage / Interest Status:' : 'Tahap Minat / Status Perbincangan:'}
              </label>
              <select
                value={leadStatus}
                onChange={(e) => setLeadStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="Berminat - Perlu Bincang Dengan Pemilik">Berminat - Perlu Bincang Dengan Pemilik</option>
                <option value="Dalam Perbincangan (Follow Up)">Dalam Perbincangan (Follow Up)</option>
                <option value="Tunggu Dokumen SSM / Bank">Tunggu Dokumen SSM / Bank</option>
                <option value="Bersetuju - Sedia Untuk Muktamad">Bersetuju - Sedia Untuk Muktamad</option>
                <option value="KIV / Tinjauan Awal">KIV / Tinjauan Awal</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                {isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}
              </label>
              <input
                type="date"
                lang="en-GB"
                placeholder="dd/mm/yyyy"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              {isEn ? 'Discussion Notes / Remarks (What does the owner need?):' : 'Catatan Perbincangan / Nota (Apa permintaan peniaga?):'}
            </label>
            <textarea
              rows={2}
              placeholder={isEn ? 'e.g. Owner interested in Foodpanda delivery, requested visit this Friday 3 PM to take photos of menu.' : 'Contoh: Peniaga berminat masuk Foodpanda, minta datang Jumaat 3 petang untuk ambil gambar menu dan salinan SSM.'}
              value={discussionNotes}
              onChange={(e) => setDiscussionNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* COLLAPSIBLE TOGGLE FOR OPTIONAL DETAILS */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowAdvancedDetails(!showAdvancedDetails)}
            className="w-full py-3 px-3.5 sm:px-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-slate-700 dark:text-slate-300 font-bold text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-left transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="p-1 rounded bg-amber-500 text-slate-950 font-black shrink-0">
                {showAdvancedDetails ? '▼' : '▶'}
              </span>
              <span className="leading-snug">
                {isEn
                  ? 'Additional Merchant Information (Address, SSM, Bank, Menu, Photos) - Optional'
                  : 'Maklumat Tambahan Peniaga (Alamat, SSM, Bank, Menu, Foto) - Pilihan (Boleh diisi bila-bila masa)'}
              </span>
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold self-end sm:self-auto shrink-0">
              {showAdvancedDetails ? (isEn ? 'Hide' : 'Tutup') : (isEn ? '+ Expand to fill details' : '+ Buka untuk isi maklumat')}
            </span>
          </button>
        </div>

        {/* OPTIONAL FIELDS BODY */}
        {showAdvancedDetails && (
          <div className="space-y-4 sm:space-y-6 pt-1 animate-fadeIn">
            
            {/* Store Location & Cuisine */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isEn ? 'Store Location & Cuisine' : 'Lokasi Premis & Jenis Makanan'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                <div className="md:col-span-2">
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'Store / Outlet Address (Optional):' : 'Alamat Kedai / Premis (Pilihan):'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. No. 12, Jalan Sultan Ismail, KL' : 'Contoh: No. 12, Jalan Sultan Ismail, KL'}
                    value={storeAddress}
                    onChange={(e) => setStoreAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'Email Address (Optional):' : 'Alamat E-mel (Pilihan):'}
                  </label>
                  <input
                    type="email"
                    placeholder={isEn ? 'merchant@gmail.com' : 'peniaga@gmail.com'}
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'Cuisine / Food Type (Optional):' : 'Jenis Makanan / Cuisine (Pilihan):'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. Nasi Lemak, Western, Beverages' : 'Contoh: Nasi Lemak, Western, Minuman'}
                    value={typeOfFood}
                    onChange={(e) => setTypeOfFood(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* SSM & Identity */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isEn ? 'SSM & Identity (Optional)' : 'No. SSM & Identiti (Pilihan)'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'SSM / Registration No. (Optional):' : 'No. SSM / Pendaftaran Syarikat (Pilihan):'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. 202301099882 (Optional)' : 'Contoh: 202301099882 (Pilihan)'}
                    value={registrationNo}
                    onChange={(e) => setRegistrationNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'IC / Passport No. (Optional):' : 'No. Kad Pengenalan / Pasport (Pilihan):'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. 900101-14-5555' : 'Contoh: 900101-14-5555'}
                    value={icPassportNo}
                    onChange={(e) => setIcPassportNo(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Bank Details */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isEn ? 'Bank Account Details (Optional)' : 'Maklumat Akaun Bank (Pilihan)'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'Bank Name:' : 'Nama Bank:'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'e.g. Maybank, CIMB' : 'Contoh: Maybank, CIMB'}
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'Account Holder Name:' : 'Nama Pemegang Akaun:'}
                  </label>
                  <input
                    type="text"
                    placeholder={isEn ? 'As per bank book' : 'Seperti buku bank'}
                    value={bankAccountName}
                    onChange={(e) => setBankAccountName(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    {isEn ? 'Account Number:' : 'Nombor Akaun:'}
                  </label>
                  <input
                    type="text"
                    placeholder="1234567890"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours & Days */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isEn ? 'Operating Hours & Days (Optional)' : 'Waktu & Hari Operasi (Pilihan)'}
              </h3>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5">
                  {isEn ? 'Operating Days:' : 'Hari Operasi:'}
                </label>
                <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-1.5 sm:gap-2">
                  {daysList.map((day) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`min-h-[38px] px-2 sm:px-3 py-1.5 rounded-lg text-xs font-bold border transition-all flex items-center justify-center text-center ${
                        operatingDays.includes(day)
                          ? 'bg-amber-500 text-slate-950 border-amber-500 font-extrabold shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  {isEn ? 'Operating Hours (Optional):' : 'Waktu Operasi (Pilihan):'}
                </label>
                <input
                  type="text"
                  placeholder={isEn ? 'e.g. 10:00 AM - 10:00 PM' : 'Contoh: 10:00 AM - 10:00 PM'}
                  value={operatingHours}
                  onChange={(e) => setOperatingHours(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white"
                />
              </div>
            </div>

            {/* Premises Photo Upload */}
            <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
              <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                {isEn ? 'Premises Photo (Optional)' : 'Gambar Premis / Kedai (Pilihan)'}
              </h3>
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                {shopPhotoUrl ? (
                  <div className="relative w-36 h-28 sm:w-32 sm:h-24 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm shrink-0">
                    <img src={shopPhotoUrl} alt="Store Preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setShopPhotoUrl(null)}
                      className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs shadow-md"
                      title={isEn ? 'Remove photo' : 'Buang foto'}
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="w-36 h-28 sm:w-32 sm:h-24 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-400 text-xs shrink-0">
                    {isEn ? 'No photo' : 'Tiada foto'}
                  </div>
                )}
                <div className="w-full sm:w-auto text-center sm:text-left">
                  <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 transition-all shadow-sm w-full sm:w-auto">
                    <span>{isUploadingPhoto ? 'Uploading...' : isEn ? 'Upload Storefront Photo' : 'Muat Naik Foto Premis'}</span>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    {isEn ? 'Snap a quick photo with smartphone camera or upload later.' : 'Ambil foto pantas dengan telefon atau muat naik kemudian.'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* SUBMIT BUTTON */}
        {/* ------------------------------------------------------------- */}
        <div className="pt-2 sm:pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[50px] py-3.5 sm:py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider sm:tracking-widest rounded-2xl shadow-xl shadow-amber-500/25 transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{isEn ? 'SAVING POTENTIAL CLIENT...' : 'MENYIMPAN KLIEN BERPOTENSI...'}</span>
              </>
            ) : (
              <>
                <span>★</span>
                <span>{isEn ? 'SAVE POTENTIAL CLIENT (LEAD)' : 'SIMPAN KLIEN BERPOTENSI (LEAD)'}</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
}
