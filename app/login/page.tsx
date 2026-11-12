'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [lang, setLang] = useState<'en' | 'ms'>('en');
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const isEn = lang === 'en';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier: identifier.trim(), password }),
            });

            let data: any = {};
            try {
                data = await res.json();
            } catch {
                throw new Error(
                    isEn
                        ? 'Server error: unable to process authentication request.'
                        : 'Ralat pelayan: tidak dapat memproses permohonan log masuk.'
                );
            }

            if (!res.ok || !data.success) {
                throw new Error(
                    data.error ||
                    (isEn
                        ? 'Invalid credentials provided. Please verify and retry.'
                        : 'Kelayakan tidak sah. Sila semak semula dan cuba lagi.')
                );
            }

            // Store auth tokens and user profile
            if (data.token) {
                document.cookie = `lc_session=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
                localStorage.setItem('lc_session', data.token);
            }
            document.cookie = 'lc_auth=authenticated; path=/; max-age=2592000; SameSite=Lax';
            localStorage.setItem('lc_auth', 'authenticated');
            if (data.user) {
                localStorage.setItem('lc_user', JSON.stringify(data.user));
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || (isEn ? 'Authentication failed.' : 'Pengesahan gagal.'));
            setIsLoading(false);
        }
    };

  return (
    <main className="min-h-[100dvh] w-full bg-[#070a12] flex flex-col items-center justify-center p-4 sm:p-6 font-sans select-none text-slate-100 relative overflow-y-auto safe-top safe-bottom">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-amber-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar: Return to Corporate Website & Language Switcher */}
      <div className="w-full max-w-md mx-auto pt-2 pb-4 sm:pt-4 flex items-center justify-between z-20">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold transition-all backdrop-blur-md shadow-md min-h-[38px]"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span>{isEn ? 'Corporate Website' : 'Laman Korporat'}</span>
        </Link>

        <div className="flex items-center font-mono text-xs border border-slate-800 rounded-xl overflow-hidden bg-slate-900/90 backdrop-blur-md p-0.5 shadow-md">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1 rounded-lg transition-all min-h-[34px] flex items-center justify-center ${
              isEn ? 'bg-red-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => setLang('ms')}
            className={`px-3 py-1 rounded-lg transition-all min-h-[34px] flex items-center justify-center ${
              !isEn ? 'bg-red-600 text-white font-bold shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            BM
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-slate-900/90 p-6 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl my-4 sm:my-8 relative z-10 backdrop-blur-xl">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-7">
          <Link href="/" className="group mb-3">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 sm:p-2 flex items-center justify-center border-2 border-red-600 ring-2 ring-red-600/15 shadow-lg shadow-red-600/20 group-hover:scale-105 transition-transform">
              <Image
                src="/logo-circle.png"
                alt="Legacy Cuisine Logo"
                width={48}
                height={48}
                priority
                className="object-contain"
              />
            </div>
          </Link>
          <h1 className="text-lg sm:text-xl font-extrabold tracking-tight text-white font-sans">
            Legacy Cuisine Portal
          </h1>
          <p className="text-xs text-red-500 font-bold uppercase tracking-wider mt-1">
            {isEn ? 'Staff & Field Agent Governance' : 'Portal Staf & Ejen Medan'}
          </p>
        </div>

        {/* Portal Notice */}
        <div className="mb-5 sm:mb-6 p-3 sm:p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed flex items-start gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
          <div>
            <span className="text-slate-200 font-semibold">{isEn ? 'Authorized Access:' : 'Akses Dibenarkan:'}</span>{' '}
            {isEn
              ? 'Enter your registered credentials to manage merchant applications or view weekly reconciliation audits.'
              : 'Sila masukkan kelayakan anda untuk mengurus permohonan peniaga atau menyemak audit bayaran mingguan.'}
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-5">

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {isEn ? 'Email or Username' : 'E-mel atau Nama Pengguna'}
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={isEn ? 'Enter username or registered email' : 'Masukkan nama pengguna atau e-mel'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              {isEn ? 'Password' : 'Kata Laluan'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-2 min-h-[38px] min-w-[38px] flex items-center justify-center"
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full min-h-[48px] py-3.5 sm:py-4 px-6 bg-gradient-to-r from-red-600 via-red-700 to-red-800 hover:from-red-700 hover:to-red-900 text-white font-bold text-xs sm:text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/30 hover:shadow-xl hover:shadow-red-600/40 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>{isEn ? 'Authenticating...' : 'Mengesahkan...'}</span>
              ) : (
                <span>{isEn ? 'Authenticate Session' : 'Sahkan Sesi'}</span>
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="mt-6 sm:mt-8 pt-4 border-t border-slate-800 text-center font-mono text-[10px] sm:text-[11px] text-slate-500">
          Legacy Cuisine &bull; PDPA 2010 Protected
        </div>
      </div>
    </main>
  );
}
