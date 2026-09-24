'use client';

import React, { useState, useEffect } from 'react';
import AgentRegistrationForm from '../forms/AgentRegistrationForm';
import BusinessRegistrationForm from '../forms/BusinessRegistrationForm';
import PotentialClientForm from '../forms/PotentialClientForm';
import SubmissionsViewer from '../forms/SubmissionsViewer';
import { Locale } from '../../lib/i18n';

type FormType = 'potential' | 'merchant' | 'agent' | 'submissions';

interface RegistrationFormsViewProps {
  lang?: Locale;
}

export function RegistrationFormsView({ lang = 'ms' }: RegistrationFormsViewProps) {
  const [formType, setFormType] = useState<FormType>('potential');
  const [selectedLang, setSelectedLang] = useState<Locale>(lang);

  useEffect(() => {
    if (lang) {
      setSelectedLang(lang);
    }
  }, [lang]);

  const isEn = selectedLang === 'en';

  const handleSelectFormType = (type: FormType) => {
    setFormType(type);
    const dashboardMain = document.getElementById('dashboard-main');
    if (dashboardMain) {
      dashboardMain.scrollTo({ top: 0, behavior: 'smooth' });
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-6 animate-fadeIn print:space-y-0 print:m-0 print:p-0">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-4 print:hidden">
        <div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
            {isEn ? 'Registration & Onboarding Portal' : 'Portal Pendaftaran & Onboarding'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {isEn
              ? 'Onboard potential merchant leads, official merchant registrations & track submissions.'
              : 'Daftar klien berpotensi (leads), pendaftaran peniaga & rekod penyerahan.'}
          </p>
        </div>

        {/* Language Selector Controls */}
        <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto shadow-sm">
          <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 px-1.5 uppercase tracking-wider">
            {isEn ? 'Lang:' : 'Bahasa:'}
          </span>
          <button
            onClick={() => setSelectedLang('ms')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'ms'
                ? 'bg-red-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
            }`}
          >
            BM
          </button>
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'en'
                ? 'bg-red-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
            }`}
          >
            EN
          </button>
        </div>
      </div>

      {/* Form Type Selection Cards (2x2 Grid on Mobile, 4 Cols on Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 print:hidden">
        
        {/* CARD 1: POTENTIAL CLIENTS (LEADS) */}
        <button
          onClick={() => handleSelectFormType('potential')}
          className={`p-3 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'potential'
              ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 shadow-md shadow-amber-500/25 border-amber-500 ring-2 ring-amber-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:border-amber-300 dark:hover:border-amber-800'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className={`p-2 sm:p-2.5 rounded-xl ${formType === 'potential' ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span className={`text-[9px] sm:text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
              formType === 'potential' ? 'bg-slate-950 text-amber-400' : 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400'
            }`}>
              {isEn ? 'Lead' : 'Fleksibel'}
            </span>
          </div>
          <div>
            <h3 className={`font-black text-xs sm:text-base leading-tight ${formType === 'potential' ? 'text-slate-950' : 'text-slate-900 dark:text-white'}`}>
              {isEn ? 'Potential Clients' : 'Klien Berpotensi'}
            </h3>
            <p className={`text-[10px] sm:text-xs mt-1 leading-snug line-clamp-2 sm:line-clamp-none ${formType === 'potential' ? 'text-slate-900 font-semibold' : 'text-slate-500 dark:text-slate-400'}`}>
              {isEn
                ? 'Only Name, Store & WhatsApp required. Update day-by-day.'
                : 'Hanya Nama, Kedai & WhatsApp wajib. Kemaskini hari-hari.'}
            </p>
          </div>
        </button>

        {/* CARD 2: MERCHANT FORM CARD */}
        <button
          onClick={() => handleSelectFormType('merchant')}
          className={`p-3 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'merchant'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 border-red-600 ring-2 ring-red-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className={`p-2 sm:p-2.5 rounded-xl ${formType === 'merchant' ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {formType === 'merchant' && (
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-ping" />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-xs sm:text-base leading-tight ${formType === 'merchant' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {isEn ? 'Merchant Registration' : 'Pendaftaran Peniaga'}
            </h3>
            <p className={`text-[10px] sm:text-xs mt-1 leading-snug line-clamp-2 sm:line-clamp-none ${formType === 'merchant' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
              {isEn
                ? 'Official onboarding, SSM, bank details & documents.'
                : 'Onboarding rasmi, SSM, akaun bank & dokumen sokongan.'}
            </p>
          </div>
        </button>

        {/* CARD 3: AGENT FORM CARD */}
        <button
          onClick={() => handleSelectFormType('agent')}
          className={`p-3 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'agent'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 border-red-600 ring-2 ring-red-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className={`p-2 sm:p-2.5 rounded-xl ${formType === 'agent' ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {formType === 'agent' && (
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-ping" />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-xs sm:text-base leading-tight ${formType === 'agent' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {isEn ? 'Agent Registration' : 'Pendaftaran Ejen'}
            </h3>
            <p className={`text-[10px] sm:text-xs mt-1 leading-snug line-clamp-2 sm:line-clamp-none ${formType === 'agent' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
              {isEn
                ? 'Agent credentials, commissions & declaration.'
                : 'Maklumat ejen, akaun komisen & perakuan pelantikan.'}
            </p>
          </div>
        </button>

        {/* CARD 4: SUBMISSIONS CARD */}
        <button
          onClick={() => handleSelectFormType('submissions')}
          className={`p-3 sm:p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'submissions'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 border-red-600 ring-2 ring-red-400/40'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className={`p-2 sm:p-2.5 rounded-xl ${formType === 'submissions' ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {formType === 'submissions' && (
              <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-white animate-ping" />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-xs sm:text-base leading-tight ${formType === 'submissions' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {isEn ? 'Submissions & Records' : 'Rekod Penyerahan'}
            </h3>
            <p className={`text-[10px] sm:text-xs mt-1 leading-snug line-clamp-2 sm:line-clamp-none ${formType === 'submissions' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
              {isEn
                ? 'Manage leads, convert to real merchants & view forms.'
                : 'Urus leads, tukar ke peniaga rasmi & lihat borang.'}
            </p>
          </div>
        </button>
      </div>

      {/* Render Selected Form */}
      <div className="mt-6 print:mt-0 print:m-0 print:p-0">
        {formType === 'potential' && (
          <PotentialClientForm
            lang={selectedLang}
            onSuccessNavigate={() => handleSelectFormType('submissions')}
          />
        )}

        {formType === 'merchant' && (
          <BusinessRegistrationForm lang={selectedLang} />
        )}

        {formType === 'agent' && (
          <AgentRegistrationForm lang={selectedLang} />
        )}

        {formType === 'submissions' && (
          <SubmissionsViewer lang={selectedLang} initialTab="potential" />
        )}
      </div>
    </div>
  );
}
