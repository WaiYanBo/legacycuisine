'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface CorporateFooterProps {
  currentLang?: 'en' | 'ms';
}

export default function CorporateFooter({ currentLang = 'en' }: CorporateFooterProps) {
  const isEn = currentLang === 'en';
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-slate-800 text-sm">
      {/* Top subtle brand gradient bar */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-slate-800/80">

          {/* Company & Mandate Summary (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center border-2 border-red-600 shadow-md shrink-0">
                <Image
                  src="/logo-circle.png"
                  alt="Legacy Cuisine Logo"
                  width={36}
                  height={36}
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-white font-extrabold text-base tracking-tight block">
                  Legacy Cuisine
                </span>
                <span className="text-xs font-semibold text-red-500">
                  Authorised Foodpanda Intermediary
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed max-w-sm">
              {isEn
                ? 'Appointed commercial intermediary connecting restaurant merchants with Foodpanda Malaysia. Operating across statutory merchant verification, digital catalogue engineering, terminal hardware logistics, and weekly forensic remittance reconciliation.'
                : 'Perantara komersial lantikan rasmi yang menghubungkan pengusaha restoran dengan Foodpanda Malaysia. Mengendalikan pengesahan berkanun peniaga, penyusunan katalog digital, logistik terminal peranti, dan audit forensik penyata bayaran mingguan.'}
            </p>

            <div className="pt-2 font-mono text-xs text-slate-400 space-y-1">
              <div>Entity: Legacy Cuisine</div>
              <div>Operating Jurisdiction: Malaysia (Selangor, KL, Penang, Johor)</div>
            </div>
          </div>

          {/* Quick Navigation Links (3 cols) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              {isEn ? 'Directory' : 'Direktori'}
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/" className="hover:text-red-400 transition-colors">
                  {isEn ? 'Home Overview' : 'Utama'}
                </Link>
              </li>
              <li>
                <Link href="/services" className="hover:text-red-400 transition-colors">
                  {isEn ? 'Foodpanda Services' : 'Perkhidmatan Foodpanda'}
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-red-400 transition-colors">
                  {isEn ? 'Corporate Profile & Mandate' : 'Profil Korporat & Mandat'}
                </Link>
              </li>
              <li>
                <Link href="/testimony" className="hover:text-red-400 transition-colors">
                  {isEn ? 'Merchant Case Studies' : 'Kajian Kes Peniaga'}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-red-400 transition-colors">
                  {isEn ? 'Registry & Contact Desks' : 'Pusat Operasi & Hubungan'}
                </Link>
              </li>
            </ul>
          </div>

          {/* Dedicated Portal Doorway (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
              {isEn ? 'Staff & Agent Governance' : 'Akses Staf & Ejen'}
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              {isEn
                ? 'Internal operations officers and authorized field recruitment agents access the secure portal to lodge merchant compliance dossiers.'
                : 'Pegawai operasi dalaman dan ejen lapangan bertauliah mengakses portal selamat bagi penyerahan berkas pematuhan peniaga.'}
            </p>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-red-600/25 transition-all"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>{isEn ? 'Access Agent Portal' : 'Akses Portal Ejen'}</span>
              </Link>
            </div>

            <div className="font-mono text-[11px] text-slate-400 pt-1">
              {isEn ? 'Encrypted via TLS 1.3 &bull; PDPA 2010 Protected' : 'Penyulitan TLS 1.3 &bull; Dilindungi PDPA 2010'}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 font-mono text-xs text-slate-400 text-center md:text-left">
          <div>
            &copy; {currentYear} Legacy Cuisine. All rights reserved.
          </div>
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-4 gap-y-2">
            <span className="text-red-400 font-semibold">Authorised Foodpanda Partner</span>
            <span className="hidden sm:inline">&bull;</span>
            <span>PDPA 2010 Compliant</span>
            <span className="hidden sm:inline">&bull;</span>
            <Link href="/login" className="hover:text-white transition-colors underline sm:no-underline">
              Staff Doorway
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
}
