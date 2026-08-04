'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TripleClickDoorGatePage() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleLogoClick = () => {
    if (isDoorOpen) return;

    const newCount = clickCount + 1;
    setClickCount(newCount);

    // Micro feedback shake animation on click
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 220);

    // Reset click count if not clicked within 1.2s
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setClickCount(0);
    }, 1200);

    // Require 3 fast clicks to trigger the 3D door opening
    if (newCount >= 3) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setIsDoorOpen(true);
      setTimeout(() => {
        setShowForm(true);
      }, 500);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (username.trim() === 'Wai Yan Bo' && password === 'Hahaha123!') {
        document.cookie = 'lc_auth=authenticated; path=/; max-age=2592000; SameSite=Lax';
        localStorage.setItem('lc_auth', 'authenticated');
        router.push('/dashboard');
      } else {
        setError('Invalid Username or Password');
        setIsLoading(false);
      }
    }, 400);
  };

  return (
    <main className="min-h-screen bg-white flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* 🚪 3D Door Perspective Container */}
      <div className="relative w-80 h-80 sm:w-[420px] sm:h-[420px] flex items-center justify-center perspective-container">
        
        {/* Logo Double Door (Shown until doors open fully) */}
        {!showForm && (
          <div 
            onClick={handleLogoClick}
            className={`absolute inset-0 cursor-pointer flex items-center justify-center transition-all z-10 ${
              isShaking ? 'animate-micro-shake' : ''
            } ${isDoorOpen ? 'pointer-events-none' : ''}`}
            title="Secret Access Gate"
          >
            {/* Left Door Leaf */}
            <div 
              className={`absolute inset-0 flex items-center justify-center clip-door-left transition-all ${
                isDoorOpen 
                  ? 'animate-door-open-left' 
                  : 'animate-float-slow hover:brightness-105'
              }`}
            >
              <Image
                src="/logo.png"
                alt="Legacy Cuisine Logo"
                width={1254}
                height={1254}
                priority
                className="object-contain w-full h-full pointer-events-none"
              />
            </div>

            {/* Right Door Leaf */}
            <div 
              className={`absolute inset-0 flex items-center justify-center clip-door-right transition-all ${
                isDoorOpen 
                  ? 'animate-door-open-right' 
                  : 'animate-float-slow hover:brightness-105'
              }`}
            >
              <Image
                src="/logo.png"
                alt="Legacy Cuisine Logo"
                width={1254}
                height={1254}
                priority
                className="object-contain w-full h-full pointer-events-none"
              />
            </div>
          </div>
        )}

        {/* 🔐 Login Section (Emerges inside the opened door portal) */}
        {showForm && (
          <div className="relative z-20 w-full bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-2xl animate-in fade-in zoom-in-90 duration-500">
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold tracking-wider text-slate-900 uppercase">Administrator Portal</h2>
              <p className="text-xs text-amber-600 font-medium mt-1">Authorized Access Verified</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-600 text-xs py-2 px-3 rounded-xl text-center font-medium animate-bounce">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-amber-500 focus:bg-white transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-slate-950 hover:bg-amber-600 text-white font-bold text-sm rounded-xl shadow-lg transition-all transform active:scale-98 disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Unlocking...</span>
                  </>
                ) : (
                  <span>ENTER PORTAL</span>
                )}
              </button>
            </form>
          </div>
        )}
      </div>
    </main>
  );
}
