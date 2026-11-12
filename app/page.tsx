'use client';

import React, { useState } from 'react';
import CorporateNav from '../components/corporate/CorporateNav';
import HomeHero from '../components/corporate/HomeHero';
import ValuePillars from '../components/corporate/ValuePillars';
import FoodpandaServicesGrid from '../components/corporate/FoodpandaServicesGrid';
import OnboardingRoadmap from '../components/corporate/OnboardingRoadmap';
import ComparativeMatrix from '../components/corporate/ComparativeMatrix';
import MerchantStories from '../components/corporate/MerchantStories';
import OnboardingInquiryForm from '../components/corporate/OnboardingInquiryForm';
import CorporateFooter from '../components/corporate/CorporateFooter';
import FloatingPortalPill from '../components/corporate/FloatingPortalPill';

export default function CorporateHomePage() {
  const [lang, setLang] = useState<'en' | 'ms'>('en');

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-950 dark:text-slate-100 flex flex-col font-sans selection:bg-slate-900 selection:text-white dark:selection:bg-white dark:selection:text-slate-950 transition-colors duration-200">
      {/* Clean Corporate Navigation */}
      <CorporateNav currentLang={lang} onLangChange={setLang} />

      <main className="flex-1">
        {/* Modern Corporate Hero */}
        <HomeHero currentLang={lang} />

        {/* Why Partner With Us: 3 Value Pillars */}
        <ValuePillars currentLang={lang} />

        {/* The 4 Core Foodpanda Services */}
        <FoodpandaServicesGrid currentLang={lang} />

        {/* 4-Step Onboarding Journey */}
        <OnboardingRoadmap currentLang={lang} />

        {/* Applying Alone vs via Legacy Cuisine (Comparative Matrix) */}
        <ComparativeMatrix currentLang={lang} />

        {/* Real Merchant Success Stories */}
        <MerchantStories currentLang={lang} />

        {/* Restaurant Application & Inquiry Form */}
        <OnboardingInquiryForm currentLang={lang} />
      </main>

      {/* Floating Portal Pill for quick access */}
      <FloatingPortalPill currentLang={lang} />

      {/* Corporate Footer */}
      <CorporateFooter currentLang={lang} />
    </div>
  );
}
