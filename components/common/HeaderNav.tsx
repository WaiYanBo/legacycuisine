'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { getDictionary, Locale } from '../../lib/i18n';

interface HeaderNavProps {
  currentLang: Locale;
}

export default function HeaderNav({ currentLang }: HeaderNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = getDictionary(currentLang).nav;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleLanguage = (targetLang: 'en' | 'ms') => {
    if (targetLang === currentLang) return;
    let newPath = pathname;
    if (pathname.startsWith('/en')) {
      newPath = pathname.replace('/en', `/${targetLang}`);
    } else if (pathname.startsWith('/ms')) {
      newPath = pathname.replace('/ms', `/${targetLang}`);
    } else {
      newPath = `/${targetLang}/forms/checklist`;
    }
    router.push(newPath);
  };

  const isEn = currentLang === 'en';

  const handleLogout = () => {
    document.cookie = 'lc_auth=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    localStorage.removeItem('lc_auth');
    router.push('/');
  };

  const navLinks = [
    {
      href: `/${currentLang}/forms/checklist`,
      label: t.recruitmentChecklist,
      isActive: pathname.includes('/forms/checklist'),
      icon: '📋',
    },
    {
      href: `/${currentLang}/forms/registration`,
      label: t.businessRegistration,
      isActive: pathname.includes('/forms/registration'),
      icon: '🏪',
    },
    {
      href: `/${currentLang}/forms/submissions`,
      label: t.viewSubmissions,
      isActive: pathname.includes('/forms/submissions'),
      icon: '📁',
    },
    {
      href: '/dashboard',
      label: t.dashboard,
      isActive: pathname.includes('/dashboard'),
      icon: '📊',
    },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          
          {/* Left: Mobile Menu Button & Brand Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hamburger Button (Visible only on mobile/tablet < md) */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center transition-colors shadow-sm"
              aria-label="Open Navigation Menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <Link href={`/${currentLang}/forms/checklist`} className="flex items-center gap-2 sm:gap-3 group">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white p-0.5 sm:p-1 flex items-center justify-center shadow-sm border-2 border-red-600 ring-2 ring-red-600/15 group-hover:scale-105 transition-transform overflow-hidden shrink-0">
                <Image
                  src="/logo-circle.png"
                  alt="Legacy Cuisine Logo"
                  width={40}
                  height={40}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <div className="text-slate-900 dark:text-white font-extrabold text-sm sm:text-base tracking-tight group-hover:text-red-600 transition-colors leading-tight">
                  LEGACY CUISINE
                </div>
                <div className="text-[9px] sm:text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider leading-none">
                  {t.brandSubtitle}
                </div>
              </div>
            </Link>
          </div>

          {/* Center: Desktop Navigation Links (Hidden on < md) */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  link.isActive
                    ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/20'
                    : 'text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right Section: Language Switcher & Logout */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            <div className="flex items-center gap-0.5 sm:gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => toggleLanguage('en')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold tracking-wider transition-all ${
                  isEn
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => toggleLanguage('ms')}
                className={`px-2 sm:px-2.5 py-1 rounded-lg text-[11px] sm:text-xs font-bold tracking-wider transition-all ${
                  !isEn
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
                }`}
              >
                BM
              </button>
            </div>

            <button
              type="button"
              onClick={handleLogout}
              title="Logout"
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* 📱 Mobile Slide-Over Navigation Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex animate-fadeIn print:hidden">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            aria-hidden="true"
          />

          {/* Slide-in Drawer Container */}
          <div className="relative w-72 max-w-[85vw] bg-white dark:bg-slate-900 h-full flex flex-col justify-between p-4 shadow-2xl border-r border-slate-200 dark:border-slate-800 z-10 animate-in slide-in-from-left duration-200 safe-top safe-bottom">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-white p-1 border-2 border-red-600 shadow-sm flex items-center justify-center shrink-0">
                    <Image src="/logo-circle.png" alt="Legacy Cuisine Logo" width={36} height={36} className="object-contain w-full h-full" />
                  </div>
                  <div>
                    <span className="text-sm font-black text-slate-900 dark:text-white block">LEGACY CUISINE</span>
                    <span className="text-[10px] text-red-600 dark:text-red-400 font-extrabold uppercase">{t.brandSubtitle}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 flex items-center justify-center font-bold text-sm"
                  title="Close Menu"
                >
                  ✕
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="mt-4 space-y-1.5" aria-label="Mobile Navigation">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                      link.isActive
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 font-bold'
                        : 'text-slate-600 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
                    }`}
                  >
                    <span className="text-base">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Mobile Drawer Bottom Section */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-3">
                  {isEn ? 'Language:' : 'Bahasa:'}
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => { toggleLanguage('en'); setIsMobileMenuOpen(false); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${isEn ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    EN 🇬🇧
                  </button>
                  <button
                    type="button"
                    onClick={() => { toggleLanguage('ms'); setIsMobileMenuOpen(false); }}
                    className={`px-3 py-1 rounded-lg text-xs font-bold ${!isEn ? 'bg-red-600 text-white' : 'text-slate-600 dark:text-slate-300'}`}
                  >
                    BM 🇲🇾
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-2.5 px-4 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-600 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 border border-red-200 dark:border-red-900"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>{isEn ? 'Log Out' : 'Log Keluar'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

