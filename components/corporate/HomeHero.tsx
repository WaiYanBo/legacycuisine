'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface HomeHeroProps {
  currentLang?: 'en' | 'ms';
}

export default function HomeHero({ currentLang = 'en' }: HomeHeroProps) {
  const isEn = currentLang === 'en';

  const stats = [
    {
      value: '1,250+',
      label: isEn ? 'Active Outlets' : 'Cawangan Aktif',
      detail: isEn ? 'Restaurants onboarded' : 'Restoran diaktifkan',
      color: 'text-red-600 dark:text-red-500',
    },
    {
      value: '< 48h',
      label: isEn ? 'Activation SLA' : 'SLA Pengaktifan',
      detail: isEn ? 'Fast-track direct approval' : 'Kelulusan saluran pantas',
      color: 'text-emerald-500',
    },
    {
      value: '100%',
      label: isEn ? 'Appointed Mandate' : 'Mandat Sah',
      detail: isEn ? 'Authorised Foodpanda partner' : 'Rakan rasmi Foodpanda',
      color: 'text-amber-500',
    },
    {
      value: 'RM 48M+',
      label: isEn ? 'Audited Payouts' : 'Bayaran Diaudit',
      detail: isEn ? 'Zero revenue leakage' : 'Sifar ketirisan hasil',
      color: 'text-blue-500',
    },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-red-50/20 dark:from-[#070a12] dark:via-[#0c111d] dark:to-[#070a12] border-b border-slate-200 dark:border-slate-800/80 pt-16 pb-20 sm:pt-24 sm:pb-28 transition-colors">
      {/* Dynamic ambient color background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-tr from-red-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-red-600/10 dark:bg-red-700/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Top Partner Verified Badge */}
        <div className="inline-flex flex-wrap items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/60 shadow-sm shadow-red-500/5 mb-6 sm:mb-8 max-w-full">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600" />
          </span>
          <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
            {isEn ? 'Authorised Foodpanda Malaysia Intermediary' : 'Perantara Rasmi Foodpanda Malaysia'}
          </span>
          <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>
          <span className="text-[10px] sm:text-[11px] font-mono text-slate-500 dark:text-slate-400 font-medium hidden sm:inline">
            Legacy Cuisine
          </span>
        </div>

        {/* 2-Column High-Impact Hero */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">

          {/* Left Column: Headline, Description & Primary Action */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-[1.15] sm:leading-[1.12]">
              {isEn ? (
                <>
                  Fast-Track Your Restaurant to{' '}
                  <span className="text-red-600 dark:text-red-500">
                    Foodpanda
                  </span>{' '}
                  with Zero Rejections
                </>
              ) : (
                <>
                  Daftarkan Restoran Anda ke{' '}
                  <span className="text-red-600 dark:text-red-500">
                    Foodpanda
                  </span>{' '}
                  Pantas & Sifar Penolakan
                </>
              )}
            </h1>

            <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 font-normal leading-relaxed max-w-2xl">
              {isEn
                ? 'We are the official appointed intermediary between restaurant merchants and Foodpanda Malaysia. We handle complete document compliance, professional menu digitization, physical tablet delivery to your kitchen, and automated weekly payout audits.'
                : 'Kami adalah perantara rasmi yang dilantik antara pemilik restoran dan Foodpanda Malaysia. Kami menguruskan semakan dokumen berkanun, pendigitalan menu profesional, penyerahan tablet terus ke dapur anda, dan audit penyata bayaran mingguan.'}
            </p>

            {/* CTAs */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs sm:text-sm shadow-lg shadow-red-600/25 hover:shadow-xl hover:shadow-red-600/35 hover:-translate-y-0.5 transition-all duration-200 text-center"
              >
                <span>{isEn ? 'Onboard Your Restaurant Today' : 'Daftar Restoran Hari Ini'}</span>
                <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs sm:text-sm transition-all hover:border-slate-400 dark:hover:border-slate-600 shadow-sm text-center"
              >
                <span>{isEn ? 'Explore Services Scope' : 'Lihat Skop Perkhidmatan'}</span>
              </Link>
            </div>

            {/* Trust Highlights */}
            <div className="pt-3 sm:pt-4 flex flex-wrap items-center gap-3 sm:gap-6 text-xs text-slate-600 dark:text-slate-400 font-medium">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">✓</span>
                <span className="text-[11px] sm:text-xs">{isEn ? 'Guaranteed 48H Approval' : 'SLA Kelulusan 48 Jam'}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">✓</span>
                <span className="text-[11px] sm:text-xs">{isEn ? 'On-Site Terminal Setup' : 'Pemasangan Tablet Di Premis'}</span>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-[10px] sm:text-xs shrink-0">✓</span>
                <span className="text-[11px] sm:text-xs">{isEn ? 'Weekly Payout Audit' : 'Audit Penyata Mingguan'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Product & Order Terminal Display */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0">
            <div className="relative mx-auto max-w-md w-full rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 p-4 sm:p-6 shadow-2xl border border-slate-800 text-white ring-1 ring-white/10">

              {/* Terminal Header */}
              <div className="flex items-center justify-between pb-3.5 border-b border-slate-800 mb-4 sm:mb-5">
                <div className="flex items-center gap-2.5 sm:gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-600 p-1 flex items-center justify-center shadow-md shadow-red-600/40 shrink-0">
                    <span className="text-white font-extrabold text-xs">fp</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white leading-tight">Foodpanda Merchant Terminal</div>
                    <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                      LIVE DISPATCH &bull; STORE OPEN
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 shrink-0">
                  Sunmi V2 PRO
                </span>
              </div>

              {/* Order Item 1 */}
              <div className="space-y-3">
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/80 hover:border-red-500/50 transition-colors">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-red-400 font-bold uppercase">ORDER #FP-8894</span>
                      <h4 className="text-xs font-bold text-white mt-0.5">Heritage Signature Nasi Lemak + Kopi O</h4>
                      <p className="text-[10px] sm:text-[11px] text-slate-400 mt-0.5">2x Sambal Sotong &bull; 1x Telur Mata &bull; Less Sweet</p>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400 shrink-0">RM 34.80</span>
                  </div>
                  <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                    <span className="text-slate-300 truncate">Rider: Mohd Faizal (4m)</span>
                    <span className="px-1.5 sm:px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-bold shrink-0">PREPARING</span>
                  </div>
                </div>

                {/* Order Item 2 */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="font-mono text-[10px] text-slate-400 font-bold uppercase">ORDER #FP-8895</span>
                      <h4 className="text-xs font-bold text-slate-300 mt-0.5">Kaya Butter Toast Set B</h4>
                    </div>
                    <span className="font-mono text-xs font-bold text-slate-300 shrink-0">RM 14.50</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-500 font-mono flex justify-between">
                    <span>Scheduled for 12:45 PM</span>
                    <span className="text-amber-400 font-semibold">ACCEPTED</span>
                  </div>
                </div>

                {/* Audit & Settlement Badge Card */}
                <div className="p-3 sm:p-3.5 rounded-xl bg-gradient-to-r from-red-950/40 via-slate-900 to-slate-900 border border-red-500/30">
                  <div className="flex items-center justify-between text-xs gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-red-600 text-white flex items-center justify-center font-bold text-[10px] shrink-0">
                        LC
                      </span>
                      <div className="min-w-0">
                        <div className="text-[11px] font-bold text-white truncate">Legacy Cuisine Audit Ledger</div>
                        <div className="text-[10px] text-slate-400 truncate">Weekly Remittance Reconciliation</div>
                      </div>
                    </div>
                    <span className="font-mono text-xs font-bold text-emerald-400 shrink-0">+RM 2,840.00</span>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 font-mono flex justify-between">
                    <span>14 Outlets Reconciled</span>
                    <span className="text-emerald-400 font-semibold">100% MATCHED</span>
                  </div>
                </div>
              </div>

              {/* Status bar */}
              <div className="mt-4 sm:mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span>Intermediary Desk: ACTIVE</span>
                <span className="text-slate-300">Foodpanda API v2</span>
              </div>
            </div>

            {/* Floating verification chip - safely contained on mobile */}
            <div className="absolute -bottom-4 left-2 sm:-left-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-xl rounded-xl p-2.5 sm:p-3 flex items-center gap-2.5 sm:gap-3 max-w-[90%] sm:max-w-none">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-extrabold text-base sm:text-lg shrink-0">
                48h
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">Fast-Track Activation</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono truncate">Zero Document Rejection</div>
              </div>
            </div>
          </div>

        </div>

        {/* Corporate Key Metrics Strip */}
        <div className="mt-16 sm:mt-20 pt-8 sm:pt-10 border-t border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="p-3.5 sm:p-6 rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`text-2xl sm:text-4xl font-extrabold font-mono tracking-tight ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white mt-1.5 sm:mt-2">
                  {stat.label}
                </div>
                <div className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                  {stat.detail}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
