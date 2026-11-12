'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CorporateNav from '../../components/corporate/CorporateNav';
import CorporateFooter from '../../components/corporate/CorporateFooter';
import OnboardingInquiryForm from '../../components/corporate/OnboardingInquiryForm';
import FloatingPortalPill from '../../components/corporate/FloatingPortalPill';

export default function ContactPage() {
  const [lang, setLang] = useState<'en' | 'ms'>('en');
  const isEn = lang === 'en';

  const departments = [
    {
      code: 'DESK-01',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
      name: isEn ? 'Merchant Registration & Document Lodgement Desk' : 'Meja Pendaftaran & Penyerahan Dokumen Peniaga',
      email: 'onboarding@legacycuisine.com.my',
      phone: '+60 3-8996 4201',
      desc: isEn
        ? 'For food and beverage operators seeking 48-hour expedited Foodpanda merchant registration, regulatory pre-audits, and terminal hardware delivery.'
        : 'Untuk pemilik restoran yang ingin mendaftar ke Foodpanda dengan kelulusan pantas 48 jam, pra-audit dokumen, dan penyerahan perkakasan terminal.',
    },
    {
      code: 'DESK-02',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
      name: isEn ? 'Remittance Audit & Payout Reconciliation Desk' : 'Meja Audit Forensik & Penyesuaian Penyata',
      email: 'reconciliation@legacycuisine.com.my',
      phone: '+60 3-8996 4202',
      desc: isEn
        ? 'For active Foodpanda merchants requiring weekly remittance cross-checks, uncompensated cancellation disputes, or statutory SST invoice verification.'
        : 'Untuk peniaga Foodpanda aktif yang memerlukan semakan penyata mingguan, pertikaian pesanan batal tidak diganti, atau pengesahan invois SST.',
    },
    {
      code: 'DESK-03',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
      name: isEn ? 'Field Operations & Corporate Accounts Desk' : 'Meja Operasi Lapangan & Akaun Korporat',
      email: 'corporate@legacycuisine.com.my',
      phone: '+60 12-882 1928',
      desc: isEn
        ? 'For multi-outlet F&B franchise groups, regional chain operators, and commercial partnership liaison across Peninsular Malaysia.'
        : 'Untuk pengendali rangkaian francais makanan, kumpulan restoran serantau, dan pengurusan perkongsian komersial di Semenanjung Malaysia.',
    },
    {
      code: 'DESK-04',
      badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
      name: isEn ? 'Terminal Logistics & Kitchen Technical Support' : 'Sokongan Teknikal & Logistik Terminal Premis',
      email: 'support@legacycuisine.com.my',
      phone: '+60 3-8996 4204',
      desc: isEn
        ? 'For on-site order receiving hardware maintenance, kitchen brigade operational drills, and terminal exchange protocols.'
        : 'Untuk penyelenggaraan peranti tablet pesanan di premis, latihan staf dapur, dan protokol penggantian perkakasan.',
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation */}
      <CorporateNav currentLang={lang} onLangChange={setLang} />

      <main className="flex-1">
        {/* Contact Page Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-red-50/20 dark:from-[#070a12] dark:via-[#0c111d] dark:to-[#070a12] py-20 sm:py-24 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
              <Link href="/" className="hover:text-red-600 transition-colors">
                {isEn ? 'Home' : 'Utama'}
              </Link>
              <span>/</span>
              <span className="text-red-600 dark:text-red-400 font-bold">
                {isEn ? 'Contact & Apply' : 'Hubungi & Daftar'}
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-8">
                <span className="inline-block px-3.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800 mb-4">
                  {isEn ? 'Authorised Foodpanda Partner Desks' : 'Meja Operasi Rasmi Foodpanda'}
                </span>
                <h1 className="text-3xl sm:text-5xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                  {isEn ? (
                    <>
                      Contact Our Team for{' '}
                      <span className="text-red-600 dark:text-red-500">
                        Foodpanda Onboarding
                      </span>
                    </>
                  ) : (
                    <>
                      Hubungi Pasukan Pendaftaran{' '}
                      <span className="text-red-600 dark:text-red-500">
                        Foodpanda Malaysia
                      </span>
                    </>
                  )}
                </h1>
                <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl font-normal">
                  {isEn
                    ? 'Engage with our compliance verification officers, weekly remittance auditors, or premise dispatch specialists in Kuala Lumpur.'
                    : 'Berhubung terus dengan pegawai pengesahan dokumen, juruaudit penyata bayaran mingguan, atau pakar logistik terminal kami di Kuala Lumpur.'}
                </p>
              </div>

              {/* Direct Portal Entry Box */}
              <div className="lg:col-span-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-xl transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {isEn ? 'STAFF & FIELD AGENTS' : 'STAF & EJEN MEDAN'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800">
                    {isEn ? 'Secure Portal' : 'Portal Selamat'}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isEn
                    ? 'Internal operations staff and authorized field recruitment agents manage restaurant compliance dossiers and view lead commission status.'
                    : 'Staf operasi dalaman dan ejen medan bertauliah mengurus permohonan restoran dan menyemak status komisen.'}
                </p>
                <Link
                  href="/login"
                  className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-red-600/30 transition-all hover:scale-[1.02] active:scale-95"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span>{isEn ? 'Go to Staff Portal' : 'Log Masuk Portal Staf'}</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Corporate Form */}
        <OnboardingInquiryForm currentLang={lang} />

        {/* Specialized Corporate Desks */}
        <section className="bg-slate-50/60 dark:bg-[#070a12] py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="pb-8 border-b border-slate-200 dark:border-slate-800 mb-12">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
                {isEn ? 'Department Directory' : 'Direktori Jabatan'}
              </div>
              <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight">
                {isEn ? 'Authorised Foodpanda Operational Desks' : 'Meja Operasi Rasmi Foodpanda'}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 font-normal">
                {isEn
                  ? 'Direct operational extensions for merchant enquiries across every onboarding and management stage.'
                  : 'Saluran perhubungan terus bagi urusan peniaga mengikut fasa pelaksanaan.'}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {departments.map((dept, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-5 sm:p-8 space-y-4 shadow-sm hover:shadow-lg transition-all">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                    <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-md border ${dept.badgeColor}`}>
                      {dept.code}
                    </span>
                    <span className="font-mono text-xs text-slate-700 dark:text-slate-300 font-bold">{dept.phone}</span>
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                    {dept.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-normal leading-relaxed">
                    {dept.desc}
                  </p>
                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                    <a
                      href={`mailto:${dept.email}`}
                      className="font-mono text-xs text-red-600 dark:text-red-400 hover:underline font-bold"
                    >
                      {dept.email}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Corporate Headquarters Physical Registry */}
        <section className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 py-20 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-5 space-y-3">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider">
                  {isEn ? 'Official Registry' : 'Pendaftaran Rasmi'}
                </div>
                <h3 className="text-2xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {isEn ? 'Kuala Lumpur Operations Centre' : 'Pusat Operasi Kuala Lumpur'}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  {isEn
                    ? 'Our central operations office houses our Foodpanda commercial account officers, menu formatting engineers, and weekly settlement reconciliation auditors.'
                    : 'Pejabat operasi pusat menempatkan pegawai akaun komersial Foodpanda, jurutera penyusunan menu digital, dan juruaudit penyata bayaran.'}
                </p>
              </div>

              <div className="lg:col-span-7 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 sm:p-8 space-y-4 font-mono text-xs shadow-md transition-colors">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                    {isEn ? 'AUTHORISED ENTITY & REGISTERED PREMISES' : 'ENTITI SAH & ALAMAT BERDAFTAR'}
                  </span>
                  <span className="text-slate-900 dark:text-white font-extrabold text-sm block mt-1 leading-snug">
                    Legacy Cuisine<br />
                    Level 18, Menara Kencana, Persiaran Barat, 50450 Kuala Lumpur, Malaysia
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                      {isEn ? 'OPERATING HOURS' : 'WAKTU OPERASI'}
                    </span>
                    <span className="text-slate-700 dark:text-slate-300 mt-0.5 block font-sans text-xs">Monday – Friday: 08:30 – 18:00 (MYT)</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                      {isEn ? 'ACTIVATION SLA' : 'SLA PENGAKTIFAN'}
                    </span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold mt-0.5 block">&le; 48 Business Hours</span>
                  </div>
                </div>
              </div>
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
