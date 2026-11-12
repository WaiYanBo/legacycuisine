'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface PayoutCalculatorProps {
  currentLang?: 'en' | 'ms';
}

export default function PayoutCalculator({ currentLang = 'en' }: PayoutCalculatorProps) {
  const isEn = currentLang === 'en';
  const [sales, setSales] = useState<number>(35000);
  const [outlets, setOutlets] = useState<number>(2);

  const totalSales = sales * outlets;
  const cancellationRecovered = totalSales * 0.025; // ~2.5%
  const promoRecovered = totalSales * 0.015; // ~1.5%
  const monthlyTotal = cancellationRecovered + promoRecovered;
  const annualTotal = monthlyTotal * 12;

  const formatRM = (val: number) => {
    return 'RM ' + Math.round(val).toLocaleString('en-MY');
  };

  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
            {isEn ? 'Foodpanda Payout Transparency' : 'Ketelusan Bayaran Foodpanda'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {isEn
              ? 'Foodpanda Remittance Leakage Calculator'
              : 'Kalkulator Ketirisan Penyata Foodpanda'}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {isEn
              ? 'Calculate how much uncompensated cancelled order deductions and missing promotional subsidies your restaurant can recover annually through automated audit ledgers.'
              : 'Kira anggaran potongan pesanan batal tidak diganti dan subsidi promosi tercicir yang boleh dituntut semula oleh restoran anda setiap tahun.'}
          </p>
        </div>

        {/* 2-Column Calculator Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
          
          {/* Controls Column */}
          <div className="lg:col-span-6 bg-slate-50/80 dark:bg-slate-900 p-5 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-6 sm:space-y-8 flex flex-col justify-between">
            <div className="space-y-6 sm:space-y-8">
              <div>
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5 sm:mb-3">
                  <span>{isEn ? 'Monthly Foodpanda Turnover (Per Outlet):' : 'Jualan Bulanan Foodpanda (Setiap Cawangan):'}</span>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-red-600 dark:text-red-400">{formatRM(sales)}</span>
                </div>
                <input
                  type="range"
                  min="5000"
                  max="150000"
                  step="5000"
                  value={sales}
                  onChange={(e) => setSales(Number(e.target.value))}
                  className="w-full h-3 sm:h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600 touch-none"
                />
                <div className="flex justify-between font-mono text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  <span>RM 5k</span>
                  <span>RM 75k</span>
                  <span>RM 150k+</span>
                </div>
              </div>

              <div className="pt-5 sm:pt-6 border-t border-slate-200 dark:border-slate-800">
                <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mb-2.5 sm:mb-3">
                  <span>{isEn ? 'Number of Operating Outlets:' : 'Bilangan Cawangan Beroperasi:'}</span>
                  <span className="font-mono text-sm sm:text-base font-extrabold text-red-600 dark:text-red-400">
                    {outlets} {outlets === 1 ? (isEn ? 'Outlet' : 'Cawangan') : (isEn ? 'Outlets' : 'Cawangan')}
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={outlets}
                  onChange={(e) => setOutlets(Number(e.target.value))}
                  className="w-full h-3 sm:h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-red-600 touch-none"
                />
                <div className="flex justify-between font-mono text-[10px] sm:text-[11px] text-slate-400 dark:text-slate-500 mt-2">
                  <span>1 Outlet</span>
                  <span>10 Outlets</span>
                  <span>20 Outlets</span>
                </div>
              </div>
            </div>

            <div className="pt-5 sm:pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              <span className="font-semibold">{isEn ? 'Total Portfolio Volume:' : 'Jumlah Jualan Portfolio:'}</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">{formatRM(totalSales)} / mo</span>
            </div>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 via-slate-950 to-red-950/40 text-white p-5 sm:p-8 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-[11px] sm:text-xs uppercase tracking-wider font-bold mb-5 sm:mb-6">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>{isEn ? 'Audited Cash Recovery Projection' : 'Unjuran Pemulihan Wang Tunai'}</span>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {isEn ? 'Cancelled Orders & Dispatch Faults' : 'Pesanan Batal & Ralat Penghantar'}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      {isEn ? 'Automatic reimbursement claims' : 'Tuntutan bayaran ganti automatik'}
                    </div>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-emerald-400 shrink-0">
                    +{formatRM(cancellationRecovered)} / mo
                  </div>
                </div>

                <div className="flex justify-between items-start pb-4 border-b border-slate-800/80">
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-white">
                      {isEn ? 'Missing Promotional Voucher Subsidies' : 'Subsidi Baucar Promosi Tercicir'}
                    </div>
                    <div className="text-[11px] sm:text-xs text-slate-400 mt-0.5">
                      {isEn ? 'Co-funded campaign reconciliation' : 'Penyesuaian kempen tajaan bersama'}
                    </div>
                  </div>
                  <div className="font-mono text-xs sm:text-sm font-bold text-emerald-400 shrink-0">
                    +{formatRM(promoRecovered)} / mo
                  </div>
                </div>

                <div className="pt-2">
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-slate-400 mb-1">
                    {isEn ? 'Total Annual Recovered Directly to Bank:' : 'Jumlah Pemulihan Tahunan Terus ke Bank:'}
                  </div>
                  <div className="text-2xl sm:text-4xl font-extrabold font-mono text-transparent bg-clip-text bg-gradient-to-r from-red-400 via-amber-300 to-amber-200">
                    +{formatRM(annualTotal)}
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-5 sm:pt-6 mt-5 sm:mt-6 border-t border-slate-800 relative z-10">
              <Link
                href="/contact"
                className="w-full min-h-[48px] py-3.5 sm:py-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center flex items-center justify-center shadow-lg shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95"
              >
                {isEn ? 'Request Full Foodpanda Remittance Audit' : 'Minta Audit Penyata Foodpanda Lengkap'}
              </Link>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
