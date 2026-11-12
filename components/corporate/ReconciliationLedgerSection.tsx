'use client';

import React, { useState } from 'react';

interface ReconciliationLedgerSectionProps {
  currentLang?: 'en' | 'ms';
}

export default function ReconciliationLedgerSection({ currentLang = 'en' }: ReconciliationLedgerSectionProps) {
  const isEn = currentLang === 'en';
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | 'MATCHED' | 'DISPUTED' | 'RECOVERED'>('ALL');

  const auditCategories = [
    {
      category: isEn ? 'Foodpanda Commission Rate Verification' : 'Pengesahan Kadar Komisen Foodpanda',
      desc: isEn
        ? 'Cross-verifying your agreed merchant contract commission against Foodpanda’s weekly remittance deductions to eliminate rate mismatches.'
        : 'Menyemak kadar komisen kontrak peniaga yang dipersetujui dengan potongan penyata mingguan Foodpanda bagi menghapuskan ketidakpadanan kadar.',
      recoveryRate: '100%',
    },
    {
      category: isEn ? 'Unjustified Customer Cancellation Deductions' : 'Potongan Pesanan Batal Tanpa Asas',
      desc: isEn
        ? 'Rider no-shows or app timeout cancellations often result in automatic merchant deductions. We cross-reference kitchen preparation timestamps to claim full reimbursement.'
        : 'Kelewatan penghantar atau pembatalan masa tamat aplikasi sering ditolak daripada peniaga. Kami menyemak cap masa penyediaan dapur untuk menuntut ganti rugi penuh.',
      recoveryRate: '92.4%',
    },
    {
      category: isEn ? 'PandaPro & Campaign Voucher Subsidies' : 'Subsidi Baucar PandaPro & Kempen Promosi',
      desc: isEn
        ? 'Foodpanda co-funded promotional discounts and voucher credits are tracked down to the individual cent to ensure missing subsidies are reimbursed.'
        : 'Diskaun tajaan bersama Foodpanda dan kredit baucar promosi dijejak hingga ke sen terakhir untuk memastikan subsidi yang tercicir dibayar ganti.',
      recoveryRate: '98.7%',
    },
    {
      category: isEn ? 'Weekly Bank Remittance Turnaround' : 'Penyelesaian Bayaran Bank Mingguan',
      desc: isEn
        ? 'Continuous liquidity monitoring that audits whether Foodpanda weekly batch payouts hit merchant bank accounts on the designated settlement day.'
        : 'Pemantauan kecairan berterusan yang mengaudit sama ada bayaran mingguan Foodpanda dikreditkan ke akaun bank peniaga pada hari perjanjian.',
      recoveryRate: 'SLA < 48h',
    },
  ];

  const allTickets = [
    { id: 'FP-BATCH-88291', outlet: isEn ? 'Kopitiam Bangsar' : 'Kopitiam Bangsar', pos: 'RM 1,480.00', settled: 'RM 1,480.00', status: 'MATCHED', badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50', variance: 'RM 0.00' },
    { id: 'FP-BATCH-88294', outlet: isEn ? 'Bistro Shah Alam' : 'Bistro Shah Alam', pos: 'RM 3,420.00', settled: 'RM 3,197.80', status: 'DISPUTED', badge: 'text-amber-400 bg-amber-950/60 border-amber-800/50', variance: '+RM 222.20' },
    { id: 'FP-BATCH-88302', outlet: isEn ? 'Cafe Damansara' : 'Kafe Damansara', pos: 'RM 962.00', settled: 'RM 962.00', status: 'MATCHED', badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50', variance: 'RM 0.00' },
    { id: 'FP-BATCH-88319', outlet: isEn ? 'Nasi Kandar Subang' : 'Nasi Kandar Subang', pos: 'RM 4,210.00', settled: 'RM 3,960.00', status: 'RECOVERED', badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50', variance: '+RM 250.00' },
    { id: 'FP-BATCH-88325', outlet: isEn ? 'Bakery Mont Kiara' : 'Bakeri Mont Kiara', pos: 'RM 1,895.00', settled: 'RM 1,895.00', status: 'MATCHED', badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50', variance: 'RM 0.00' },
    { id: 'FP-BATCH-88338', outlet: isEn ? 'Dapur Melayu Cheras' : 'Dapur Melayu Cheras', pos: 'RM 2,178.50', settled: 'RM 1,993.50', status: 'RECOVERED', badge: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/50', variance: '+RM 185.00' },
  ];

  const filteredTickets = selectedStatus === 'ALL'
    ? allTickets
    : allTickets.filter(t => t.status === selectedStatus);

  return (
    <section id="reconciliation" className="bg-slate-950 text-white py-20 sm:py-28 border-b border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-slate-800 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-500 block mb-3">
              {isEn ? 'Foodpanda Settlement Audit' : 'Audit Penyata Foodpanda'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-white leading-tight sm:leading-snug">
              {isEn ? 'Automated Foodpanda Payout Reconciliation Ledger' : 'Lejar Penyesuaian Penyata Mingguan Foodpanda'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono tracking-wider shrink-0 uppercase">
            {isEn ? 'Section 04 // Financial Integrity' : 'Bahagian 04 // Integriti Kewangan'}
          </div>
        </div>

        {/* Narrative & Institutional Ledger Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 pt-10 items-start">
          
          {/* Left: Audit Scope & Description (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <p className="text-sm sm:text-base text-slate-300 font-light leading-relaxed">
              {isEn
                ? 'Every week, Foodpanda remits payments to thousands of Malaysian restaurants. Due to cancellations, promo vouchers, and complex fee schedules, 2% to 5% of revenue can be lost without forensic auditing. Legacy Cuisine’s proprietary reconciliation ledger audits every weekly settlement batch to ensure zero revenue leakage.'
                : 'Setiap minggu, Foodpanda membayar penyelesaian kepada ribuan restoran Malaysia. Akibat pesanan batal, baucar promosi, dan potongan yuran, 2% hingga 5% hasil berisiko hilang tanpa audit forensik. Lejar proprietari Legacy Cuisine mengaudit setiap penyata mingguan untuk menjamin sifar ketirisan hasil.'}
            </p>

            {/* Audit Checklist Items */}
            <div className="divide-y divide-slate-800 border-t border-slate-800">
              {auditCategories.map((item, idx) => (
                <div key={idx} className="py-4">
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider mb-1">
                    <span className="text-white">{item.category}</span>
                    <span className="text-red-400 font-mono text-[11px] bg-red-950/80 px-2 py-0.5 border border-red-800/40">
                      {item.recoveryRate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-light">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Institutional Ledger Display (7 cols - Financial Terminal Style, No Cards) */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                <span className="font-mono font-bold tracking-wider text-slate-200 uppercase">
                  {isEn ? 'Foodpanda Weekly Settlement Audit Stream' : 'Aliran Audit Bayaran Mingguan Foodpanda'}
                </span>
              </div>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 font-mono text-[10px]">
                {(['ALL', 'MATCHED', 'DISPUTED', 'RECOVERED'] as const).map(st => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setSelectedStatus(st)}
                    className={`px-2 py-1 transition-colors ${
                      selectedStatus === st
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Terminal Table */}
            <div className="overflow-x-auto mt-4">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 pr-3">{isEn ? 'Batch ID' : 'ID Kelompok'}</th>
                    <th className="py-2.5 pr-3">{isEn ? 'Restaurant Outlet' : 'Cawangan Restoran'}</th>
                    <th className="py-2.5 pr-3">{isEn ? 'POS Val' : 'Nilai POS'}</th>
                    <th className="py-2.5 pr-3">{isEn ? 'Remitted' : 'Dibayar'}</th>
                    <th className="py-2.5 pr-3">{isEn ? 'Status' : 'Status'}</th>
                    <th className="py-2.5 text-right">{isEn ? 'Variance' : 'Varians'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {filteredTickets.map(ticket => (
                    <tr key={ticket.id} className="hover:bg-slate-850/40 transition-colors">
                      <td className="py-3 pr-3 text-white font-bold">{ticket.id}</td>
                      <td className="py-3 pr-3 text-slate-300">{ticket.outlet}</td>
                      <td className="py-3 pr-3">{ticket.pos}</td>
                      <td className="py-3 pr-3 text-slate-300">{ticket.settled}</td>
                      <td className="py-3 pr-3">
                        <span className={`text-[10px] px-1.5 py-0.5 border ${ticket.badge}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td className={`py-3 text-right font-bold ${ticket.variance === 'RM 0.00' ? 'text-slate-400 font-normal' : 'text-emerald-400'}`}>
                        {ticket.variance}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Reconciliation Audit Summary Banner */}
            <div className="mt-6 pt-5 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
              <div>
                <div className="text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                  {isEn ? 'Weekly Foodpanda Portfolio Reconciled' : 'Penyata Foodpanda Mingguan Diaudit'}
                </div>
                <div className="text-lg font-bold text-white font-mono mt-0.5">
                  RM 1,223,035.00 / Wk
                </div>
              </div>

              <div className="sm:text-right">
                <div className="text-slate-400 uppercase text-[10px] tracking-wider font-mono">
                  {isEn ? 'Merchant Dispute Recovery Yield' : 'Hasil Pemulihan Peniaga'}
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                  +RM 42,180.00 / Mo
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
