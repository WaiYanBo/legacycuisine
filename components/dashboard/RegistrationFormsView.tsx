'use client';

import React, { useState } from 'react';
import AgentRegistrationForm from '../forms/AgentRegistrationForm';
import BusinessRegistrationForm from '../forms/BusinessRegistrationForm';
import SubmissionsViewer from '../forms/SubmissionsViewer';
import { Locale } from '../../lib/i18n';

type FormType = 'agent' | 'merchant' | 'submissions';

export function RegistrationFormsView() {
  const [formType, setFormType] = useState<FormType>('agent');
  const [selectedLang, setSelectedLang] = useState<Locale>('ms');

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-850 pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-slate-100">
            Registration & Forms Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official registration portal for Agent audit onboarding and Merchant storefront registrations.
          </p>
        </div>

        {/* Language Selector Controls */}
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-950 p-1.5 rounded-xl border border-slate-200 dark:border-slate-850 self-start md:self-auto shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 uppercase tracking-wider">
            Language:
          </span>
          <button
            onClick={() => setSelectedLang('ms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'ms'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            BM 🇲🇾
          </button>
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'en'
                ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            EN 🇬🇧
          </button>
        </div>
      </div>

      {/* Form Type Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* AGENT FORM CARD */}
        <button
          onClick={() => setFormType('agent')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'agent'
              ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/30 shadow-md'
              : 'bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {formType === 'agent' && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Borang Pendaftaran Ejen
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Rekod peribadi, perbankan, 5 peniaga didaftarkan & kaji selidik ejen
            </p>
          </div>
        </button>

        {/* MERCHANT FORM CARD */}
        <button
          onClick={() => setFormType('merchant')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'merchant'
              ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/30 shadow-md'
              : 'bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {formType === 'merchant' && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Pendaftaran Peniaga
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Borang onboarding profil kedai & muat naik gambar premis peniaga
            </p>
          </div>
        </button>

        {/* SUBMISSIONS CARD */}
        <button
          onClick={() => setFormType('submissions')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'submissions'
              ? 'bg-amber-500/10 border-amber-500 text-amber-900 dark:text-amber-300 ring-2 ring-amber-500/30 shadow-md'
              : 'bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-850 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {formType === 'submissions' && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
              Rekod Penyerahan
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Lihat borang ejen & pendaftaran peniaga yang telah disimpan
            </p>
          </div>
        </button>
      </div>

      {/* Render Selected Form */}
      <div className="mt-6">
        {formType === 'agent' && (
          <AgentRegistrationForm lang={selectedLang} />
        )}

        {formType === 'merchant' && (
          <div className="bg-white dark:bg-[#0d1117] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm">
            <BusinessRegistrationForm lang={selectedLang} />
          </div>
        )}

        {formType === 'submissions' && (
          <div className="bg-white dark:bg-[#0d1117] p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-850 shadow-sm">
            <SubmissionsViewer lang={selectedLang} />
          </div>
        )}
      </div>
    </div>
  );
}
