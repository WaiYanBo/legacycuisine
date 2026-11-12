'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CorporateNav from '../../components/corporate/CorporateNav';
import CorporateFooter from '../../components/corporate/CorporateFooter';
import FloatingPortalPill from '../../components/corporate/FloatingPortalPill';

export default function TestimonyPage() {
  const [lang, setLang] = useState<'en' | 'ms'>('en');
  const isEn = lang === 'en';

  const testimonials = [
    {
      id: 'CS-FP-01',
      brand: isEn ? 'Heritage Kopitiam Group' : 'Kumpulan Kopitiam Heritage',
      initials: 'HK',
      badgeGradient: 'from-amber-500 to-orange-600',
      segment: isEn ? 'Traditional Coffee & Dining &bull; 14 Klang Valley Outlets' : 'Kopitiam Tradisi & Makanan &bull; 14 Cawangan Lembah Klang',
      quote: isEn
        ? '“Direct platform application resulted in a five-week administrative delay due to document revisions. Upon engagement, Legacy Cuisine resolved all regulatory documentation, deployed terminal hardware, and brought all 14 stores live within 72 hours. Their weekly remittance audits have consistently recovered uncredited promotional subsidies.”'
        : '“Permohonan secara terus mengalami kelewatan pentadbiran selama lima minggu akibat semakan dokumen. Selepas berurusan, Legacy Cuisine menyelesaikan dokumentasi, menyerahkan peranti terminal, dan mengaktifkan kesemua 14 cawangan dalam masa 72 jam. Audit penyata mingguan mereka berjaya menuntut semula subsidi promosi yang tercicir.”',
      author: isEn ? 'Mr. Tan Boon Kiat' : 'Encik Tan Boon Kiat',
      title: isEn ? 'Managing Director' : 'Pengarah Urusan',
      metrics: [
        { label: isEn ? 'Activation Speed' : 'Kelajuan Pengaktifan', val: '72 Hours', color: 'text-red-600 dark:text-red-400' },
        { label: isEn ? 'Dispute Recovery' : 'Tuntutan Dipulihkan', val: 'RM 28,400', color: 'text-emerald-500' },
        { label: isEn ? 'Fulfillment SLA' : 'SLA Pemenuhan', val: '99.4%', color: 'text-blue-500' },
      ],
    },
    {
      id: 'CS-FP-02',
      brand: isEn ? 'Restoran Nasi Kandar & Bistro' : 'Restoran Nasi Kandar & Bistro',
      initials: 'NK',
      badgeGradient: 'from-red-600 to-red-800',
      segment: isEn ? 'High-Volume Fast-Casual &bull; 22 Outlets (Selangor & Penang)' : 'Perkhidmatan Pantas Volum Tinggi &bull; 22 Cawangan (Selangor & P. Pinang)',
      quote: isEn
        ? '“Kitchen operational friction was causing severe cancellation rates across peak dinner shifts. Legacy Cuisine conducted on-site staff training drills on terminal hygiene and introduced cancellation mitigation SOPs. Order cancellation incidence declined to below 0.8%, with weekly settlement statements reconciled without discrepancy.”'
        : '“Geseran operasi dapur sebelum ini menyebabkan kadar pembatalan pesanan yang tinggi pada waktu puncak. Legacy Cuisine menjalankan latihan staf di premis berkenaan penggunaan terminal serta memperkenalkan SOP pencegahan. Kadar pembatalan menurun ke bawah 0.8% dengan penyata bayaran diaudit teratur setiap minggu.”',
      author: isEn ? 'Haji Shahrul Nizam' : 'Haji Shahrul Nizam',
      title: isEn ? 'Chief Operating Officer' : 'Ketua Pegawai Operasi',
      metrics: [
        { label: isEn ? 'Cancellation Rate' : 'Kadar Pembatalan', val: '< 0.8%', color: 'text-emerald-500' },
        { label: isEn ? 'Monthly Volume' : 'Jualan Bulanan', val: 'RM 1.4M / Mo', color: 'text-red-600 dark:text-red-400' },
        { label: isEn ? 'Reconciliation SLA' : 'SLA Penyata', val: '100% On-Time', color: 'text-blue-500' },
      ],
    },
    {
      id: 'CS-FP-03',
      brand: isEn ? 'Artisanal Bakery & Cafe Studio' : 'Bakeri & Kafe Butik Artisanal',
      initials: 'AB',
      badgeGradient: 'from-purple-600 to-indigo-600',
      segment: isEn ? 'Specialty Pastry & Beverage &bull; 4 Outlets (Kuala Lumpur)' : 'Pastri Khas & Minuman &bull; 4 Cawangan (Kuala Lumpur)',
      quote: isEn
        ? '“Legacy Cuisine restructured our catalogue into Foodpanda compliant combo sets and modifier chains. Within our first month on the platform, our delivery volume scaled threefold, supported by punctual Monday remittance audits that eliminate revenue leakage.”'
        : '“Legacy Cuisine menyusun semula katalog kami kepada set kombo dan variasi menepati syarat Foodpanda. Dalam bulan pertama operasi, volum penghantaran meningkat tiga kali ganda, disokong oleh audit penyata setiap Isnin yang mengelakkan ketirisan hasil.”',
      author: isEn ? 'Cynthia Wong' : 'Cynthia Wong',
      title: isEn ? 'Founder & Head Baker' : 'Pengasas & Ketua Pembuat Roti',
      metrics: [
        { label: isEn ? 'Menu Conversion Lift' : 'Kenaikan Penukaran Menu', val: '+38%', color: 'text-purple-500' },
        { label: isEn ? 'Onboarding Time' : 'Tempoh Pengaktifan', val: '48 Hours', color: 'text-red-600 dark:text-red-400' },
        { label: isEn ? 'Volume Growth' : 'Pertumbuhan Jualan', val: '3x Volume', color: 'text-emerald-500' },
      ],
    },
    {
      id: 'CS-FP-04',
      brand: isEn ? 'Selera Tradisi Melayu Asli' : 'Restoran Selera Tradisi Melayu Asli',
      initials: 'ST',
      badgeGradient: 'from-emerald-500 to-teal-600',
      segment: isEn ? 'Halal Authentic Malay Cuisine &bull; 6 Outlets' : 'Masakan Tradisi Melayu Halal &bull; 6 Cawangan',
      quote: isEn
        ? '“As traditional restaurateurs, platform onboarding procedures were operationally unfamiliar. Legacy Cuisine’s field officer handled the entire documentation dossier, configured the terminal at our premise, and provided practical staff guidance. A dependable intermediary partner.”'
        : '“Sebagai pengusaha restoran tradisional, tatacara pendaftaran platform agak asing bagi kami. Pegawai lapangan Legacy Cuisine menguruskan keseluruhan berkas dokumen, menetapkan terminal di premis, serta memberi bimbingan staf secara praktikal. Rakan perantara yang boleh dipercayai.”',
      author: isEn ? 'Datin Faridah Yusof' : 'Datin Faridah Yusof',
      title: isEn ? 'Executive Director' : 'Pengarah Eksekutif',
      metrics: [
        { label: isEn ? 'Staff Training SLA' : 'Masa Latihan Staf', val: '1 Day', color: 'text-blue-500' },
        { label: isEn ? 'Document Compliance' : 'Pematuhan Dokumen', val: '100% Passed', color: 'text-emerald-500' },
        { label: isEn ? 'Recovered Deductions' : 'Tuntutan Dipulihkan', val: '+RM 12,800', color: 'text-red-600 dark:text-red-400' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation */}
      <CorporateNav currentLang={lang} onLangChange={setLang} />

      <main className="flex-1">
        {/* Testimony Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-red-50/20 dark:from-[#070a12] dark:via-[#0c111d] dark:to-[#070a12] py-20 sm:py-24 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
              <Link href="/" className="hover:text-red-600 transition-colors">
                {isEn ? 'Home' : 'Utama'}
              </Link>
              <span>/</span>
              <span className="text-red-600 dark:text-red-400 font-bold">
                {isEn ? 'Merchant Stories' : 'Kisah Peniaga'}
              </span>
            </div>

            <div className="max-w-3xl">
              <span className="inline-block px-3.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800 mb-4">
                {isEn ? 'Verified Restaurant Track Record' : 'Rekod Prestasi Restoran Sah'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {isEn ? (
                  <>
                    Documented Operational Case Studies
                  </>
                ) : (
                  <>
                    Kajian Kes Peniaga Restoran Terpilih
                  </>
                )}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {isEn
                  ? 'Over 1,250 restaurants across Malaysia count on Legacy Cuisine to onboard, manage, and reconcile their operations on Foodpanda.'
                  : 'Lebih 1,250 restoran di seluruh Malaysia bergantung kepada Legacy Cuisine untuk mendaftar, mengurus, dan menyelaraskan operasi mereka di Foodpanda.'}
              </p>
            </div>
          </div>
        </section>

        {/* Testimonials List */}
        <section className="py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#070a12] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
            {testimonials.map((t) => (
              <div
                key={t.id}
                className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col md:flex-row justify-between gap-6 sm:gap-8 items-start"
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${t.badgeGradient} text-white font-extrabold text-sm flex items-center justify-center shadow-md shrink-0`}>
                      {t.initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                        {t.brand}
                      </h3>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                        {t.segment}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                    ★★★★★
                  </div>

                  <blockquote className="text-slate-700 dark:text-slate-300 text-sm sm:text-base leading-relaxed italic border-l-2 border-red-600 pl-4">
                    {t.quote}
                  </blockquote>

                  <div className="font-mono text-xs text-slate-500 dark:text-slate-400 pt-2">
                    <strong className="text-slate-900 dark:text-white font-bold">{t.author}</strong> &bull; {t.title}
                  </div>
                </div>

                <div className="w-full md:w-64 bg-slate-50 dark:bg-slate-800/80 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0 space-y-3">
                  <div className="font-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700 pb-2">
                    {isEn ? 'AUDITED OUTCOMES' : 'HASIL DISAHKAN'}
                  </div>
                  {t.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="flex justify-between items-center text-xs">
                      <span className="text-slate-600 dark:text-slate-400">{m.label}</span>
                      <span className={`font-mono font-bold text-sm ${m.color}`}>{m.val}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-950 to-red-950/40 text-white py-20 text-center border-t border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isEn ? 'Join Over 1,250 Restaurants on Foodpanda' : 'Sertai Lebih 1,250 Restoran di Foodpanda'}
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95"
              >
                {isEn ? 'Onboard Your Restaurant Today' : 'Daftar Restoran Anda Hari Ini'}
              </Link>
              <Link
                href="/login"
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 font-semibold text-xs uppercase tracking-wider transition-colors"
              >
                {isEn ? 'Staff Portal Login' : 'Log Masuk Portal Staf'}
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Pill */}
      <FloatingPortalPill currentLang={lang} />

      {/* Footer */}
      <CorporateFooter currentLang={lang} />
    </div>
  );
}
