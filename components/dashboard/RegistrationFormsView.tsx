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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-5 print:hidden">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Registration & Forms Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Official registration portal for Agent audit onboarding and Merchant storefront registrations.
          </p>
        </div>

        {/* Language Selector Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 self-start md:self-auto shadow-sm">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 px-2 uppercase tracking-wider">
            Language:
          </span>
          <button
            onClick={() => setSelectedLang('ms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'ms'
                ? 'bg-red-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
            }`}
          >
            BM 🇲🇾
          </button>
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'en'
                ? 'bg-red-600 text-white shadow-sm font-extrabold'
                : 'text-slate-600 dark:text-slate-300 hover:text-red-600'
            }`}
          >
            EN 🇬🇧
          </button>
        </div>
      </div>

      {/* Form Type Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:hidden">
        {/* AGENT FORM CARD */}
        <button
          onClick={() => setFormType('agent')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'agent'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 border-red-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${formType === 'agent' ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {formType === 'agent' && (
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-base ${formType === 'agent' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Borang Pendaftaran Ejen
            </h3>
            <p className={`text-xs mt-1 ${formType === 'agent' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
              Rekod peribadi, perbankan, 5 peniaga didaftarkan & kaji selidik ejen
            </p>
          </div>
        </button>

        {/* MERCHANT FORM CARD */}
        <button
          onClick={() => setFormType('merchant')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'merchant'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 border-red-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${formType === 'merchant' ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {formType === 'merchant' && (
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-base ${formType === 'merchant' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Pendaftaran Peniaga
            </h3>
            <p className={`text-xs mt-1 ${formType === 'merchant' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
              Borang onboarding profil kedai & muat naik gambar premis peniaga
            </p>
          </div>
        </button>

        {/* SUBMISSIONS CARD */}
        <button
          onClick={() => setFormType('submissions')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'submissions'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-md shadow-red-600/25 border-red-600'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`p-2.5 rounded-xl ${formType === 'submissions' ? 'bg-white/20 text-white' : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400'}`}>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {formType === 'submissions' && (
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
            )}
          </div>
          <div>
            <h3 className={`font-bold text-base ${formType === 'submissions' ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              Rekod Penyerahan
            </h3>
            <p className={`text-xs mt-1 ${formType === 'submissions' ? 'text-red-100' : 'text-slate-500 dark:text-slate-400'}`}>
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
          <BusinessRegistrationForm lang={selectedLang} />
        )}

        {formType === 'submissions' && (
          <SubmissionsViewer lang={selectedLang} />
        )}
      </div>
    </div>
  );
}
