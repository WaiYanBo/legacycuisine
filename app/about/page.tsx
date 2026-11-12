'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import CorporateNav from '../../components/corporate/CorporateNav';
import CorporateFooter from '../../components/corporate/CorporateFooter';
import FloatingPortalPill from '../../components/corporate/FloatingPortalPill';

export default function AboutPage() {
  const [lang, setLang] = useState<'en' | 'ms'>('en');
  const isEn = lang === 'en';

  const divisions = [
    {
      code: 'DIV-01',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
      name: isEn ? 'Merchant Acquisition & Compliance Field Desk' : 'Pengambilan Peniaga & Pematuhan Lapangan',
      desc: isEn
        ? 'Nationwide network of certified field representatives conducting on-site kitchen inspections, document audits, and merchant qualification to ensure zero regulatory rejection.'
        : 'Rangkaian wakil lapangan bertauliah seluruh negara yang menjalankan pemeriksaan dapur di premis, semakan dokumen, dan saringan kelayakan bagi menjamin kelulusan bebas ralat.',
    },
    {
      code: 'DIV-02',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
      name: isEn ? 'Digital Menu Architecture & Catalogue Operations' : 'Operasi Katalog & Kejuruteraan Menu Digital',
      desc: isEn
        ? 'Specialists in platform-compliant menu engineering. We format physical menus into high-converting Foodpanda combo hierarchies, modifier chains, and compliant food photography tags.'
        : 'Pakar penyusunan menu berpiawaian platform. Kami menukar menu fizikal kepada struktur kombo berkesan, variasi pilihan, dan tag fotografi makanan menepati syarat.',
    },
    {
      code: 'DIV-03',
      badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
      name: isEn ? 'Terminal Hardware Dispatch & On-Site Kitchen SOP' : 'Penyerahan Terminal & SOP Dapur Di Lokasi',
      desc: isEn
        ? 'Direct logistics deployment of official Foodpanda order-receiving hardware to merchant premises, conducting live staff drills to prevent fulfillment cancellations.'
        : 'Logistik penyerahan peranti penerimaan pesanan rasmi Foodpanda terus ke premis peniaga, mengadakan latihan amali staf bagi mengelakkan pembatalan pesanan.',
    },
    {
      code: 'DIV-04',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
      name: isEn ? 'Weekly Remittance Forensic Audit & Dispute Desk' : 'Meja Audit Forensik Penyata & Pertikaian',
      desc: isEn
        ? 'Forensic cross-referencing of weekly Foodpanda settlement remittances against POS order journals. Dispute ticketing for uncompensated cancellations and SST reconciliation.'
        : 'Audit forensik penyata bayaran mingguan Foodpanda dengan rekod jurnal POS restoran. Pemfailan tiket pertikaian bagi pesanan batal tidak diganti dan penyesuaian SST.',
    },
  ];

  const milestones = [
    {
      year: '2023',
      title: isEn ? 'Appointed Authorised Intermediary' : 'Dilantik Sebagai Perantara Rasmi',
      desc: isEn
        ? 'Incorporated in Kuala Lumpur with official appointment as an authorised intermediary bridging food and beverage merchants with Foodpanda Malaysia.'
        : 'Pemerbadanan di Kuala Lumpur dengan pelantikan rasmi sebagai perantara sah menghubungkan peniaga makanan dan minuman dengan Foodpanda Malaysia.',
    },
    {
      year: '2024',
      title: isEn ? 'Expansion Across Key Economic Corridors' : 'Perluasan Koridor Ekonomi Utama',
      desc: isEn
        ? 'Deployed dedicated field agent teams across Selangor, Klang Valley, Penang, and Johor, standardizing merchant qualification workflows.'
        : 'Penempatan pasukan ejen lapangan bertauliah di seluruh Selangor, Lembah Klang, Pulau Pinang, dan Johor bagi menyeragamkan aliran kerja peniaga.',
    },
    {
      year: '2025',
      title: isEn ? 'Proprietary Remittance Reconciliation Ledger' : 'Pembangunan Lejar Penyesuaian Penyata',
      desc: isEn
        ? 'Introduced proprietary weekly settlement auditing protocols, enabling F&B operators to detect deduction leakages and lodge automated disputes.'
        : 'Melancarkan protokol audit bayaran mingguan, membolehkan pengusaha restoran mengesan ketirisan potongan dan memfailkan pertikaian secara tersusun.',
    },
    {
      year: '2026',
      title: isEn ? '1,250+ Active Managed Merchant Portfolio' : 'Portfolio 1,250+ Peniaga Aktif',
      desc: isEn
        ? 'Currently overseeing onboarding, terminal maintenance, and settlement auditing for over 1,250 active food and beverage outlets nationwide.'
        : 'Kini mengurus pendaftaran, penyelenggaraan terminal, dan audit penyata bagi lebih 1,250 premis makanan dan minuman aktif di seluruh negara.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation */}
      <CorporateNav currentLang={lang} onLangChange={setLang} />

      <main className="flex-1">
        {/* About Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-red-50/20 dark:from-[#070a12] dark:via-[#0c111d] dark:to-[#070a12] py-20 sm:py-24 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
              <Link href="/" className="hover:text-red-600 transition-colors">
                {isEn ? 'Home' : 'Utama'}
              </Link>
              <span>/</span>
              <span className="text-red-600 dark:text-red-400 font-bold">
                {isEn ? 'About Us' : 'Tentang Kami'}
              </span>
            </div>

            <div className="max-w-3xl">
              <span className="inline-block px-3.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800 mb-4">
                {isEn ? 'Our Corporate Identity & Mandate' : 'Identiti Korporat & Mandat Kami'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {isEn ? (
                  <>
                    The Authorised Intermediary for{' '}
                    <span className="text-red-600 dark:text-red-500">
                      Foodpanda Malaysia
                    </span>
                  </>
                ) : (
                  <>
                    Perantara Rasmi untuk{' '}
                    <span className="text-red-600 dark:text-red-500">
                      Foodpanda Malaysia
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {isEn
                  ? 'Legacy Cuisine fulfills a singular operational mandate: serving as the authorized intermediary connecting restaurant merchants with Foodpanda Malaysia. We ensure statutory verification, physical hardware deployment, and financial remittance precision.'
                  : 'Legacy Cuisine melaksanakan mandat operasi tunggal: bertindak sebagai perantara sah yang menghubungkan peniaga restoran dengan Foodpanda Malaysia. Kami memastikan pengesahan berkanun, penyerahan perkakasan di premis, serta ketepatan penyata kewangan.'}
              </p>
            </div>
          </div>
        </section>

        {/* Corporate Profile Card */}
        <section className="py-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#070a12] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              <div className="lg:col-span-5 space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-600 p-2 flex items-center justify-center shadow-lg shadow-red-600/10">
                  <Image
                    src="/logo-circle.png"
                    alt="Legacy Cuisine Logo"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                  {isEn ? 'Built Exclusively for Restaurant Merchants' : 'Dibina Khusus untuk Peniaga Restoran'}
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {isEn
                    ? 'Our objective is to institutionalize merchant onboarding and settlement reconciliation. We eliminate bureaucratic delays, protect merchant capital through weekly audits, and uphold platform fulfillment integrity.'
                    : 'Matlamat kami adalah menginstitusikan proses pendaftaran peniaga dan penyesuaian penyata bayaran. Kami menghapuskan kelewatan pentadbiran, melindungi modal peniaga melalui audit berkala, dan mengekalkan integriti pesanan.'}
                </p>
              </div>

              <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-5 sm:p-8 rounded-2xl space-y-4 font-mono text-xs transition-colors shadow-lg">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                    {isEn ? 'OPERATING CORPORATE ENTITY' : 'ENTITI KORPORAT BEROPERASI'}
                  </span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-base block mt-1">
                    Legacy Cuisine
                  </span>
                </div>

                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                    {isEn ? 'OFFICIAL MANDATE' : 'MANDAT LANTIKAN'}
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-bold block mt-1 text-sm">
                    Authorised Merchant Intermediary for Foodpanda Malaysia
                  </span>
                </div>

                <div className="pt-3.5 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                    {isEn ? 'REGISTERED EXECUTIVE OFFICE' : 'ALAMAT IBU PEJABAT EKSEKUTIF'}
                  </span>
                  <span className="text-slate-700 dark:text-slate-300 block mt-1 font-sans text-xs">
                    Level 18, Menara Kencana, Persiaran Barat, 50450 Kuala Lumpur, Malaysia
                  </span>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* 4 Divisions */}
        <section className="py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
                {isEn ? 'Departmental Structure' : 'Struktur Jabatan'}
              </div>
              <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isEn ? 'Our Dedicated Foodpanda Divisions' : 'Bahagian Operasi Foodpanda Kami'}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {divisions.map((d) => (
                <div
                  key={d.code}
                  className="p-5 sm:p-8 rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900 shadow-sm hover:shadow-lg transition-all"
                >
                  <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${d.badgeColor}`}>
                    {d.code}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-4 mb-2">
                    {d.name}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {d.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Milestones */}
        <section className="py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-[#070a12] transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mb-14">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
                {isEn ? 'Our Journey' : 'Perjalanan Kami'}
              </div>
              <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isEn ? 'Operational Milestones (2023 - 2026)' : 'Pencapaian Operasi (2023 - 2026)'}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {milestones.map((m) => (
                <div
                  key={m.year}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between shadow-sm hover:shadow-md transition-all"
                >
                  <div>
                    <span className="text-3xl font-extrabold font-mono text-red-600 dark:text-red-400">
                      {m.year}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-3 mb-2">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                      {m.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
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
                {isEn ? 'Staff & Agent Portal' : 'Portal Staf & Ejen'}
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
