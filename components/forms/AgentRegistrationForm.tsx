'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Locale } from '../../lib/i18n';

interface MerchantEntry {
  bil: number;
  namaPeniaga: string;
  platform: string;
  tarikhDidaftarkan: string;
  catatan: string;
}

interface AgentRegistrationFormProps {
  lang?: Locale;
}

export default function AgentRegistrationForm({ lang = 'ms' }: AgentRegistrationFormProps) {
  const isEn = lang === 'en';

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 1. Maklumat Peribadi Ejen / Agent's Personal Information
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [agentNo, setAgentNo] = useState('');
  const [agentName, setAgentName] = useState('');
  const [email, setEmail] = useState('');
  const [icNumber, setIcNumber] = useState('');
  const [race, setRace] = useState(isEn ? 'Malay' : 'Melayu');
  const [religion, setReligion] = useState(isEn ? 'Islam' : 'Islam');
  const [address, setAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  // 2. Maklumat Perbankan / Banking Information
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');

  // 3. Senarai 5 Nama Peniaga / List of 5 Successfully Registered Merchants
  const [merchants, setMerchants] = useState<MerchantEntry[]>([
    { bil: 1, namaPeniaga: '', platform: 'GrabFood', tarikhDidaftarkan: '', catatan: '' },
    { bil: 2, namaPeniaga: '', platform: 'Foodpanda', tarikhDidaftarkan: '', catatan: '' },
    { bil: 3, namaPeniaga: '', platform: 'ShopeeFood', tarikhDidaftarkan: '', catatan: '' },
    { bil: 4, namaPeniaga: '', platform: 'GrabFood', tarikhDidaftarkan: '', catatan: '' },
    { bil: 5, namaPeniaga: '', platform: 'ShopeeFood', tarikhDidaftarkan: '', catatan: '' },
  ]);

  // 4. Pengakuan Ejen & Terma Perkhidmatan / Declaration & Terms of Engagement
  const [agreedToTerms, setAgreedToTerms] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  // 5. Pengesahan & Tandatangan / Confirmation & Signature
  const [agentSignatureName, setAgentSignatureName] = useState('');
  const [agentSignatureDate, setAgentSignatureDate] = useState(new Date().toISOString().split('T')[0]);
  const [supervisorName, setSupervisorName] = useState('');
  const [supervisorDate, setSupervisorDate] = useState('');

  const handleMerchantChange = (index: number, field: keyof MerchantEntry, value: string) => {
    const updated = [...merchants];
    updated[index] = { ...updated[index], [field]: value };
    setMerchants(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!agreedToTerms) {
      setErrorMsg(
        isEn
          ? 'Please read and check the Declaration & Terms of Engagement confirmation box.'
          : 'Sila baca dan tanda kotak pengesahan Pengakuan & Terma Perkhidmatan Ejen.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        date,
        agentNo,
        agentName,
        email: email.trim().toLowerCase(),
        icNumber,
        race,
        religion,
        address,
        phoneNumber,
        bankAccountName: bankAccountName || agentName,
        bankName,
        bankAccountNumber,
        registeredMerchants: JSON.stringify(merchants),
        prospectSource: 'Declaration Signed & Confirmed',
        prospectSourceOther: null,
        approachedByOtherAgents: 'Tidak',
        confidenceLevel: 'Tinggi',
        estimatedDuration: 'Completed',
        agentSignature: agentSignatureName,
        supervisorName,
        supervisorDate,
        language: lang.toUpperCase(),
      };

      const res = await fetch('/api/forms/agent-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (isEn ? 'Failed to submit agent registration form.' : 'Gagal menyimpan borang ejen.'));
      }

      setSuccessMsg(
        isEn
          ? `Agent Registration submitted successfully! Portal account created for ${email}. You may log in with default password: Default123!`
          : `Borang Pendaftaran Ejen berjaya dihantar! Akaun portal telah dicipta untuk ${email}. Anda boleh log masuk dengan kata laluan lalai: Default123!`
      );
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? 'An error occurred while processing application.' : 'Ralat berlaku semasa memproses permohonan.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:p-0 printable-card">

      {/* 📄 DOCUMENT HEADER */}
      <div className="border-b-2 border-red-600 pb-5 mb-6 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print-doc-header">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="inline-block px-3 py-1 bg-red-600 text-white font-extrabold text-xs tracking-widest rounded-md uppercase">
              {isEn ? 'AGENT REGISTRATION' : 'PENDAFTARAN EJEN'}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-red-300 transition-all flex items-center gap-1.5 shadow-sm print:hidden"
            >
              <span>🖨️</span>
              <span>{isEn ? 'Print Form' : 'Cetak Borang'}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            {isEn ? 'AGENT REGISTRATION' : 'PENDAFTARAN EJEN'}
          </h1>
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-1">
            Foodpanda, GrabFood and ShopeeFood — Malaysia
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2 max-w-2xl leading-relaxed">
            {isEn
              ? 'This form is to be completed by the AGENT only for personal records, commission payments and self-review before registering any merchant.'
              : 'Borang ini diisi oleh EJEN sahaja bagi tujuan rekod peribadi, pembayaran komisen dan semakan kendiri sebelum mendaftarkan mana-mana peniaga.'}
          </p>
        </div>

        <div className="w-16 h-16 sm:w-24 sm:h-24 shrink-0 rounded-full bg-white p-2 sm:p-2.5 flex items-center justify-center border-2 border-red-600 shadow-md ring-4 ring-red-600/15 transition-transform hover:scale-105 print-logo-container self-end md:self-center">
          <Image src="/logo-circle.png" alt="Legacy Cuisine Logo" width={96} height={96} className="object-contain w-full h-full" priority />
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-2xl animate-fadeIn print:hidden">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-sm font-semibold rounded-2xl animate-fadeIn print:hidden">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: AGENT'S PERSONAL INFORMATION */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm">
          {isEn ? "AGENT'S PERSONAL INFORMATION" : 'MAKLUMAT PERIBADI EJEN'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Date (DD/MM/YYYY) *' : 'Tarikh (DD/MM/YYYY) *'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Agent No. *' : 'No. Ejen *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'e.g. AGT-8821' : 'Contoh: AGT-8821'}
              value={agentNo}
              onChange={(e) => setAgentNo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? "Agent's Name (As per NRIC/Passport) *" : 'Nama Ejen (Seperti dalam IC) *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? "Agent's Full Name" : 'Nama Penuh Ejen'}
              value={agentName}
              onChange={(e) => setAgentName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Email Address (For Portal Login) *' : 'Alamat E-mel (Untuk Log Masuk Portal) *'}
            </label>
            <input
              type="email"
              required
              placeholder={isEn ? 'agent@legacycuisine.com' : 'ejen@legacycuisine.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
            <p className="text-[11px] text-red-600 dark:text-red-400 font-medium mt-1 flex items-center gap-1.5">
              <span>ℹ️</span>
              <span>
                {isEn
                  ? 'This email will be your portal login username with initial default password: Default123!'
                  : 'E-mel ini akan digunakan sebagai nama pengguna log masuk portal dengan kata laluan lalai: Default123!'}
              </span>
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Identity Card No. *' : 'No. Kad Pengenalan *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'e.g. 920512-14-5543' : 'Contoh: 920512-14-5543'}
              value={icNumber}
              onChange={(e) => setIcNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Telephone No. *' : 'No. Telefon *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'e.g. 012-3456789' : 'Contoh: 012-3456789'}
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Race' : 'Bangsa'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Malay / Chinese / Indian / Others' : 'Melayu / Cina / India / Lain-lain'}
              value={race}
              onChange={(e) => setRace(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Religion' : 'Agama'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Islam / Buddhism / Hinduism / Christianity' : 'Islam / Buddha / Hindu / Kristian'}
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Address *' : 'Alamat Kediaman *'}
            </label>
            <textarea
              required
              rows={2}
              placeholder={isEn ? 'Full residential address' : 'Alamat penuh terkini'}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: BANKING INFORMATION (FOR COMMISSION PAYMENT) */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
          {isEn ? 'BANKING INFORMATION (FOR COMMISSION PAYMENT)' : 'MAKLUMAT PERBANKAN (UNTUK PEMBAYARAN KOMISEN)'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? "Bank Account Holder's Name *" : 'Nama Pemegang Akaun Bank *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Must match NRIC/Passport' : 'Mesti sama dengan IC'}
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Bank Name *' : 'Nama Bank *'}
            </label>
            <input
              type="text"
              required
              placeholder="Maybank / CIMB / RHB / Public Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Bank Account No. *' : 'No. Akaun Bank *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Account Number' : 'Nombor Akaun'}
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
          <strong>{isEn ? 'Disclaimer:' : 'Penafian:'}</strong>{' '}
          {isEn
            ? 'Requirements, fees, service areas and approval decisions may change without notice. Please check the official merchant application or contact the support centre before final submission.'
            : 'Keperluan, yuran, kawasan perkhidmatan dan keputusan kelulusan mungkin berubah tanpa notis. Sila semak aplikasi peniaga rasmi atau hubungi pusat bantuan sebelum penghantaran akhir.'}
        </p>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 3: LIST OF 5 SUCCESSFULLY REGISTERED MERCHANTS */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
          {isEn ? 'LIST OF 5 SUCCESSFULLY REGISTERED MERCHANTS' : 'SENARAI 5 NAMA PENIAGA YANG BERJAYA DIDAFTARKAN'}
        </div>

        <div className="overflow-x-auto print:overflow-visible rounded-2xl border border-slate-200 dark:border-slate-800 print:border-slate-300">
          <table className="w-full min-w-[620px] text-left text-xs text-slate-800 dark:text-slate-200 print:text-black">
            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="py-3 px-3 w-12 text-center">{isEn ? 'No.' : 'Bil.'}</th>
                <th className="py-3 px-3">{isEn ? 'Merchant Name' : 'Nama Peniaga'}</th>
                <th className="py-3 px-3 w-40">Platform</th>
                <th className="py-3 px-3 w-36">{isEn ? 'Date Registered (DD/MM/YYYY)' : 'Tarikh Didaftarkan (DD/MM/YYYY)'}</th>
                <th className="py-3 px-3">{isEn ? 'Remarks' : 'Catatan'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {merchants.map((merchant, idx) => (
                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                  <td className="py-2.5 px-3 text-center font-bold text-slate-500">{merchant.bil}</td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder={isEn ? 'Store / Merchant Name' : 'Nama Kedai / Peniaga'}
                      value={merchant.namaPeniaga}
                      onChange={(e) => handleMerchantChange(idx, 'namaPeniaga', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <select
                      value={merchant.platform}
                      onChange={(e) => handleMerchantChange(idx, 'platform', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                    >
                      <option value="GrabFood">GrabFood</option>
                      <option value="Foodpanda">Foodpanda</option>
                      <option value="ShopeeFood">ShopeeFood</option>
                      <option value="All Platforms">{isEn ? 'All Platforms' : 'Semua Platform'}</option>
                    </select>
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="date"
                      lang="en-GB"
                      placeholder="dd/mm/yyyy"
                      value={merchant.tarikhDidaftarkan}
                      onChange={(e) => handleMerchantChange(idx, 'tarikhDidaftarkan', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </td>
                  <td className="py-2.5 px-3">
                    <input
                      type="text"
                      placeholder={isEn ? 'Status remarks' : 'Catatan status'}
                      value={merchant.catatan}
                      onChange={(e) => handleMerchantChange(idx, 'catatan', e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs focus:outline-none focus:ring-1 focus:ring-red-600"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* PAGE 2 BLOCK: SECTION 4 & SECTION 5 (UNIFIED PAGE BLOCK) */}
        {/* ------------------------------------------------------------- */}
        <div className="print-break-before break-inside-avoid section-block">
          {/* SECTION 4: AGENT'S DECLARATION / SEKSYEN 4: PENGAKUAN EJEN */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
            {isEn ? "SECTION 4: AGENT'S DECLARATION" : 'SEKSYEN 4: PENGAKUAN EJEN'}
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs mt-3 space-y-3">
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed text-xs">
              {isEn ? (
                <>
                  I hereby solemnly declare that all personal particulars, banking information, and registered merchants submitted in this form are true, accurate, and complete to the best of my knowledge. I confirm that I have read, understood, and agreed to be bound by the official{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-black text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline decoration-red-500/50 hover:decoration-red-600 underline-offset-2 transition-colors inline-flex items-center gap-1 cursor-pointer print:text-black print:no-underline"
                  >
                    <span>Terms &amp; Conditions of Engagement</span>
                    <span className="text-[10px] print:hidden">↗</span>
                  </button>{' '}
                  and the Company&apos;s Code of Conduct &amp; Confidentiality Policies under the Personal Data Protection Act 2010.
                </>
              ) : (
                <>
                  Saya dengan sesungguhnya memperakui bahawa semua butiran peribadi, maklumat perbankan, dan senarai peniaga yang dikemukakan dalam borang ini adalah benar, tepat, dan lengkap setakat pengetahuan saya. Saya mengesahkan bahawa saya telah membaca, memahami, dan bersetuju untuk terikat dengan{' '}
                  <button
                    type="button"
                    onClick={() => setShowTermsModal(true)}
                    className="font-black text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 underline decoration-red-500/50 hover:decoration-red-600 underline-offset-2 transition-colors inline-flex items-center gap-1 cursor-pointer print:text-black print:no-underline"
                  >
                    <span>Terma &amp; Syarat Pelantikan Ejen</span>
                    <span className="text-[10px] print:hidden">↗</span>
                  </button>{' '}
                  serta Kod Etika &amp; Dasar Kerahsiaan Syarikat di bawah Akta Perlindungan Data Peribadi 2010.
                </>
              )}
            </p>

            <div className="pt-2.5 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 accent-red-600 w-4 h-4 shrink-0 cursor-pointer"
                />
                <span className="font-bold text-slate-900 dark:text-white text-xs leading-snug">
                  {isEn
                    ? 'I agree to the Terms & Conditions and solemnly confirm this Declaration.'
                    : 'Saya bersetuju dengan Terma & Syarat serta mengesahkan Pengakuan ini.'}
                </span>
              </label>
            </div>
          </div>

          {/* SECTION 5: CONFIRMATION & SIGNATURE */}
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-6">
            {isEn ? 'CONFIRMATION & SIGNATURE' : 'PENGESAHAN & TANDATANGAN'}
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium italic my-2">
            {isEn
              ? 'I confirm that all information stated in this form is true and accurate to the best of my knowledge.'
              : 'Saya mengesahkan bahawa semua maklumat yang dinyatakan dalam borang ini adalah benar dan tepat setakat pengetahuan saya.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2 signature-grid gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
            {/* Agent Signature Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 signature-box break-inside-avoid">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                {isEn ? "Agent's Signature" : 'Tandatangan Ejen'}
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Name:' : 'Nama Ejen:'}</label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? "Agent Name" : "Nama Ejen"}
                  value={agentSignatureName}
                  onChange={(e) => setAgentSignatureName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  required
                  value={agentSignatureDate}
                  onChange={(e) => setAgentSignatureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Supervisor Signature Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 signature-box break-inside-avoid">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                {isEn ? "Supervisor / Verifier's Signature" : 'Tandatangan Penyelia / Pengesah'}
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Name:' : 'Nama Penyelia:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Supervisor Name (If applicable)" : "Nama Penyelia (Jika ada)"}
                  value={supervisorName}
                  onChange={(e) => setSupervisorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  value={supervisorDate}
                  onChange={(e) => setSupervisorDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-4 print:hidden">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/25 transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{isEn ? 'PROCESSING REGISTRATION...' : 'MEMPROSES PENDAFTARAN...'}</span>
              </>
            ) : (
              <span>{isEn ? 'SUBMIT AGENT REGISTRATION FORM' : 'HANTAR BORANG PENDAFTARAN EJEN'}</span>
            )}
          </button>
        </div>

      </form>

      {/* 📜 TERMS & CONDITIONS TEMPLATE MODAL (HIDDEN ON PRINT) */}
      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn print:hidden">
          <div className="max-w-2xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto text-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  {isEn ? 'Official Legal Document' : 'Dokumen Perundangan Rasmi'}
                </span>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                  {isEn ? 'Agent Terms & Conditions of Engagement' : 'Terma & Syarat Pelantikan Ejen Medan'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-red-50 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Clauses */}
            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {isEn ? (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">1. Independent Contractor & Representation</strong>
                    The Agent is engaged as an independent merchant acquisition contractor for Legacy Cuisine Group and associated food delivery aggregator platforms (Foodpanda, GrabFood, ShopeeFood). This agreement does not establish an employment, joint venture, or partnership relationship.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">2. Merchant Onboarding & Code of Conduct</strong>
                    The Agent warrants that all merchant information, business addresses, SSM registration details, and banking particulars submitted are authentic, truthful, and obtained directly with the merchant&apos;s explicit consent. Submitting forged documents or false registrations is strictly prohibited and constitutes legal fraud.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">3. Confidentiality & PDPA 2010 Compliance (Act 709)</strong>
                    All personal data, merchant commercial documents, and trade information collected in the performance of duties must be handled in strict compliance with the Personal Data Protection Act 2010. The Agent shall maintain strict confidentiality and shall not disclose or sell merchant information to any unauthorized third party.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">4. Commission Disbursement & Audit Verification</strong>
                    Commission payments are contingent upon compliance audit approval and successful merchant storefront activation. Payouts are made directly to the registered banking account detailed in Section 2. The Company reserves the right to withhold or claw back commissions on accounts found to be inactive or non-compliant.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">5. Non-Circumvention & Termination</strong>
                    The Company reserves the right to terminate agent portal access immediately upon notice for breach of ethics, submission of unverified entities, or breach of aggregator guidelines.
                  </div>

                  {/* CUSTOMIZABLE TEMPLATE SLOT */}
                  <div className="p-3 bg-red-50/60 dark:bg-red-950/20 rounded-xl border border-dashed border-red-300 dark:border-red-900">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">Template Clause / Terma Templat</span>
                      <strong className="text-red-900 dark:text-red-200">6. Additional Company Terms & Specific Policies</strong>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      [INSERT CUSTOM COMPANY TERMS, PERFORMANCE TARGETS, EXCLUSIVITY RULES, OR REGIONAL OPERATING GUIDELINES HERE AS NEEDED]
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">1. Pelantikan Kontraktor Bebas & Perwakilan</strong>
                    Ejen dilantik atas kapasiti kontraktor bebas bagi pengambilan peniaga di bawah Legacy Cuisine Group dan platform agregator berkaitan (Foodpanda, GrabFood, ShopeeFood). Pelantikan ini tidak mewujudkan hubungan majikan-pekerja, perkongsian perniagaan, atau liabiliti statutori pekerjaan.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">2. Pendaftaran Peniaga & Kod Etika Integriti</strong>
                    Ejen menjamin bahawa semua maklumat peniaga, alamat kedai, dokumen pendaftaran SSM, dan maklumat akaun bank yang diserahkan adalah tulen, sah, dan disahkan terus bersama pemilik perniagaan. Sebarang pemalsuan tandatangan atau maklumat palsu adalah dilarang sama sekali.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">3. Kerahsiaan & Pematuhan Akta PDPA 2010 (Akta 709)</strong>
                    Semua data peribadi, nombor telefon, dan dokumen perniagaan yang diperoleh semasa proses onboarding adalah sulit dan dilindungi di bawah Akta Perlindungan Data Peribadi 2010. Ejen bertanggungjawab menjaga kerahsiaan data dan dilarang mendedahkan maklumat kepada pihak luar.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">4. Pembayaran Komisen & Semakan Audit</strong>
                    Komisen hanya akan dibayar setelah permohonan peniaga diluluskan oleh pihak audit serta premis berjaya diaktifkan dalam sistem. Pembayaran akan dikreditkan ke akaun bank yang dinyatakan dalam Seksyen 2.
                  </div>

                  <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                    <strong className="text-slate-900 dark:text-white block mb-1">5. Pembatalan & Penamatan Perkhidmatan</strong>
                    Syarikat berhak menamatkan akses portal ejen serta-merta tanpa notis sekiranya didapati melanggar kod etika atau melakukan manipulasi data.
                  </div>

                  {/* CUSTOMIZABLE TEMPLATE SLOT */}
                  <div className="p-3 bg-red-50/60 dark:bg-red-950/20 rounded-xl border border-dashed border-red-300 dark:border-red-900">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-red-600 text-white">Template Clause / Terma Templat</span>
                      <strong className="text-red-900 dark:text-red-200">6. Terma Tambahan Syarikat & Polisi Khusus</strong>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 italic">
                      [MASUKKAN TERMA KHUSUS SYARIKAT, SASARAN PRESTASI (KPI), SYARAT EKSKLUSIF, ATAU PANDUAN KAWASAN OPERASI DI SINI MENGIKUT KEPERLUAN SEMASA]
                    </p>
                  </div>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowTermsModal(false)}
                className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
              >
                {isEn ? 'Close & Return to Form' : 'Tutup & Kembali ke Borang'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
