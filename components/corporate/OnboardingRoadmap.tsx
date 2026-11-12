'use client';

import React from 'react';
import Link from 'next/link';

interface OnboardingRoadmapProps {
  currentLang?: 'en' | 'ms';
}

export default function OnboardingRoadmap({ currentLang = 'en' }: OnboardingRoadmapProps) {
  const isEn = currentLang === 'en';

  const steps = [
    {
      num: '01',
      title: isEn ? 'Document Audit' : 'Semakan Dokumen',
      time: isEn ? 'Day 1' : 'Hari 1',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:border-emerald-800',
      desc: isEn
        ? 'Verification of SSM profile, NRIC, bank statement header, and municipal health/premise licenses to eliminate rejection vectors.'
        : 'Pengesahan profil SSM, MyKad, penyata akaun bank, dan lesen pihak berkuasa tempatan bagi mengelakkan penolakan.',
    },
    {
      num: '02',
      title: isEn ? 'Menu Engineering' : 'Penyusunan Menu',
      time: isEn ? 'Days 2 - 3' : 'Hari 2 - 3',
      badge: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-400 dark:border-purple-800',
      desc: isEn
        ? 'Restructuring raw physical menus into Foodpanda digital architecture: combo sets, modifiers, pricing tiers, and photo styling.'
        : 'Penyusunan menu fizikal ke dalam sistem digital Foodpanda: hierarki kombo, variasi hidangan, dan format visual piawai.',
    },
    {
      num: '03',
      title: isEn ? 'Terminal Delivery' : 'Penyerahan Tablet',
      time: isEn ? 'Days 4 - 5' : 'Hari 4 - 5',
      badge: 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
      desc: isEn
        ? 'On-site terminal delivery, SIM/Wi-Fi setup, kitchen crew drill, and official store activation on the Foodpanda consumer app.'
        : 'Penghantaran peranti di premis, ujian sambungan, latihan staf dapur, dan pengaktifan rasmi restoran pada aplikasi Foodpanda.',
    },
    {
      num: '04',
      title: isEn ? 'Weekly Reconciliation' : 'Penyesuaian Mingguan',
      time: isEn ? 'Ongoing Weekly' : 'Setiap Minggu',
      badge: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
      desc: isEn
        ? 'Automated auditing of Foodpanda remittance statements against POS transactions, dispute ticketing, and SST invoice reconciliation.'
        : 'Audit berkala penyata bayaran mingguan Foodpanda dengan rekod POS, pemfailan tuntutan, dan penyesuaian lejar SST.',
    },
  ];

  return (
    <section className="bg-white dark:bg-slate-950 py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
            {isEn ? 'Fast & Transparent Process' : 'Proses Pantas & Telus'}
          </div>
          <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            {isEn ? 'Your 4-Step Journey to Foodpanda Success' : '4 Langkah Menuju Kejayaan di Foodpanda'}
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
            {isEn
              ? 'From initial document submission to live orders and automated weekly payout auditing.'
              : 'Daripada penyerahan dokumen awal sehingga pesanan langsung dan audit bayaran mingguan.'}
          </p>
        </div>

        {/* 4 Steps in Connected Stepper Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
          {steps.map((st, idx) => (
            <div
              key={st.num}
              className="p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between hover:shadow-lg hover:border-red-300 dark:hover:border-red-800/80 transition-all duration-200"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-red-800 text-white font-mono font-extrabold text-base flex items-center justify-center shadow-md shadow-red-500/20">
                    {st.num}
                  </span>
                  <span className={`text-[11px] font-mono font-bold uppercase px-2.5 py-1 rounded-full border ${st.badge}`}>
                    {st.time}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                  {st.title}
                </h3>

                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {st.desc}
                </p>
              </div>

              <div className="pt-4 mt-5 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 flex items-center justify-center text-[10px] font-bold">✓</span>
                <span>{isEn ? 'Intermediary Managed' : 'Diuruskan Perantara'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Action Card with Foodpanda Gradient */}
        <div className="mt-12 p-5 sm:p-8 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-950 to-red-950/40 border border-slate-800 shadow-xl text-white flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center sm:text-left">
            <div className="text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{isEn ? 'Ready for Immediate Deployment?' : 'Bersedia Memulakan Pengaktifan?'}</span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              {isEn
                ? 'Our field officers inspect your kitchen and lodge pre-screened documents within 24 hours of enquiry.'
                : 'Pegawai lapangan kami sedia memeriksa dapur anda dan menghantar dokumen dalam masa 24 jam.'}
            </p>
          </div>

          <Link
            href="/contact"
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider shrink-0 transition-all shadow-lg shadow-red-600/30 hover:scale-[1.02] active:scale-95"
          >
            {isEn ? 'Start 48-Hour Onboarding' : 'Mulakan Pendaftaran 48 Jam'}
          </Link>
        </div>

      </div>
    </section>
  );
}
