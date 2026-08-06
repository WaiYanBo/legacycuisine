'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function TripleClickDoorGatePage() {
  const router = useRouter();
  const [clickCount, setClickCount] = useState(0);
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
    <main className="min-h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden select-none">
      {/* 🚪 3D Door Perspective Container */}
      <div className="relative w-full h-screen flex items-center justify-center perspective-container overflow-hidden">
        
        {/* Logo Double Door (Shown until doors open fully) */}
        {!showForm && (
          <div 
            onClick={handleLogoClick}
            className={`absolute inset-0 cursor-pointer flex items-center justify-center z-10 ${
              isDoorOpen ? 'pointer-events-none' : ''
            }`}
            title="Secret Access Gate"
          >
            {!isDoorOpen ? (
              /* Single Full Image filling 100% full screen edge-to-edge with ZERO white borders */
              <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-white">
                <Image
                  src="/logo.png"
                  alt="Legacy Cuisine Logo"
                  fill
                  priority
                  className="object-cover w-full h-full pointer-events-none"
                />
              </div>
            ) : (
              /* Split Doors during opening 3D animation */
              <>
                {/* Left Door Leaf */}
                <div className="absolute inset-0 flex items-center justify-center clip-door-left transition-all animate-door-open-left bg-white">
                  <Image
                    src="/logo.png"
                    alt="Legacy Cuisine Logo"
                    fill
                    priority
                    className="object-cover w-full h-full pointer-events-none"
                  />
                </div>

                {/* Right Door Leaf */}
                <div className="absolute inset-0 flex items-center justify-center clip-door-right transition-all animate-door-open-right bg-white">
                  <Image
                    src="/logo.png"
                    alt="Legacy Cuisine Logo"
                    fill
                    priority
                    className="object-cover w-full h-full pointer-events-none"
                  />
                </div>
              </>
            )}

            {/* ⚠️ Maintenance Notice floating badge over bottom of image */}
            <div className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 z-20 pointer-events-none px-4 w-full max-w-lg">
              <div className="bg-black/90 backdrop-blur-md border border-[#b0712d] text-white text-xs sm:text-sm font-semibold px-6 py-3 rounded-2xl shadow-2xl tracking-wide text-center flex items-center justify-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#aa0505] animate-pulse shrink-0" />
                <span>The Website is under Maintenance and will live again shortly</span>
              </div>
            </div>
          </div>
        )}

        {/* 🔐 Login Section (Emerges inside the opened door portal) */}
        {showForm && (
          <div className="relative z-20 w-full max-w-md mx-4 bg-black p-6 sm:p-8 rounded-3xl border border-[#b0712d] shadow-2xl animate-in fade-in zoom-in-90 duration-500">
            <div className="text-center mb-5">
              <h2 className="text-lg font-bold tracking-wider text-white uppercase">Administrator Portal</h2>
              <p className="text-xs text-[#b0712d] font-medium mt-1">Authorized Access Verified</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="bg-[#aa0505]/20 border border-[#aa0505] text-white text-xs py-2 px-3 rounded-xl text-center font-medium animate-bounce">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                  Username
                </label>
                <input
                  type="text"
                  required
                  placeholder="Enter Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#b0712d] text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#aa0505] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-white uppercase tracking-wider mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-black border border-[#b0712d] text-white placeholder-slate-400 text-sm focus:outline-none focus:border-[#aa0505] transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 bg-[#aa0505] hover:bg-[#b0712d] text-white font-bold text-sm rounded-xl shadow-lg transition-all transform active:scale-98 disabled:opacity-50 mt-1 flex items-center justify-center gap-2"
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
