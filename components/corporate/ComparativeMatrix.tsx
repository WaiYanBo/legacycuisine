'use client';

import React from 'react';

interface ComparativeMatrixProps {
  currentLang?: 'en' | 'ms';
}

export default function ComparativeMatrix({ currentLang = 'en' }: ComparativeMatrixProps) {
  const isEn = currentLang === 'en';

  const rows = [
    {
      dimension: isEn ? 'Application & Approval Timeline' : 'Tempoh Permohonan & Kelulusan',
      direct: isEn ? '3 to 6 weeks; recurring document rejection cycles' : '3 hingga 6 minggu; ralat dan penolakan dokumen berulang',
      intermediary: isEn ? 'Under 48 hours via dedicated intermediary approval queue' : 'Bawah 48 jam melalui saluran perantara rasmi',
    },
    {
      dimension: isEn ? 'Menu Architecture & Engineering' : 'Struktur & Format Menu',
      direct: isEn ? 'Self-managed upload; frequent formatting and modifier errors' : 'Muat naik sendiri; kerap ralat format dan pilihan tambahan',
      intermediary: isEn ? 'Turnkey digitisation, combo hierarchy, and photo optimization' : 'Penyusunan menyeluruh, hierarki kombo, dan panduan foto piawai',
    },
    {
      dimension: isEn ? 'Terminal Deployment & Handover' : 'Penyerahan & Pemasangan Terminal',
      direct: isEn ? 'Dispatched via courier with unassisted manual setup' : 'Dihantar melalui kurier tanpa bantuan teknikal di premis',
      intermediary: isEn ? 'Hand-delivered to kitchen with on-site staff training drill' : 'Dihantar terus ke dapur beserta latihan staf dan ujian langsung',
    },
    {
      dimension: isEn ? 'Weekly Payout Audit & Recovery' : 'Audit Penyata & Tuntutan Bayaran',
      direct: isEn ? 'Zero auditing; remittances accepted without reconciliation' : 'Tiada audit; penyata diterima tanpa semakan silang',
      intermediary: isEn ? 'Weekly POS cross-referencing to recover deduction leakages' : 'Semakan silang mingguan POS untuk menuntut potongan tercicir',
    },
    {
      dimension: isEn ? 'Cancellations & Rider Discrepancies' : 'Pesanan Batal & Pertikaian Penghantar',
      direct: isEn ? 'Auto-debited deductions; lengthy support ticket delays' : 'Potongan dibuat automatik; kelewatan maklum balas tiket sokongan',
      intermediary: isEn ? 'Direct dispute desk escalation for prompt reimbursement' : 'Tuntutan terus melalui saluran perantara untuk ganti rugi segera',
    },
    {
      dimension: isEn ? 'Account Management & Governance' : 'Pengurusan Akaun & Sokongan',
      direct: isEn ? 'Automated chatbot or generic helpdesk queue' : 'Chatbot automatik atau saluran bantuan generik',
      intermediary: isEn ? 'Dedicated institutional account officer and field agent' : 'Pegawai akaun institusi berdedikasi dan wakil lapangan tetap',
    },
  ];

  return (
    <section id="comparison" className="bg-slate-50/60 dark:bg-[#070a12] py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-8 border-b border-slate-200 dark:border-slate-800 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
              {isEn ? 'The Intermediary Advantage' : 'Kelebihan Perantara Rasmi'}
            </div>
            <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {isEn
                ? 'Applying to Foodpanda Alone vs. Through Legacy Cuisine'
                : 'Mendaftar Sendiri ke Foodpanda vs. Melalui Legacy Cuisine'}
            </h2>
          </div>
          <div className="font-mono text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider shrink-0">
            {isEn ? 'Comparative Analysis &bull; 2026 Metrics' : 'Analisis Perbandingan &bull; Data 2026'}
          </div>
        </div>

        {/* Mobile Horizontal Scroll Indicator Hint */}
        <div className="md:hidden flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400 mt-6 px-1">
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4 animate-pulse text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>{isEn ? 'Swipe table horizontally to compare' : 'Tatal jadual ke kanan untuk banding'}</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 dark:bg-red-950/60 px-2 py-0.5 rounded-full">
            {isEn ? 'Scrollable' : 'Boleh Tatal'}
          </span>
        </div>

        {/* Tabular Executive Comparison */}
        <div className="mt-2 sm:mt-8 overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md -mx-4 sm:mx-0">
          <table className="w-full min-w-[620px] text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-800/60">
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 font-mono text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400 w-1/4">
                  {isEn ? 'Operational Dimension' : 'Dimensi Operasi'}
                </th>
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 font-mono text-xs font-bold uppercase tracking-wider text-slate-400 w-3/8 bg-slate-50/50 dark:bg-slate-900/40">
                  {isEn ? 'Direct Self-Application' : 'Pendaftaran Sendiri'}
                </th>
                <th className="py-3.5 sm:py-4 px-4 sm:px-6 font-mono text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400 w-3/8 bg-red-50/60 dark:bg-red-950/40 border-l border-red-200 dark:border-red-800/80">
                  {isEn ? 'Via Legacy Cuisine (Authorised Intermediary)' : 'Melalui Legacy Cuisine (Perantara Rasmi)'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs sm:text-sm">
              {rows.map((row, idx) => (
                <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 sm:py-5 px-4 sm:px-6 font-bold text-slate-900 dark:text-white align-top">
                    {row.dimension}
                  </td>
                  <td className="py-4 sm:py-5 px-4 sm:px-6 text-slate-500 dark:text-slate-400 bg-slate-50/40 dark:bg-slate-900/30 align-top leading-relaxed">
                    <span className="text-red-400 font-bold mr-2">✕</span>
                    {row.direct}
                  </td>
                  <td className="py-4 sm:py-5 px-4 sm:px-6 text-slate-900 dark:text-slate-100 font-medium bg-red-50/20 dark:bg-red-950/20 border-l border-red-200/80 dark:border-red-800/60 align-top leading-relaxed">
                    <span className="text-emerald-500 font-bold mr-2 text-sm">✓</span>
                    {row.intermediary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 text-right">
          <span className="font-mono text-[11px] text-slate-400 uppercase tracking-wider">
            {isEn
              ? '* Based on average merchant activation benchmarks and Foodpanda audit records, 2026'
              : '* Berdasarkan penanda aras pengaktifan peniaga dan rekod audit Foodpanda, 2026'}
          </span>
        </div>

      </div>
    </section>
  );
}
