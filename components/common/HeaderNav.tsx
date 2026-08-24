'use client';

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

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href={`/${currentLang}/forms/checklist`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-full bg-white p-1 flex items-center justify-center shadow-sm border-2 border-red-600 ring-2 ring-red-600/15 group-hover:scale-105 transition-transform overflow-hidden">
            <Image
              src="/logo-circle.png"
              alt="Legacy Cuisine Logo"
              width={40}
              height={40}
              className="object-contain w-full h-full"
            />
          </div>
          <div>
            <div className="text-slate-900 dark:text-white font-extrabold text-base sm:text-lg tracking-tight group-hover:text-red-600 transition-colors">
              LEGACY CUISINE
            </div>
            <div className="text-[10px] text-red-600 dark:text-red-400 font-bold uppercase tracking-wider">
              {t.brandSubtitle}
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
          <Link
            href={`/${currentLang}/forms/checklist`}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname.includes('/forms/checklist')
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
            }`}
          >
            {t.recruitmentChecklist}
          </Link>
          <Link
            href={`/${currentLang}/forms/registration`}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname.includes('/forms/registration')
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
            }`}
          >
            {t.businessRegistration}
          </Link>
          <Link
            href={`/${currentLang}/forms/submissions`}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              pathname.includes('/forms/submissions')
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-sm shadow-red-600/20'
                : 'text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30'
            }`}
          >
            {t.viewSubmissions}
          </Link>
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all"
          >
            {t.dashboard}
          </Link>
        </nav>

        {/* Right Section: Language Switcher & Logout */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-950 p-1 rounded-xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => toggleLanguage('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider transition-all ${
                isEn
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              EN 🇬🇧
            </button>
            <button
              onClick={() => toggleLanguage('ms')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold tracking-wider transition-all ${
                !isEn
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
              }`}
            >
              BM 🇲🇾
            </button>
          </div>

          <button
            onClick={handleLogout}
            title="Lock Access Portal"
            className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-800 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

