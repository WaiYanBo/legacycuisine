'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface FloatingPortalPillProps {
  currentLang?: 'en' | 'ms';
  onOpenLoginDrawer?: () => void;
}

export default function FloatingPortalPill({
  currentLang = 'en',
  onOpenLoginDrawer,
}: FloatingPortalPillProps) {
  const [show, setShow] = useState(false);
  const isEn = currentLang === 'en';

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 flex items-center gap-2 safe-bottom">
      {/* Scroll to Top */}
      <button
        type="button"
        onClick={scrollToTop}
        className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-500 border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 shrink-0"
        aria-label="Scroll to top"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
        </svg>
      </button>

      {/* Floating Quick Portal Access Pill */}
      {onOpenLoginDrawer ? (
        <button
          type="button"
          onClick={onOpenLoginDrawer}
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>{isEn ? 'Portal' : 'Portal'}</span>
        </button>
      ) : (
        <Link
          href="/login"
          className="flex items-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-xl shadow-red-600/30 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <svg className="w-4 h-4 text-white shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
          </svg>
          <span>{isEn ? 'Portal' : 'Portal'}</span>
        </Link>
      )}
    </div>
  );
}
