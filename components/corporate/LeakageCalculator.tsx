'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface LeakageCalculatorProps {
  currentLang?: 'en' | 'ms';
}

export default function LeakageCalculator({ currentLang = 'en' }: LeakageCalculatorProps) {
  const isEn = currentLang === 'en';
  const [monthlyGmv, setMonthlyGmv] = useState<number>(45000);
  const [outletCount, setOutletCount] = useState<number>(2);

  // Financial modeling formulas for Foodpanda delivery operations
  const totalMonthlyGmv = monthlyGmv * outletCount;
  const estimatedCancelledOrderLoss = totalMonthlyGmv * 0.024; // ~2.4% in uncompensated rider delays / cancelled orders
  const uncreditedPromoLoss = totalMonthlyGmv * 0.016; // ~1.6% in miscalculated voucher co-funding
  const monthlyTotalRecaptured = estimatedCancelledOrderLoss + uncreditedPromoLoss;
  const annualTotalRecaptured = monthlyTotalRecaptured * 12;

  const formatCurrency = (val: number) => {
    return 'RM ' + Math.round(val).toLocaleString('en-MY');
  };

  return (
    <section className="bg-slate-900 text-white py-20 sm:py-28 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-slate-800 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-500 block mb-3">
              {isEn ? 'Foodpanda Payout Audit' : 'Audit Bayaran Foodpanda'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-white leading-tight sm:leading-snug">
              {isEn
                ? 'Foodpanda Settlement Leakage & Recovery Calculator'
                : 'Kalkulator Ketirisan & Pemulihan Penyata Foodpanda'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono tracking-wider shrink-0 uppercase">
            {isEn ? 'Section // Payout Modeler' : 'Bahagian // Model Bayaran'}
          </div>
        </div>

        {/* 2-Column Corporate Layout (No Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 items-start">
          
          {/* Left Column: Interactive Sliders & Parameter Controls */}
          <div className="lg:col-span-6 space-y-8">
            <p className="text-xs sm:text-sm text-slate-300 font-light leading-relaxed">
              {isEn
                ? 'Estimate potential revenue leakage from your restaurant’s Foodpanda delivery orders. Our reconciliation ledger recovers uncompensated cancellations, rider-fault deductions, and uncredited promotional discounts.'
                : 'Anggarkan potensi ketirisan hasil daripada pesanan Foodpanda restoran anda. Lejar penyesuaian kami menuntut semula pesanan batal tanpa ganti rugi, potongan silap penghantar, dan baucar promosi yang tercicir.'}
            </p>

            {/* Slider 1: Monthly Foodpanda Sales Per Outlet */}
            <div className="space-y-3 pt-4 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase text-slate-400 font-bold tracking-wider">
                  {isEn ? 'Monthly Foodpanda Sales (Per Outlet):' : 'Jualan Foodpanda Bulanan (Setiap Cawangan):'}
                </span>
                <span className="text-base text-red-400 font-bold font-mono">
                  {formatCurrency(monthlyGmv)}
                </span>
              </div>
              <input
                type="range"
                min="5000"
                max="200000"
                step="5000"
                value={monthlyGmv}
                onChange={(e) => setMonthlyGmv(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-none appearance-none cursor-pointer accent-red-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>RM 5,000</span>
                <span>RM 100,000</span>
                <span>RM 200,000+</span>
              </div>
            </div>

            {/* Slider 2: Operating Outlets Count */}
            <div className="space-y-3 pt-6 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="uppercase text-slate-400 font-bold tracking-wider">
                  {isEn ? 'Foodpanda Active Outlets:' : 'Cawangan Aktif Foodpanda:'}
                </span>
                <span className="text-base text-red-400 font-bold font-mono">
                  {outletCount} {outletCount === 1 ? (isEn ? 'Outlet' : 'Cawangan') : (isEn ? 'Outlets' : 'Cawangan')}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={outletCount}
                onChange={(e) => setOutletCount(Number(e.target.value))}
                className="w-full h-2 bg-slate-950 rounded-none appearance-none cursor-pointer accent-red-600 focus:outline-none"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>1 Outlet</span>
                <span>10 Outlets</span>
                <span>25+ Outlets</span>
              </div>
            </div>

            {/* Aggregated Portfolio Snapshot */}
            <div className="pt-6 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400 uppercase tracking-wider">
                {isEn ? 'Total Monthly Foodpanda Portfolio GMV:' : 'Jumlah GMV Bulanan Portfolio Foodpanda:'}
              </span>
              <span className="text-white font-bold text-sm">
                {formatCurrency(totalMonthlyGmv)} / mo
              </span>
            </div>
          </div>

          {/* Right Column: Financial Yield Projection (Corporate Statement Style - Zero Cards) */}
          <div className="lg:col-span-6 bg-slate-950 border border-slate-800 p-6 sm:p-8">
            <div className="text-[10px] font-mono uppercase tracking-widest text-red-500 font-bold mb-4 pb-3 border-b border-slate-900 flex items-center justify-between">
              <span>{isEn ? 'Audited Foodpanda Recovery Projection' : 'Unjuran Pemulihan Foodpanda Diaudit'}</span>
              <span className="text-slate-400">99.85% AUDIT ACCURACY</span>
            </div>

            <div className="divide-y divide-slate-900 space-y-4">
              {/* Metric 1 */}
              <div className="pt-2 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {isEn ? 'Uncompensated Cancelled Orders Recaptured' : 'Pesanan Batal Tidak Diganti Yang Dituntut'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-light mt-0.5">
                    {isEn ? 'Rider no-show, app timeout refunds, and wrongful merchant deductions' : 'Kelewatan penghantar, ralat aplikasi, dan potongan tidak adil'}
                  </div>
                </div>
                <div className="text-sm sm:text-base font-mono font-bold text-emerald-400 shrink-0">
                  +{formatCurrency(estimatedCancelledOrderLoss)} <span className="text-[10px] text-slate-400">/mo</span>
                </div>
              </div>

              {/* Metric 2 */}
              <div className="pt-4 flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                    {isEn ? 'Uncredited Promotional Subsidies Recovered' : 'Subsidi Promosi Tercicir Yang Dipulihkan'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-light mt-0.5">
                    {isEn ? 'Co-funded campaign vouchers missing from weekly remittance batch' : 'Baucar kempen promosi bersama yang tiada dalam bayaran mingguan'}
                  </div>
                </div>
                <div className="text-sm sm:text-base font-mono font-bold text-emerald-400 shrink-0">
                  +{formatCurrency(uncreditedPromoLoss)} <span className="text-[10px] text-slate-400">/mo</span>
                </div>
              </div>

              {/* Grand Total Annual Bottom-Line Impact */}
              <div className="pt-6">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 mb-1">
                  {isEn ? 'Total Annual Cash Recovered to Restaurant:' : 'Jumlah Wang Tunai Tahunan Dipulihkan Kepada Restoran:'}
                </div>
                <div className="text-3xl sm:text-4xl font-sans font-bold tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-emerald-400">
                  +{formatCurrency(annualTotalRecaptured)}
                </div>
                <div className="text-[11px] text-slate-400 font-light mt-1">
                  {isEn
                    ? '100% credited directly into your restaurant’s registered bank account.'
                    : '100% dikreditkan terus ke akaun bank berdaftar restoran anda.'}
                </div>
              </div>
            </div>

            {/* Direct Action */}
            <div className="mt-8 pt-6 border-t border-slate-900">
              <Link
                href="/contact"
                className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-red-500 shadow-lg shadow-red-950/60"
              >
                <span>{isEn ? 'Request Free Foodpanda Settlement Audit ➔' : 'Minta Audit Penyata Foodpanda Percuma ➔'}</span>
              </Link>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
