'use client';

import React from 'react';
import Link from 'next/link';

interface CorporateHeroProps {
  currentLang?: 'en' | 'ms';
}

export default function CorporateHero({ currentLang = 'en' }: CorporateHeroProps) {
  const isEn = currentLang === 'en';

  const kpis = [
    {
      figure: '1,250+',
      label: isEn ? 'Foodpanda Merchants Onboarded' : 'Peniaga Foodpanda Diaktifkan',
      detail: isEn ? 'Verified restaurant outlets across Malaysia' : 'Cawangan restoran sah di seluruh Malaysia',
    },
    {
      figure: '100%',
      label: isEn ? 'Authorised Intermediary Mandate' : 'Mandat Perantara Rasmi',
      detail: isEn ? 'Direct merchant acquisition & representation' : 'Pengambilan & perwakilan peniaga terus',
    },
    {
      figure: 'RM 48.5M+',
      label: isEn ? 'Foodpanda Settlements Audited' : 'Penyelesaian Foodpanda Diaudit',
      detail: isEn ? 'Automated weekly payout reconciliation' : 'Penyesuaian bayaran mingguan automatik',
    },
    {
      figure: '< 48 Hrs',
      label: isEn ? 'Fast-Track Onboarding SLA' : 'SLA Pengaktifan Pantas',
      detail: isEn ? 'Full document verification & activation' : 'Pengesahan dokumen & pengaktifan penuh',
    },
  ];

  return (
    <section className="relative bg-slate-950 text-white overflow-hidden border-b border-slate-900">
      {/* Background Architectural Blueprint Subtle Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:32px_32px] opacity-25 pointer-events-none" />
      
      {/* Subtle crimson ambient wash */}
      <div className="absolute -top-40 right-0 w-[600px] h-[600px] bg-red-950/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-0 w-[500px] h-[500px] bg-red-900/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Hero Content Area */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-20">
        
        {/* Top Executive Pre-Header */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <span className="inline-block py-1 px-3 bg-red-950 text-red-400 border border-red-800 text-[11px] font-mono tracking-widest uppercase font-bold">
            {isEn ? 'Official Intermediary' : 'Perantara Rasmi'}
          </span>
          <span className="text-slate-600 text-xs">/</span>
          <span className="text-slate-300 text-xs uppercase tracking-widest font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
            <span>{isEn ? 'Foodpanda Malaysia & Restaurant Merchant Operations' : 'Operasi Peniaga Restoran & Foodpanda Malaysia'}</span>
          </span>
        </div>

        {/* Executive Headline & Split Narrative */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          
          {/* Main Proclamation (Left 8 Cols) */}
          <div className="lg:col-span-8">
            <h1 className="text-3xl sm:text-5xl lg:text-5xl font-sans font-bold text-white leading-tight sm:leading-[1.2]">
              {isEn ? (
                <>
                  The Authorised Intermediary Connecting{' '}
                  <span className="text-red-500">
                    Restaurants to Foodpanda
                  </span>
                </>
              ) : (
                <>
                  Perantara Rasmi Yang Menghubungkan{' '}
                  <span className="text-red-500">
                    Restoran ke Foodpanda
                  </span>
                </>
              )}
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-300 font-light leading-relaxed max-w-2xl">
              {isEn
                ? 'Legacy Cuisine is the appointed authorised intermediary dedicated exclusively to bridging restaurants (merchants) with Foodpanda. We streamline merchant qualification, catalogue digitization, device onboarding, and nightly settlement payout reconciliation.'
                : 'Legacy Cuisine adalah perantara rasmi yang dilantik khas untuk menghubungkan restoran (peniaga) dengan Foodpanda. Kami menguruskan kelayakan peniaga, pendigitalan katalog menu, peranti pesanan, dan penyesuaian penyata bayaran mingguan.'}
            </p>

            {/* Action Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-7 py-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest border border-red-500 transition-all shadow-xl shadow-red-950/60 group"
              >
                <span>{isEn ? 'Onboard Your Restaurant to Foodpanda ➔' : 'Daftar Restoran Anda ke Foodpanda ➔'}</span>
              </Link>

              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2.5 px-6 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white font-bold text-xs uppercase tracking-widest border border-slate-700 transition-colors"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{isEn ? 'Staff & Agent Portal' : 'Portal Staf & Ejen'}</span>
                <span className="text-[10px] bg-red-950 px-2 py-0.5 border border-red-500/30 text-red-200">
                  Login
                </span>
              </Link>
            </div>
          </div>

          {/* Right Operational Authority Column (Zero Cards - Editorial Split) */}
          <div className="lg:col-span-4 border-l border-slate-800 lg:pl-10 space-y-6 pt-4 lg:pt-0">
            <div>
              <div className="text-[10px] font-mono tracking-widest uppercase text-red-500 font-bold mb-2">
                {isEn ? 'Authorised Agency Mandate' : 'Mandat Agensi Rasmi'}
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                {isEn ? 'Foodpanda Merchant Representation' : 'Perwakilan Peniaga Foodpanda'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isEn
                  ? 'We are exclusively authorised to screen, onboard, verify documents, and configure POS systems for Foodpanda Malaysia. Restaurants get fast-tracked approvals and dedicated account management.'
                  : 'Kami diberi kuasa rasmi untuk menyaring, mengaktifkan, mengesahkan dokumen, dan mengkonfigurasi sistem untuk Foodpanda Malaysia. Restoran mendapat kelulusan pantas dan pengurusan akaun khas.'}
              </p>
            </div>

            <div className="border-t border-slate-900 pt-5">
              <div className="text-[10px] font-mono tracking-widest uppercase text-red-500 font-bold mb-2">
                {isEn ? 'Reconciliation Discipline' : 'Disiplin Penyesuaian'}
              </div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
                {isEn ? 'Weekly Payout Audit & Recovery' : 'Audit & Tuntutan Bayaran Mingguan'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {isEn
                  ? 'We protect merchant cash flow by matching weekly Foodpanda settlement statements against merchant order tickets to verify commissions and recover missing payouts.'
                  : 'Kami melindungi aliran tunai peniaga dengan memadankan penyata Foodpanda mingguan dengan tiket pesanan restoran bagi mengesahkan komisen dan menuntut bayaran yang tercicir.'}
              </p>
            </div>

            <div className="border-t border-slate-900 pt-5 flex items-center justify-between text-xs text-slate-400 font-mono">
              <span className="text-slate-400">Legacy Cuisine</span>
              <span className="text-emerald-400 text-[11px] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                {isEn ? 'Status: Active Authorised' : 'Status: Sah & Aktif'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Ribbon: Corporate Linear Style - NO CARDS! */}
      <div className="border-t border-slate-800 bg-slate-950/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-800">
            {kpis.map((kpi, idx) => (
              <div key={idx} className="py-6 sm:py-7 px-4 sm:px-6 first:pl-0 last:pr-0">
                <div className="text-2xl sm:text-3xl font-sans font-bold text-white tracking-normal">
                  {kpi.figure}
                </div>
                <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mt-1">
                  {kpi.label}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-light">
                  {kpi.detail}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
