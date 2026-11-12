'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CorporateNav from '../../components/corporate/CorporateNav';
import CorporateFooter from '../../components/corporate/CorporateFooter';
import FoodpandaServicesGrid from '../../components/corporate/FoodpandaServicesGrid';
import OnboardingRoadmap from '../../components/corporate/OnboardingRoadmap';
import ComparativeMatrix from '../../components/corporate/ComparativeMatrix';
import FloatingPortalPill from '../../components/corporate/FloatingPortalPill';

export default function ServicesPage() {
  const [lang, setLang] = useState<'en' | 'ms'>('en');
  const isEn = lang === 'en';

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Navigation */}
      <CorporateNav currentLang={lang} onLangChange={setLang} />

      <main className="flex-1">
        {/* Services Page Header */}
        <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-red-50/20 dark:from-[#070a12] dark:via-[#0c111d] dark:to-[#070a12] py-20 sm:py-24 border-b border-slate-200 dark:border-slate-800 transition-colors">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
              <Link href="/" className="hover:text-red-600 transition-colors">
                {isEn ? 'Home' : 'Utama'}
              </Link>
              <span>/</span>
              <span className="text-red-600 dark:text-red-400 font-bold">
                {isEn ? 'Services & Scope' : 'Skop Perkhidmatan'}
              </span>
            </div>

            <div className="max-w-3xl">
              <span className="inline-block px-3.5 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 text-xs font-bold uppercase tracking-wider border border-red-200 dark:border-red-800 mb-4">
                {isEn ? 'Authorised Foodpanda Agency Scope' : 'Skop Agensi Rasmi Foodpanda'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
                {isEn ? (
                  <>
                    End-to-End Restaurant Management for{' '}
                    <span className="text-red-600 dark:text-red-500">
                      Foodpanda Malaysia
                    </span>
                  </>
                ) : (
                  <>
                    Pengurusan Restoran Menyeluruh untuk{' '}
                    <span className="text-red-600 dark:text-red-500">
                      Foodpanda Malaysia
                    </span>
                  </>
                )}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                {isEn
                  ? 'We remove every barrier between your restaurant and Foodpanda. From pre-auditing your documents to delivering your tablet and auditing your weekly bank payouts.'
                  : 'Kami menyelesaikan kesulitan pentadbiran dan operasi antara pengusaha restoran dan Foodpanda. Bermula daripada semakan dokumen berkanun sehingga penyerahan terminal di premis dan audit forensik penyata bayaran mingguan.'}
              </p>
            </div>
          </div>
        </section>

        {/* 4 Core Services Grid */}
        <FoodpandaServicesGrid currentLang={lang} />

        {/* 4-Step Onboarding Roadmap */}
        <OnboardingRoadmap currentLang={lang} />

        {/* Comparative Advantage Table */}
        <ComparativeMatrix currentLang={lang} />

        {/* Call to Action Bar */}
        <section className="bg-gradient-to-r from-slate-900 via-slate-950 to-red-950/40 text-white py-20 text-center border-t border-slate-800">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              {isEn ? 'Ready to Activate Your Store on Foodpanda?' : 'Bersedia Mengaktifkan Restoran Anda di Foodpanda?'}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl mx-auto">
              {isEn
                ? 'Submit your details or speak with our dedicated Foodpanda onboarding representatives in Kuala Lumpur.'
                : 'Hantar maklumat anda atau hubungi wakil pendaftaran rasmi Foodpanda kami di Kuala Lumpur.'}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link
                href="/contact"
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-red-600/30 hover:scale-105 active:scale-95"
              >
                {isEn ? 'Start 48-Hour Onboarding' : 'Mulakan Pendaftaran 48 Jam'}
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
