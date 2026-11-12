'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface QuickLoginDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang?: 'en' | 'ms';
}

export default function QuickLoginDrawer({
  isOpen,
  onClose,
  currentLang = 'en',
}: QuickLoginDrawerProps) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isEn = currentLang === 'en';

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
            ? 'Server error: unable to process login. Please check server connection.'
            : 'Ralat pelayan: tidak dapat memproses log masuk.'
        );
      }

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            (isEn
              ? 'Invalid Email/Username or Password.'
              : 'E-mel/Nama Pengguna atau Kata Laluan tidak sah.')
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
      setError(err.message || (isEn ? 'Login failed.' : 'Gagal log masuk.'));
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      {/* Backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative z-10 w-full max-w-md h-full bg-slate-950 border-l border-slate-800 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-300">
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white p-1 flex items-center justify-center border-2 border-red-600 shadow-sm shrink-0">
                <Image
                  src="/logo-circle.png"
                  alt="Legacy Cuisine Logo"
                  width={36}
                  height={36}
                  className="object-contain w-full h-full"
                />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-normal leading-none">
                  Legacy Cuisine
                </h3>
                <span className="text-[10px] font-mono text-red-500 uppercase tracking-widest mt-1 block">
                  {isEn ? 'Enterprise Portal Access' : 'Akses Portal Korporat'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white border border-slate-800 hover:bg-slate-900 transition-colors"
              aria-label="Close"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Quick Info */}
          <div className="my-6 p-3 bg-slate-900/80 border border-slate-800 text-xs text-slate-400 flex items-start gap-2.5">
            <span className="text-base shrink-0">🔐</span>
            <div className="leading-relaxed">
              <span className="text-slate-200 font-semibold">{isEn ? 'Staff & Agent Sign-in:' : 'Log Masuk Staf & Ejen:'}</span>{' '}
              {isEn
                ? 'Internal operations staff and verified field agents enter your registered credentials.'
                : 'Staf operasi dalaman dan ejen medan bertauliah sila masukkan kelayakan anda.'}
            </div>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-950/70 border border-red-800 text-red-200 text-xs py-2.5 px-3.5 rounded-none font-medium flex items-center gap-2">
                <span className="shrink-0">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {isEn ? 'Email or Username' : 'E-mel atau Nama Pengguna'}
              </label>
              <input
                type="text"
                required
                autoFocus
                placeholder={isEn ? 'Enter email / username' : 'Masukkan e-mel / nama pengguna'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full px-3.5 py-3 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-600 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                {isEn ? 'Password' : 'Kata Laluan'}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-3 pr-10 bg-slate-900 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
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
              className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-widest border border-red-500 shadow-lg shadow-red-950/60 transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>{isEn ? 'Authenticating...' : 'Mengesahkan...'}</span>
                </>
              ) : (
                <span>{isEn ? 'Authenticate & Enter Portal ➔' : 'Sahkan & Masuk Portal ➔'}</span>
              )}
            </button>
          </form>

          {/* Full Page Link Option */}
          <div className="mt-6 pt-6 border-t border-slate-900 text-center">
            <Link
              href="/login"
              onClick={onClose}
              className="text-xs font-mono text-slate-400 hover:text-red-400 underline transition-colors"
            >
              {isEn ? 'Prefer full-screen login page? Click here →' : 'Pilihan laman log masuk skrin penuh? Klik di sini →'}
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-slate-900 text-center text-[10px] font-mono text-slate-400">
          &copy; {new Date().getFullYear()} Legacy Cuisine Group • 256-Bit TLS
        </div>
      </div>
    </div>
  );
}

