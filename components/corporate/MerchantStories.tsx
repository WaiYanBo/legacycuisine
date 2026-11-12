'use client';

import React from 'react';
import Link from 'next/link';

interface MerchantStoriesProps {
  currentLang?: 'en' | 'ms';
}

export default function MerchantStories({ currentLang = 'en' }: MerchantStoriesProps) {
  const isEn = currentLang === 'en';

  const stories = [
    {
      name: isEn ? 'Heritage Kopitiam Group' : 'Kumpulan Kopitiam Heritage',
      initials: 'HK',
      badgeGradient: 'from-amber-500 to-orange-600',
      outlets: isEn ? '14 Klang Valley Outlets' : '14 Cawangan Lembah Klang',
      quote: isEn
        ? '“We struggled for over a month to get approved on Foodpanda directly. Legacy Cuisine’s agent collected our documents, audited our bank proofs, and had all 14 stores live within 3 days. Their weekly payout auditing has recovered tens of thousands of Ringgit in uncredited promotional subsidies.”'
        : '“Kami mencuba lebih sebulan untuk mendaftar sendiri ke Foodpanda. Ejen Legacy Cuisine menyemak dokumen kami dan mengaktifkan 14 cawangan kami dalam 3 hari. Audit bayaran mingguan mereka telah menuntut semula puluhan ribu Ringgit baucar promosi yang tercicir.”',
      author: isEn ? 'Mr. Tan Boon Kiat' : 'Encik Tan Boon Kiat',
      role: isEn ? 'Managing Director' : 'Pengarah Urusan',
      metric: isEn ? '+54% YoY Delivery Growth' : '+54% Pertumbuhan Jualan',
      metricColor: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
    },
    {
      name: isEn ? 'Restoran Nasi Kandar & Bistro' : 'Restoran Nasi Kandar & Bistro',
      initials: 'NK',
      badgeGradient: 'from-red-600 to-red-800',
      outlets: isEn ? '22 Outlets (Selangor & Penang)' : '22 Cawangan (Selangor & P. Pinang)',
      quote: isEn
        ? '“Legacy Cuisine’s field representatives came directly to our outlets, set up our Foodpanda tablets, and trained our kitchen crew. Our food cancellation rate dropped from 7% to under 0.8%. They make dealing with Foodpanda painless and profitable.”'
        : '“Wakil lapangan Legacy Cuisine datang terus ke cawangan kami, memasang tablet Foodpanda, dan melatih staf dapur kami. Kadar pembatalan pesanan kami turun dari 7% kepada bawah 0.8%. Mereka memudahkan segalanya dan meningkatkan keuntungan.”',
      author: isEn ? 'Haji Shahrul Nizam' : 'Haji Shahrul Nizam',
      role: isEn ? 'Chief Operating Officer' : 'Ketua Pegawai Operasi',
      metric: isEn ? 'Cancellation < 0.8%' : 'Pembatalan < 0.8%',
      metricColor: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/60 border-red-200 dark:border-red-800',
    },
  ];

  return (
    <section className="bg-slate-50/60 dark:bg-[#070a12] py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
              {isEn ? 'Proven Merchant Results' : 'Hasil Peniaga Terbukti'}
            </div>
            <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {isEn
                ? 'Trusted by Over 1,250 Restaurant Outlets'
                : 'Dipercayai Lebih 1,250 Cawangan Restoran'}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'From beloved traditional eateries to multi-outlet regional franchise chains, see how our authorised intermediary services deliver results.'
                : 'Daripada restoran tradisional sehingga rangkaian francais serantau, lihat bagaimana perkhidmatan perantara rasmi kami membantu.'}
            </p>
          </div>

          <Link
            href="/testimony"
            className="text-xs font-bold uppercase tracking-wider text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center gap-1.5 shrink-0"
          >
            <span>{isEn ? 'Read all case studies' : 'Baca semua kajian kes'}</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* Stories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {stories.map((st, idx) => (
            <div
              key={idx}
              className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${st.badgeGradient} text-white font-extrabold text-sm flex items-center justify-center shadow-md`}>
                      {st.initials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">
                        {st.name}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {st.outlets}
                      </div>
                    </div>
                  </div>

                  <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${st.metricColor}`}>
                    {st.metric}
                  </span>
                </div>

                {/* Star rating */}
                <div className="flex items-center gap-1 text-amber-400 text-sm mb-3">
                  ★★★★★
                </div>

                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed italic mb-6">
                  {st.quote}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {st.author}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    {st.role}
                  </div>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {isEn ? 'Verified Foodpanda Merchant' : 'Peniaga Foodpanda Sah'}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Fast-Track Banner */}
        <div className="mt-12 p-8 sm:p-10 rounded-2xl bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-xl shadow-red-600/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <h3 className="text-xl sm:text-2xl font-extrabold text-white">
              {isEn ? 'Ready to Join 1,250+ Malaysian Restaurants on Foodpanda?' : 'Bersedia Menyertai 1,250+ Restoran di Foodpanda?'}
            </h3>
            <p className="text-xs sm:text-sm text-red-100 max-w-xl">
              {isEn
                ? 'Get your restaurant approved within 48 business hours with zero upfront software fees and hands-on tablet delivery.'
                : 'Dapatkan kelulusan restoran dalam 48 jam tanpa bayaran perisian pendahuluan serta penyerahan tablet di premis.'}
            </p>
          </div>

          <Link
            href="/contact"
            className="px-7 py-4 rounded-xl bg-white hover:bg-slate-50 text-red-600 font-bold text-xs uppercase tracking-wider shrink-0 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
          >
            {isEn ? 'Apply via Authorised Intermediary' : 'Daftar Melalui Perantara Rasmi'}
          </Link>
        </div>

      </div>
    </section>
  );
}
