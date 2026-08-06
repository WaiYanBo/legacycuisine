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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#b0712d] pb-5">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-black dark:text-white">
            Registration & Forms Portal
          </h1>
          <p className="text-sm text-[#b0712d] mt-1">
            Official registration portal for Agent audit onboarding and Merchant storefront registrations.
          </p>
        </div>

        {/* Language Selector Controls */}
        <div className="flex items-center gap-2 bg-white dark:bg-black p-1.5 rounded-xl border border-[#b0712d] self-start md:self-auto shadow-sm">
          <span className="text-xs font-bold text-[#b0712d] px-2 uppercase tracking-wider">
            Language:
          </span>
          <button
            onClick={() => setSelectedLang('ms')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'ms'
                ? 'bg-[#aa0505] text-white shadow-md font-extrabold'
                : 'text-black dark:text-white hover:text-[#b0712d]'
            }`}
          >
            BM 🇲🇾
          </button>
          <button
            onClick={() => setSelectedLang('en')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedLang === 'en'
                ? 'bg-[#aa0505] text-white shadow-md font-extrabold'
                : 'text-black dark:text-white hover:text-[#b0712d]'
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
              ? 'bg-[#aa0505]/15 border-[#aa0505] text-black dark:text-white ring-2 ring-[#aa0505]/50 shadow-md'
              : 'bg-white dark:bg-black border-[#b0712d] text-black dark:text-white hover:bg-[#b0712d]/10'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#b0712d]/15 text-[#b0712d]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            {formType === 'agent' && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#aa0505] animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-black dark:text-white">
              Borang Pendaftaran Ejen
            </h3>
            <p className="text-xs text-[#b0712d] mt-1">
              Rekod peribadi, perbankan, 5 peniaga didaftarkan & kaji selidik ejen
            </p>
          </div>
        </button>

        {/* MERCHANT FORM CARD */}
        <button
          onClick={() => setFormType('merchant')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'merchant'
              ? 'bg-[#aa0505]/15 border-[#aa0505] text-black dark:text-white ring-2 ring-[#aa0505]/50 shadow-md'
              : 'bg-white dark:bg-black border-[#b0712d] text-black dark:text-white hover:bg-[#b0712d]/10'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#b0712d]/15 text-[#b0712d]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            {formType === 'merchant' && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#aa0505] animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-black dark:text-white">
              Pendaftaran Peniaga
            </h3>
            <p className="text-xs text-[#b0712d] mt-1">
              Borang onboarding profil kedai & muat naik gambar premis peniaga
            </p>
          </div>
        </button>

        {/* SUBMISSIONS CARD */}
        <button
          onClick={() => setFormType('submissions')}
          className={`p-5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
            formType === 'submissions'
              ? 'bg-[#aa0505]/15 border-[#aa0505] text-black dark:text-white ring-2 ring-[#aa0505]/50 shadow-md'
              : 'bg-white dark:bg-black border-[#b0712d] text-black dark:text-white hover:bg-[#b0712d]/10'
          }`}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-xl bg-[#b0712d]/15 text-[#b0712d]">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            {formType === 'submissions' && (
              <span className="w-2.5 h-2.5 rounded-full bg-[#aa0505] animate-ping" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-base text-black dark:text-white">
              Rekod Penyerahan
            </h3>
            <p className="text-xs text-[#b0712d] mt-1">
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
          <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-3xl border border-[#b0712d] shadow-sm text-black dark:text-white">
            <BusinessRegistrationForm lang={selectedLang} />
          </div>
        )}

        {formType === 'submissions' && (
          <div className="bg-white dark:bg-black p-6 sm:p-8 rounded-3xl border border-[#b0712d] shadow-sm text-black dark:text-white">
            <SubmissionsViewer lang={selectedLang} />
          </div>
        )}
      </div>
    </div>
  );
}
