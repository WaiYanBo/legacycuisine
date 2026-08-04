'use client';

import Link from 'next/link';
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

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <Link href={`/${currentLang}/forms/checklist`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-bold text-xl shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            LC
          </div>
          <div>
            <div className="text-white font-semibold text-lg tracking-wide group-hover:text-amber-400 transition-colors">
              LEGACY CUISINE
            </div>
            <div className="text-xs text-slate-400 font-medium">
              {t.brandSubtitle}
            </div>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/60 p-1.5 rounded-xl border border-slate-800/80">
          <Link
            href={`/${currentLang}/forms/checklist`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname.includes('/forms/checklist')
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.recruitmentChecklist}
          </Link>
          <Link
            href={`/${currentLang}/forms/registration`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname.includes('/forms/registration')
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.businessRegistration}
          </Link>
          <Link
            href={`/${currentLang}/forms/submissions`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              pathname.includes('/forms/submissions')
                ? 'bg-amber-500 text-slate-950 shadow-md font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            {t.viewSubmissions}
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-400 hover:text-amber-400 transition-colors"
          >
            {t.dashboard}
          </Link>
        </nav>

        {/* Language Switcher Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => toggleLanguage('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
              isEn
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            EN 🇬🇧
          </button>
          <button
            onClick={() => toggleLanguage('ms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
              !isEn
                ? 'bg-amber-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            BM 🇲🇾
          </button>
        </div>
      </div>
    </header>
  );
}
