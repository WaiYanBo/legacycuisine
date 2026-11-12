'use client';

import React from 'react';
import Link from 'next/link';

interface ValuePillarsProps {
  currentLang?: 'en' | 'ms';
}

export default function ValuePillars({ currentLang = 'en' }: ValuePillarsProps) {
  const isEn = currentLang === 'en';

  const pillars = [
    {
      num: '01',
      title: isEn ? 'Fast-Track 48-Hour Approval' : 'Kelulusan Pantas 48 Jam',
      subtitle: isEn ? 'Zero Document Rejection' : 'Sifar Penolakan Dokumen',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
      iconBg: 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/20',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      desc: isEn
        ? 'Applying on your own often takes 4 to 6 weeks with confusing rejections. As the appointed intermediary, our compliance officers pre-audit your SSM, bank header, and premise licenses to guarantee first-time approval in under 48 hours.'
        : 'Mendaftar secara bersendirian kerap mengambil masa 4 hingga 6 minggu dengan ralat dokumen. Sebagai perantara rasmi, pegawai kami menyemak profil SSM, kepala penyata bank, dan lesen premis untuk menjamin kelulusan kali pertama dalam 48 jam.',
    },
    {
      num: '02',
      title: isEn ? 'On-Site Terminal & Kitchen SOP' : 'Penyerahan Terminal & Latihan Premis',
      subtitle: isEn ? 'Hands-On Deployment' : 'Pemasangan Terus Di Dapur',
      badgeColor: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
      iconBg: 'bg-gradient-to-br from-red-600 to-red-800 shadow-red-500/20',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      desc: isEn
        ? 'Our field onboarding agent hand-delivers the official Foodpanda order-receiving tablet to your restaurant. We test live order fulfillment, train your kitchen crew on tablet hygiene, and configure operating hours so you launch smoothly without cancellations.'
        : 'Ejen kami menghantar tablet pesanan rasmi Foodpanda terus ke restoran anda. Kami menguji pesanan langsung, melatih staf dapur anda, dan menetapkan waktu operasi agar pelancaran berjalan lancar tanpa pembatalan.',
    },
    {
      num: '03',
      title: isEn ? 'Weekly Remittance Forensic Audit' : 'Audit Forensik Penyata Mingguan',
      subtitle: isEn ? 'Zero Revenue Leakage' : 'Perlindungan Hasil Jualan',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-400 dark:border-blue-800',
      iconBg: 'bg-gradient-to-br from-blue-600 to-indigo-600 shadow-blue-500/20',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      desc: isEn
        ? 'Foodpanda settles weekly, but calculating deductions for promotions, cancellations, rider delays, and statutory SST is complex. Our automated ledger cross-references POS records against Foodpanda remittance sheets to recover missing funds.'
        : 'Foodpanda membayar setiap minggu, namun mengira potongan promosi, pesanan batal, dan SST adalah rumit. Lejar automatik kami menyemak silang POS dengan penyata Foodpanda untuk menuntut bayaran yang tercicir.',
    },
  ];

  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
            {isEn ? 'The Intermediary Advantage' : 'Kelebihan Perantara Rasmi'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {isEn
              ? 'Why Malaysian Restaurants Partner with Legacy Cuisine'
              : 'Mengapa Restoran Malaysia Memilih Legacy Cuisine'}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {isEn
              ? 'We remove the operational and technical headaches so you can focus on cooking delicious food and scaling your brand.'
              : 'Kami menghapuskan kerumitan operasi dan teknikal agar anda dapat fokus memasak hidangan terbaik dan membesarkan perniagaan.'}
          </p>
        </div>

        {/* 3 Pillars in Premium Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {pillars.map((pillar) => (
            <div
              key={pillar.num}
              className="group p-5 sm:p-8 rounded-2xl bg-slate-50/70 dark:bg-slate-900/80 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:shadow-xl hover:border-red-300 dark:hover:border-red-800/80 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                {/* Card Icon & Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${pillar.iconBg}`}>
                    {pillar.icon}
                  </div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${pillar.badgeColor}`}>
                    {pillar.subtitle}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3 group-hover:text-red-600 transition-colors leading-snug">
                  {pillar.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                <Link
                  href="/services"
                  className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 inline-flex items-center gap-1.5 transition-colors"
                >
                  <span>{isEn ? 'Learn more about this workflow' : 'Ketahui aliran kerja ini'}</span>
                  <span>&rarr;</span>
                </Link>
                <span className="font-mono text-xs font-bold text-slate-300 dark:text-slate-700">
                  {pillar.num}
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
