'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useTheme } from './ThemeProvider';

interface CorporateNavProps {
  currentLang?: 'en' | 'ms';
  onLangChange?: (lang: 'en' | 'ms') => void;
}

export default function CorporateNav({
  currentLang = 'en',
  onLangChange,
}: CorporateNavProps) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isEn = currentLang === 'en';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '/', label: isEn ? 'Home' : 'Utama' },
    { href: '/services', label: isEn ? 'Services & Scope' : 'Perkhidmatan & Skop' },
    { href: '/about', label: isEn ? 'About Us' : 'Tentang Kami' },
    { href: '/testimony', label: isEn ? 'Merchant Stories' : 'Kisah Peniaga' },
    { href: '/contact', label: isEn ? 'Contact & Apply' : 'Hubungi & Daftar' },
  ];

  return (
    <>
      {/* Top Utility Dispatch Bar with Foodpanda Accent */}
      <div className="bg-slate-950 text-slate-300 text-xs py-2 px-3 sm:px-6 md:px-8 border-b border-slate-800 safe-top">
        <div className="max-w-7xl mx-auto flex flex-wrap justify-between items-center gap-2">
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs">
            <span className="inline-flex items-center gap-1.5 font-medium text-white truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">{isEn ? 'Authorised Foodpanda Partner Agency' : 'Agensi Rakan Rasmi Foodpanda'}</span>
            </span>
            <span className="text-slate-700 hidden sm:inline">|</span>
            <span className="text-slate-400 hidden sm:inline font-mono text-[11px]">
              Legacy Cuisine
            </span>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-4 text-xs shrink-0">
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 text-[11px] font-semibold transition-colors"
            >
              {theme === 'dark' ? (
                <>
                  <svg className="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="text-amber-400 font-bold">{isEn ? 'Light' : 'Cerah'}</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                  <span>{isEn ? 'Dark' : 'Gelap'}</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <div className="flex items-center bg-slate-900 rounded-md p-0.5 border border-slate-800 text-[11px] font-mono">
              <button
                type="button"
                onClick={() => onLangChange?.('en')}
                className={`px-2 py-0.5 rounded transition-all ${
                  isEn ? 'bg-red-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => onLangChange?.('ms')}
                className={`px-2 py-0.5 rounded transition-all ${
                  !isEn ? 'bg-red-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                BM
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1.5 text-slate-300 font-mono text-[11px]">
              <span className="text-slate-300">Hotline:</span>
              <a href="tel:+60389964200" className="text-white hover:text-red-400 transition-colors font-semibold">
                +60 3-8996 4200
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Corporate Header with Glassmorphism */}
      <header
        className={`sticky top-0 z-50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-all duration-200 border-b border-slate-200/90 dark:border-slate-800/90 ${
          scrolled ? 'shadow-md py-2.5 sm:py-3' : 'py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2">
          
          {/* Logo & Corporate Identity */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group min-w-0">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white dark:bg-slate-900 p-1 flex items-center justify-center border-2 border-red-600 ring-2 ring-red-600/15 shadow-sm group-hover:scale-105 transition-all shrink-0">
              <Image
                src="/logo-circle.png"
                alt="Legacy Cuisine Logo"
                width={38}
                height={38}
                priority
                className="object-contain"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-sans font-extrabold text-base sm:text-lg md:text-xl text-slate-900 dark:text-white tracking-tight group-hover:text-red-600 transition-colors truncate">
                  Legacy Cuisine
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800/60 rounded-full shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                  Foodpanda Intermediary
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate max-w-[150px] xs:max-w-[210px] sm:max-w-none">
                {isEn ? 'Official Merchant Intermediary Malaysia' : 'Perantara Peniaga Rasmi Malaysia'}
              </p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`transition-colors py-1 relative ${
                    isActive
                      ? 'text-red-600 dark:text-red-500 font-bold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-red-600 after:rounded-full'
                      : 'hover:text-red-600 dark:hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Direct Portal Login Button */}
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] sm:text-xs font-bold uppercase tracking-wider shadow-sm hover:shadow-md hover:shadow-red-600/20 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
              aria-label="Portal Login"
            >
              <svg className="w-3.5 h-3.5 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
              <span className="hidden xs:inline">{isEn ? 'Portal' : 'Portal'}</span>
              <span className="hidden sm:inline">{isEn ? ' Login' : ' Peniaga'}</span>
            </Link>

            {/* Mobile Menu Button - min touch target 40x40 */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden min-w-[38px] min-h-[38px] p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 flex items-center justify-center transition-colors"
              aria-label="Toggle navigation"
            >
              {mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 px-6 py-5 shadow-2xl">
            <div className="flex flex-col space-y-3">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`py-2 text-sm font-semibold transition-colors border-b border-slate-100 dark:border-slate-800 ${
                      isActive ? 'text-red-600 font-bold' : 'text-slate-700 dark:text-slate-300 hover:text-red-600'
                    }`}
                  >
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl text-center block shadow-md shadow-red-600/30"
                >
                  {isEn ? 'Staff & Agent Portal Login' : 'Log Masuk Portal Staf & Ejen'}
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
