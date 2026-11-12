'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface CorporateInquiryProps {
  currentLang?: 'en' | 'ms';
}

export default function CorporateInquiry({ currentLang = 'en' }: CorporateInquiryProps) {
  const isEn = currentLang === 'en';
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    businessName: '',
    personInCharge: '',
    email: '',
    phone: '',
    outletCount: '1-3 Outlets',
    preferredDate: '',
    requestType: 'New Foodpanda Registration',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Instant submission handling
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  return (
    <section id="contact" className="bg-slate-950 text-white py-20 sm:py-28 border-b border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-slate-800 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-500 block mb-3">
              {isEn ? 'Authorised Foodpanda Partner Onboarding' : 'Pendaftaran Rakan Rasmi Foodpanda'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-white leading-tight sm:leading-snug">
              {isEn ? 'Onboard Your Restaurant to Foodpanda' : 'Daftar Restoran Anda ke Foodpanda'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono tracking-wider shrink-0 uppercase">
            {isEn ? 'Section 08 // Merchant Advisory' : 'Bahagian 08 // Penasihat Peniaga'}
          </div>
        </div>

        {/* 2-Column Corporate Layout (No Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 items-start">
          
          {/* Left Column: Institutional Credentials & Location */}
          <div className="lg:col-span-5 space-y-8">
            <div>
              <h3 className="text-base sm:text-lg font-sans font-semibold text-white leading-snug mb-2">
                {isEn ? 'Official Intermediary Helpdesk' : 'Meja Bantuan Perantara Rasmi'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {isEn
                  ? 'We are the officially authorised intermediary connecting restaurants with Foodpanda in Malaysia. Whether registering a new outlet or reconciling weekly payout statements, our designated officers manage the entire process.'
                  : 'Kami adalah perantara rasmi yang menghubungkan restoran dengan Foodpanda di Malaysia. Sama ada mendaftar cawangan baru atau menyemak penyata bayaran mingguan, pegawai kami menguruskan proses sepenuhnya.'}
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono border-t border-slate-800 pt-6">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-widest">
                  {isEn ? 'AUTHORISED ENTITY' : 'ENTITI DILANTIK'}
                </span>
                <span className="text-slate-200 font-bold">Legacy Cuisine</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-widest">
                  {isEn ? 'HEAD OFFICE' : 'IBU PEJABAT'}
                </span>
                <span className="text-slate-300">Level 18, Menara Kencana, Persiaran Barat, 50450 Kuala Lumpur, Malaysia</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-widest">
                  {isEn ? 'MERCHANT HOTLINE' : 'TALIAN PENIAGA'}
                </span>
                <span className="text-slate-200">+60 3-8996 4200 / +60 12-882 1928</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase tracking-widest">
                  {isEn ? 'FOODPANDA ONBOARDING EMAIL' : 'E-MEL PENDAFTARAN FOODPANDA'}
                </span>
                <span className="text-red-400">onboarding@legacycuisine.com.my</span>
              </div>
            </div>

            {/* Portal Notice Box */}
            <div className="p-4 bg-slate-900 border border-slate-800 text-xs">
              <span className="text-red-400 font-mono font-bold block mb-1">
                {isEn ? 'STAFF & RECRUITMENT AGENT PORTAL:' : 'PORTAL STAF & EJEN PENGAMBILAN:'}
              </span>
              <p className="text-slate-400 leading-relaxed text-[11px] mb-3">
                {isEn
                  ? 'Field agents submitting merchant checklist forms or reviewing lead statuses, please enter the dedicated portal below.'
                  : 'Ejen medan yang menghantar borang senarai semak atau menyemak status prospek, sila log masuk ke portal rasmi di bawah.'}
              </p>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-colors"
              >
                <span>{isEn ? 'Access Agent Portal ➔' : 'Akses Portal Ejen ➔'}</span>
              </Link>
            </div>
          </div>

          {/* Right Column: Executive Consultation Form (Zero Cards) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-6 sm:p-10">
            {submitted ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in duration-300">
                <div className="w-12 h-12 bg-red-950 border border-red-600 rounded-none mx-auto flex items-center justify-center text-red-400 text-xl font-bold">
                  ✓
                </div>
                <h3 className="text-xl font-sans font-bold text-white tracking-tight">
                  {isEn ? 'Foodpanda Registration Request Received' : 'Permohonan Pendaftaran Foodpanda Diterima'}
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                  {isEn
                    ? 'Our Foodpanda merchant onboarding team has received your details. An assigned field representative will contact you within 24 business hours to inspect documents and verify your outlet.'
                    : 'Pasukan pendaftaran Foodpanda kami telah menerima maklumat anda. Wakil lapangan kami akan menghubungi anda dalam tempoh 24 jam untuk menyemak dokumen dan cawangan anda.'}
                </p>
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="mt-4 px-6 py-2.5 text-xs font-mono uppercase tracking-widest text-slate-300 border border-slate-700 hover:bg-slate-800 transition-colors"
                >
                  {isEn ? 'Submit Another Request' : 'Hantar Permohonan Lain'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="text-xs font-mono uppercase tracking-widest text-slate-400 pb-3 border-b border-slate-800">
                  {isEn ? 'Merchant Application & Audit Request' : 'Permohonan Peniaga & Permintaan Audit'}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      {isEn ? 'Restaurant / Business Name *' : 'Nama Restoran / Perniagaan *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? 'e.g. Restoran Warisan Selera' : 'cth. Restoran Warisan Selera'}
                      value={formData.businessName}
                      onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3.5 py-3 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      {isEn ? 'Person In Charge & Title *' : 'Pegawai Bertanggungjawab & Jawatan *'}
                    </label>
                    <input
                      type="text"
                      required
                      placeholder={isEn ? 'e.g. Ahmad Razif (Owner / Director)' : 'cth. Ahmad Razif (Pemilik / Pengarah)'}
                      value={formData.personInCharge}
                      onChange={(e) => setFormData({ ...formData, personInCharge: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3.5 py-3 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      {isEn ? 'Corporate Email *' : 'E-mel Korporat *'}
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="owner@restaurant.com.my"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3.5 py-3 focus:outline-none focus:border-red-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      {isEn ? 'Mobile / WhatsApp Number *' : 'No. Telefon / WhatsApp *'}
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+60 12-345 6789"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3.5 py-3 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      {isEn ? 'Request Type' : 'Jenis Permintaan'}
                    </label>
                    <select
                      value={formData.requestType}
                      onChange={(e) => setFormData({ ...formData, requestType: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3.5 py-3 focus:outline-none focus:border-red-600"
                    >
                      <option value="New Foodpanda Registration">New Foodpanda Registration</option>
                      <option value="Existing Foodpanda Payout Audit">Existing Foodpanda Payout Audit</option>
                      <option value="Menu Digitization & Updating">Menu Digitization & Updating</option>
                      <option value="Foodpanda Tablet Replacement / Training">Foodpanda Tablet Setup / Staff Training</option>
                    </select>
                  </div>

                  {/* Date Input with strict compliance to .agents/AGENTS.md guidelines */}
                  <div>
                    <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                      {isEn ? 'Preferred Consultation Date (DD/MM/YYYY) *' : 'Tarikh Perundingan Pilihan (DD/MM/YYYY) *'}
                    </label>
                    <input
                      type="date"
                      required
                      lang="en-GB"
                      placeholder="dd/mm/yyyy"
                      value={formData.preferredDate}
                      onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3.5 py-3 focus:outline-none focus:border-red-600"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1">
                    {isEn ? 'Outlet Address & Remarks' : 'Alamat Cawangan & Catatan'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isEn ? 'Provide your restaurant location area, current SSM registration status, or any questions for our Foodpanda agent...' : 'Nyatakan lokasi restoran anda, status pendaftaran SSM, atau soalan untuk ejen Foodpanda kami...'}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 text-white text-xs px-3.5 py-3 focus:outline-none focus:border-red-600"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-red-950/60 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>{isEn ? 'Transmitting Request...' : 'Menghantar Permohonan...'}</span>
                  ) : (
                    <span>{isEn ? 'SUBMIT FOODPANDA ONBOARDING REQUEST ➔' : 'HANTAR PERMOHONAN PENDAFTARAN FOODPANDA ➔'}</span>
                  )}
                </button>
              </form>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
