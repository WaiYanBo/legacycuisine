'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [lang, setLang] = useState<'en' | 'ms'>('en');
  const [username, setUsername] = useState('');
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
        body: JSON.stringify({ username: username.trim(), password }),
      });

      let data: any = {};
      try {
        data = await res.json();
      } catch {
        throw new Error(
          isEn
            ? 'Server error: unable to process login. Please check database connection or credentials.'
            : 'Ralat pelayan: tidak dapat memproses log masuk. Sila periksa sambungan pangkalan data.'
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            (isEn
              ? 'Invalid Username or Password.'
              : 'Nama Pengguna atau Kata Laluan tidak sah.')
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
      setError(err.message || (isEn ? 'Login failed. Please try again.' : 'Gagal log masuk. Sila cuba lagi.'));
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-red-800/15 rounded-full blur-3xl pointer-events-none" />

      {/* Language Switcher in Top Right */}
      <div className="absolute top-6 right-6 z-20">
        <div className="flex items-center bg-slate-900/90 backdrop-blur-md p-1 rounded-xl border border-slate-800 shadow-lg">
          <button
            type="button"
            onClick={() => setLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              isEn ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇬🇧</span>
            <span>English</span>
          </button>
          <button
            type="button"
            onClick={() => setLang('ms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              !isEn ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🇲🇾</span>
            <span>BM</span>
          </button>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/90 backdrop-blur-xl p-8 sm:p-10 rounded-3xl border border-slate-800 shadow-2xl shadow-black/80 animate-in fade-in zoom-in-95 duration-300">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-20 h-20 rounded-full bg-white p-2 flex items-center justify-center border-2 border-red-600 shadow-lg shadow-red-600/20 ring-4 ring-red-600/10 mb-4 transition-transform hover:scale-105">
            <Image
              src="/logo-circle.png"
              alt="Legacy Cuisine Logo"
              width={80}
              height={80}
              priority
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white uppercase">Legacy Cuisine</h1>
          <p className="text-xs text-red-500 font-extrabold tracking-widest uppercase mt-1">
            {isEn ? 'Authorized Staff & Admin Portal' : 'Portal Pentadbir & Staf Sah'}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="bg-red-950/70 border border-red-800 text-red-200 text-xs py-3 px-4 rounded-xl font-medium flex items-center gap-2.5 animate-in fade-in duration-200">
              <span className="text-base shrink-0">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              {isEn ? 'Username' : 'Nama Pengguna'}
            </label>
            <input
              type="text"
              required
              autoFocus
              placeholder={isEn ? 'Enter Username' : 'Masukkan Nama Pengguna'}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              {isEn ? 'Password' : 'Kata Laluan'}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 pr-12 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors p-1"
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 px-4 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm uppercase tracking-wider rounded-xl shadow-lg shadow-red-600/25 transition-all transform active:scale-98 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{isEn ? 'Authenticating...' : 'Mengesahkan Akses...'}</span>
              </>
            ) : (
              <span>{isEn ? 'LOG IN / ENTER PORTAL' : 'LOG MASUK / MASUK PORTAL'}</span>
            )}
          </button>
        </form>

        {/* Footer info */}
        <div className="mt-8 pt-6 border-t border-slate-800 text-center">
          <p className="text-[11px] text-slate-500 font-medium">
            &copy; {new Date().getFullYear()} Legacy Cuisine Group. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
