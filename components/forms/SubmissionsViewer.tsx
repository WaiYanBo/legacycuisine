'use client';

import React, { useEffect, useState } from 'react';
import { getDictionary, Locale } from '../../lib/i18n';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';

interface SubmissionsViewerProps {
  lang: Locale;
}

export default function SubmissionsViewer({ lang = 'en' }: SubmissionsViewerProps) {
  const isEn = lang === 'en';
  const dict = getDictionary(lang).submissions;

  const [activeTab, setActiveTab] = useState<'agents' | 'registrations' | 'checklists'>('agents');
  const [agents, setAgents] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Alphabetical Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default A-Z Alphabetical

  // Modal State for viewing the submitted form in full official layout
  const [viewingForm, setViewingForm] = useState<{
    type: 'agent' | 'merchant' | 'checklist';
    data: any;
  } | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const [aRes, cRes, rRes] = await Promise.all([
        fetch('/api/forms/agent-registration'),
        fetch('/api/forms/checklist'),
        fetch('/api/forms/registration'),
      ]);
      const aJson = await aRes.json().catch(() => ({}));
      const cJson = await cRes.json().catch(() => ({}));
      const rJson = await rRes.json().catch(() => ({}));

      const extractData = (res: any) => {
        if (Array.isArray(res)) return res;
        if (res && Array.isArray(res.data)) return res.data;
        return [];
      };

      setAgents(extractData(aJson));
      setChecklists(extractData(cJson));
      setRegistrations(extractData(rJson));
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadViewingFormSnapshot = () => {
    if (!viewingForm) return;
    const bucket = 'registration-forms';
    const folder = viewingForm.type === 'agent' ? 'agents' : viewingForm.type === 'merchant' ? 'merchants' : 'checklists';
    const fileId = viewingForm.data.id || viewingForm.data.agentNo || viewingForm.data.registrationNo || 'snapshot';
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({
      archiveType: viewingForm.type === 'agent' ? 'AGENT_REGISTRATION_FORM' : viewingForm.type === 'merchant' ? 'MERCHANT_REGISTRATION_FORM' : 'CHECKLIST_FORM',
      archivedAt: new Date().toISOString(),
      storageBucket: bucket,
      storageKey: `${folder}/${fileId}.json`,
      data: viewingForm.data,
    }, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `${folder}-${fileId}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  // Filter & Alphabetically Sort Agents (by agentName)
  const filteredAgents = React.useMemo(() => {
    let result = [...agents];
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      result = result.filter((a) => {
        const nameMatch = (a.agentName || '').toLowerCase().includes(q);
        const noMatch = (a.agentNo || '').toLowerCase().includes(q);
        const icMatch = (a.icNumber || '').toLowerCase().includes(q);
        const phoneMatch = (a.phoneNumber || '').toLowerCase().includes(q);
        const addressMatch = (a.address || '').toLowerCase().includes(q);
        const bankMatch = (a.bankName || '').toLowerCase().includes(q) || (a.bankAccountNumber || '').toLowerCase().includes(q);

        let merchantMatch = false;
        try {
          const parsed = typeof a.registeredMerchants === 'string' ? JSON.parse(a.registeredMerchants) : (a.registeredMerchants || []);
          merchantMatch = parsed.some((m: any) =>
            (m.namaPeniaga || m.name || '').toLowerCase().includes(q) ||
            (m.platform || m.cuisine || '').toLowerCase().includes(q) ||
            (m.catatan || m.notes || '').toLowerCase().includes(q)
          );
        } catch (e) { }

        return nameMatch || noMatch || icMatch || phoneMatch || addressMatch || bankMatch || merchantMatch;
      });
    }

    result.sort((a, b) => {
      const nameA = (a.agentName || '').toLowerCase();
      const nameB = (b.agentName || '').toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    return result;
  }, [agents, searchTerm, sortOrder]);

  // Filter & Alphabetically Sort Merchants (by businessName / fullName)
  const filteredRegistrations = React.useMemo(() => {
    let result = [...registrations];
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      result = result.filter((r) => {
        const bName = (r.businessName || '').toLowerCase().includes(q);
        const fName = (r.fullName || '').toLowerCase().includes(q);
        const regNo = (r.registrationNo || '').toLowerCase().includes(q);
        const icNo = (r.icPassportNo || '').toLowerCase().includes(q);
        const phone = (r.contactNumber || '').toLowerCase().includes(q);
        const email = (r.emailAddress || '').toLowerCase().includes(q);
        const addr = (r.storeAddress || '').toLowerCase().includes(q);
        const food = (r.typeOfFood || '').toLowerCase().includes(q);
        const bank = (r.bankName || '').toLowerCase().includes(q);
        const status = (r.status || '').toLowerCase().includes(q);
        return bName || fName || regNo || icNo || phone || email || addr || food || bank || status;
      });
    }

    result.sort((a, b) => {
      const nameA = (a.businessName || a.fullName || '').toLowerCase();
      const nameB = (b.businessName || b.fullName || '').toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    return result;
  }, [registrations, searchTerm, sortOrder]);

  // Filter & Alphabetically Sort Checklists (by merchant / vendor)
  const filteredChecklists = React.useMemo(() => {
    let result = [...checklists];
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      result = result.filter((c) => {
        const merch = (c.merchant || c.vendor || '').toLowerCase().includes(q);
        const pic = (c.personInCharge || '').toLowerCase().includes(q);
        const agent = (c.agentName || '').toLowerCase().includes(q);
        const phone = (c.mobileNumber || '').toLowerCase().includes(q);
        const email = (c.emailAddress || '').toLowerCase().includes(q);
        const addr = (c.outletAddress || '').toLowerCase().includes(q);
        const platform = (c.targetPlatform || '').toLowerCase().includes(q);
        const lead = (c.leadStatus || '').toLowerCase().includes(q);
        return merch || pic || agent || phone || email || addr || platform || lead;
      });
    }

    result.sort((a, b) => {
      const nameA = (a.merchant || a.vendor || '').toLowerCase();
      const nameB = (b.merchant || b.vendor || '').toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    return result;
  }, [checklists, searchTerm, sortOrder]);

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
      {/* Outer Submissions List View: Hidden during print if a form modal is being viewed */}
      <div className={viewingForm ? 'print:hidden' : ''}>
        {/* Title Header Card */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-4 sm:p-8 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-900 dark:text-slate-100">
          <div>
            <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{dict.title}</h1>
            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
              {dict.subtitle}
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span>{dict.refreshBtn}</span>
          </button>
        </div>

        {/* Tabs Navigation (Horizontally scrollable on mobile) */}
        <div className="flex overflow-x-auto no-scrollbar pb-1 sm:flex-wrap gap-2 sm:gap-3 mb-6">
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap rounded-xl font-bold text-xs tracking-wider transition-all border ${activeTab === 'agents'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
              }`}
          >
            {isEn ? 'Agent Registrations' : 'Pendaftaran Ejen'} ({searchTerm ? `${filteredAgents.length}/${agents.length}` : agents.length})
          </button>
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap rounded-xl font-bold text-xs tracking-wider transition-all border ${activeTab === 'registrations'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
              }`}
          >
            {isEn ? 'Merchant Registrations' : 'Pendaftaran Peniaga'} ({searchTerm ? `${filteredRegistrations.length}/${registrations.length}` : registrations.length})
          </button>
          <button
            onClick={() => setActiveTab('checklists')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap rounded-xl font-bold text-xs tracking-wider transition-all border ${activeTab === 'checklists'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
              }`}
          >
            {isEn ? 'Merchant Checklists' : 'Senarai Semak Peniaga'} ({searchTerm ? `${filteredChecklists.length}/${checklists.length}` : checklists.length})
          </button>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SEARCH BOX & ALPHABETICAL SORT CONTROLS BAR */}
        {/* ------------------------------------------------------------- */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl shadow-sm">
          {/* Search Input Box (Searches both Agent & Merchant) */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={
                isEn
                  ? 'Search agents & merchants (name, IC, SSM, cuisine, contact, or bank)...'
                  : 'Cari ejen & peniaga (nama, IC, SSM, masakan, no. telefon, atau bank)...'
              }
              className="w-full pl-10 pr-10 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-sm"
                title="Clear search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Alphabetical Sort Button & Counter */}
          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 transition-all flex items-center gap-1.5 shadow-sm"
              title={isEn ? 'Toggle Alphabetical Sorting' : 'Tukar Susunan Abjad'}
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
              <span>{isEn ? `Sort: ${sortOrder === 'asc' ? 'A → Z' : 'Z → A'}` : `Susun: ${sortOrder === 'asc' ? 'A → Z' : 'Z → A'}`}</span>
              <svg className={`w-3.5 h-3.5 transition-transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700">
              {activeTab === 'agents'
                ? `${filteredAgents.length} ${isEn ? 'of' : 'daripada'} ${agents.length}`
                : activeTab === 'registrations'
                  ? `${filteredRegistrations.length} ${isEn ? 'of' : 'daripada'} ${registrations.length}`
                  : `${filteredChecklists.length} ${isEn ? 'of' : 'daripada'} ${checklists.length}`}
            </div>
          </div>
        </div>

        {/* Real-time Cross-Entity Search Results Summary */}
        {searchTerm && (
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40 rounded-2xl text-xs mb-6 animate-fadeIn">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 dark:text-slate-400">
                {isEn ? 'Search results for' : 'Keputusan carian untuk'} <strong className="text-red-600 dark:text-red-400">"{searchTerm}"</strong>:
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${activeTab === 'agents'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600'
                  }`}
              >
                {isEn ? 'Agents:' : 'Ejen:'} {filteredAgents.length}
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${activeTab === 'registrations'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600'
                  }`}
              >
                {isEn ? 'Merchants:' : 'Peniaga:'} {filteredRegistrations.length}
              </button>
              <button
                onClick={() => setActiveTab('checklists')}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${activeTab === 'checklists'
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600'
                  }`}
              >
                {isEn ? 'Checklists:' : 'Senarai Semak:'} {filteredChecklists.length}
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
            {dict.loading}
          </div>
        ) : activeTab === 'agents' ? (
          <div className="space-y-4">
            {filteredAgents.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                {searchTerm ? (isEn ? 'No agents match your search.' : 'Tiada ejen sepadan dengan carian anda.') : (dict.emptyAgents || 'No agent registration records found yet.')}
              </div>
            ) : (
              filteredAgents.map((a) => {
                let parsedMerchants: any[] = [];
                try {
                  parsedMerchants = typeof a.registeredMerchants === 'string' ? JSON.parse(a.registeredMerchants) : (a.registeredMerchants || []);
                } catch (e) { }

                const validMerchants = parsedMerchants.filter((m: any) => m && (m.namaPeniaga || m.name));

                return (
                  <div key={a.id} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100 hover:border-red-200 dark:hover:border-red-900/40 transition-all">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="text-xl font-black text-slate-900 dark:text-white">{a.agentName}</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-[10px] font-bold tracking-wider">
                            NO: {a.agentNo}
                          </span>
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          IC: {a.icNumber} • Tel: {a.phoneNumber} • {a.race || (isEn ? 'Malay' : 'Melayu')} ({a.religion || 'Islam'})
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</span> <strong className="text-slate-900 dark:text-white">{formatDateToDDMMYYYY(a.date || a.createdAt)}</strong>
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                          <span className="text-slate-500 dark:text-slate-400">{isEn ? 'Supervisor:' : 'Penyelia:'}</span> <strong className="text-slate-900 dark:text-white">{a.supervisorName || (isEn ? 'Management' : 'Pengurusan')}</strong>
                        </div>

                        {/* VIEW OFFICIAL FORM BUTTON */}
                        <button
                          type="button"
                          onClick={() => setViewingForm({ type: 'agent', data: a })}
                          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-red-600/20 transition-all ml-1"
                          title={isEn ? 'View completed official agent registration form' : 'Lihat borang rasmi pendaftaran ejen'}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{isEn ? 'View Form' : 'Lihat Borang'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Address:' : 'Alamat:'}</strong> <span className="text-slate-600 dark:text-slate-400">{a.address || 'N/A'}</span></div>
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Banking:' : 'Perbankan:'}</strong> <span className="text-slate-600 dark:text-slate-400">{a.bankName || 'N/A'} — {a.bankAccountNumber} ({a.bankAccountName})</span></div>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Prospect Source:' : 'Sumber Prospek:'}</strong> <span className="text-slate-600 dark:text-slate-400">{a.prospectSource} {a.prospectSourceOther ? `(${a.prospectSourceOther})` : ''}</span></div>
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Confidence Level:' : 'Tahap Keyakinan:'}</strong> <span className="text-slate-600 dark:text-slate-400">{a.confidenceLevel} • {isEn ? 'Est. Duration:' : 'Anggaran:'} {a.estimatedDuration}</span></div>
                      </div>
                    </div>

                    {validMerchants.length > 0 && (
                      <div className="mt-3">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                          {isEn ? 'Registered Merchants List' : 'Senarai Peniaga Didaftarkan'} ({validMerchants.length})
                        </span>
                        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold">
                              <tr>
                                <th className="py-2 px-3 w-10 text-center">#</th>
                                <th className="py-2 px-3">{isEn ? 'Merchant Name' : 'Nama Peniaga'}</th>
                                <th className="py-2 px-3 w-32">Platform</th>
                                <th className="py-2 px-3 w-36">{isEn ? 'Date (DD/MM/YYYY)' : 'Tarikh (DD/MM/YYYY)'}</th>
                                <th className="py-2 px-3">{isEn ? 'Notes / Details' : 'Catatan'}</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                              {validMerchants.map((m: any, idx: number) => {
                                const merchantName = m.namaPeniaga || m.name || '-';
                                const platform = m.platform || m.cuisine || '-';
                                const rawDate = m.tarikhDidaftarkan || m.date;
                                const dateFormatted = rawDate ? (rawDate.includes('/') ? rawDate : formatDateToDDMMYYYY(rawDate)) : '-';
                                const notes = m.catatan || m.notes || m.phone || m.address || '-';

                                return (
                                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                    <td className="py-2 px-3 text-center text-slate-400">{m.bil || idx + 1}</td>
                                    <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{merchantName}</td>
                                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{platform}</td>
                                    <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{dateFormatted}</td>
                                    <td className="py-2 px-3 text-slate-500">{notes}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div className="text-[11px] text-slate-400 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span>{isEn ? 'Agent ID:' : 'ID Ejen:'} {a.id.slice(0, 8)}...</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Safe in Supabase Storage</span>
                        </span>
                      </div>
                      <span>{new Date(a.createdAt).toLocaleString(isEn ? 'en-GB' : 'ms-MY')}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : activeTab === 'checklists' ? (
          <div className="space-y-4">
            {filteredChecklists.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                {searchTerm ? (isEn ? 'No checklists match your search.' : 'Tiada senarai semak sepadan dengan carian anda.') : dict.emptyChecklists}
              </div>
            ) : (
              filteredChecklists.map((c) => (
                <div key={c.id} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors text-slate-900 dark:text-slate-100 hover:border-red-200 dark:hover:border-red-900/40">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-slate-900 dark:text-white">{c.merchant || c.vendor}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[10px] font-bold uppercase">
                          {c.language}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        PIC: {c.personInCharge} • Email: {c.emailAddress} • Mobile: {c.mobileNumber || 'N/A'}
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">{isEn ? 'Agent:' : 'Ejen:'}</span> <strong className="text-slate-900 dark:text-white">{c.agentName}</strong>
                      </div>
                      <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                        {isEn ? 'Score:' : 'Skor:'} {c.yesScore} / {c.totalChecked || 10} {isEn ? 'YES' : 'YA'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingForm({ type: 'checklist', data: c })}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-red-600/20 transition-all ml-1"
                        title={isEn ? 'View full recruitment checklist' : 'Lihat senarai semak penuh'}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{isEn ? 'View Form' : 'Lihat Borang'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-400">
                    <div><strong className="text-slate-900 dark:text-white">Platform:</strong> {c.targetPlatform}</div>
                    <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Outlets:' : 'Cawangan:'}</strong> {c.numberOfOutlets}</div>
                    <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Type:' : 'Jenis:'}</strong> {c.businessType}</div>
                    <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Submitted (DD/MM/YYYY):' : 'Dihantar (DD/MM/YYYY):'}</strong> {formatDateToDDMMYYYY(c.createdAt)}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredRegistrations.length === 0 ? (
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                {searchTerm ? (isEn ? 'No merchant registrations match your search.' : 'Tiada pendaftaran peniaga sepadan dengan carian anda.') : dict.emptyRegistrations}
              </div>
            ) : (
              filteredRegistrations.map((r) => {
                const statusDisplay = (status: string) => {
                  const s = (status || '').toLowerCase();
                  if (s.includes('lulus') || s.includes('approv')) return isEn ? 'Approved' : 'Diluluskan';
                  if (s.includes('tolak') || s.includes('reject')) return isEn ? 'Rejected' : 'Ditolak';
                  return isEn ? 'In Progress' : 'Dalam Proses';
                };

                return (
                  <div key={r.id} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 text-slate-900 dark:text-slate-100 hover:border-red-200 dark:hover:border-red-900/40 transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-xl font-bold text-slate-900 dark:text-white">{r.businessName || r.fullName}</h3>
                          {r.registrationNo && (
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">SSM: {r.registrationNo}</div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${(r.status || '').toLowerCase().includes('lulus') || (r.status || '').toLowerCase().includes('approv')
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                            : (r.status || '').toLowerCase().includes('tolak') || (r.status || '').toLowerCase().includes('reject')
                              ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}>
                            {statusDisplay(r.status)}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">{isEn ? 'Member No:' : 'No. Ahli:'} {r.memberNo || 'N/A'}</span>
                        </div>
                      </div>

                      {r.shopPhotoUrl && (
                        <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800">
                          <img src={r.shopPhotoUrl} alt={r.businessName} className="w-full h-full object-cover" />
                        </div>
                      )}

                      <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Full Name:' : 'Nama Penuh:'}</strong> {r.fullName || r.personInCharge}</div>
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'IC / Passport No:' : 'No. IC / Pasport:'}</strong> {r.icPassportNo || 'N/A'}</div>
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Contact / Phone:' : 'No. Telefon:'}</strong> {r.contactNumber}</div>
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Email Address:' : 'Alamat Emel:'}</strong> {r.emailAddress}</div>
                        <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Store Address:' : 'Alamat Premis:'}</strong> {r.storeAddress}</div>
                        {r.bankName && (
                          <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Bank Account:' : 'Akaun Bank:'}</strong> {r.bankName} — {r.bankAccountNumber} ({r.bankAccountName})</div>
                        )}
                        {r.operatingHours && (
                          <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Operating Hours:' : 'Waktu Operasi:'}</strong> {r.operatingHours}</div>
                        )}
                        {r.createdAt && (
                          <div><strong className="text-slate-900 dark:text-white">{isEn ? 'Registered (DD/MM/YYYY):' : 'Didaftarkan (DD/MM/YYYY):'}</strong> {formatDateToDDMMYYYY(r.createdAt)}</div>
                        )}
                        {(r.agentSignatureName || r.agentEmail) && (
                          <div className="pt-1 text-red-600 dark:text-red-400 font-semibold">
                            <strong>{isEn ? 'Registered by Agent:' : 'Didaftarkan Oleh Ejen:'}</strong> {r.agentSignatureName || r.agentEmail}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-wrap justify-between items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span>{isEn ? 'Merchant ID:' : 'ID Peniaga:'} {r.id.slice(0, 8)}...</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                          <span>Safe in Supabase Storage</span>
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setViewingForm({ type: 'merchant', data: r })}
                        className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm shadow-red-600/20 transition-all"
                        title={isEn ? 'View official merchant onboarding form' : 'Lihat borang onboarding rasmi'}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        <span>{isEn ? 'View Form' : 'Lihat Borang'}</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* OFFICIAL FORM VIEWING MODAL (AGENT, MERCHANT, OR CHECKLIST) */}
      {/* ------------------------------------------------------------- */}
      {viewingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn print-modal-overlay print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible">
          <div className="max-w-4xl w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 max-h-[92dvh] overflow-y-auto shadow-2xl space-y-5 sm:space-y-6 text-slate-900 dark:text-slate-100 print-modal-card printable-card print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:max-h-none print:overflow-visible">

            {/* Modal Top Bar (On-screen controls only, hidden on paper) */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4 print:hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 sm:px-3 py-1 bg-red-600 text-white font-extrabold text-[11px] sm:text-xs tracking-wider rounded-lg uppercase">
                  {viewingForm.type === 'agent'
                    ? (isEn ? 'AGENT REGISTRATION' : 'PENDAFTARAN EJEN')
                    : viewingForm.type === 'merchant'
                      ? (isEn ? 'MERCHANT REGISTRATION' : 'PENDAFTARAN PENIAGA')
                      : (isEn ? 'RECRUITMENT CHECKLIST' : 'SENARAI SEMAK PEREKRUTAN')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {viewingForm.type === 'agent' && `NO: ${viewingForm.data.agentNo}`}
                  {viewingForm.type === 'merchant' && `SSM: ${viewingForm.data.registrationNo || 'N/A'}`}
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  <span>Safe in Supabase Storage</span>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={downloadViewingFormSnapshot}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                  title="Download Supabase Storage JSON Snapshot"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>JSON</span>
                </button>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  <span>{isEn ? 'Print' : 'Cetak'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewingForm(null)}
                  className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-500 hover:text-red-600 dark:hover:text-red-400 flex items-center justify-center font-bold text-sm transition-all"
                  title="Close modal"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* ============================================================= */}
            {/* 1. AGENT REGISTRATION & AUDIT FORM VIEW */}
            {/* ============================================================= */}
            {viewingForm.type === 'agent' && (
              <div className="space-y-4 print:space-y-2">
                {/* Official Document Header matching physical printed form */}
                <div className="border-b-2 border-red-600 print:border-black pb-3 mb-2 flex flex-row items-start justify-between gap-4 print-doc-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2.5 py-0.5 bg-red-600 text-white font-extrabold text-[10px] tracking-wider rounded uppercase print:bg-black print:text-white print:border-none print:px-2 print:py-0.5">
                        {isEn ? 'AGENT REGISTRATION' : 'PENDAFTARAN EJEN'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 print:text-black">
                        {isEn ? 'AGENT NO:' : 'NO. EJEN:'} {viewingForm.data.agentNo}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black print:text-[13pt] print:font-extrabold">
                      {isEn ? 'AGENT REGISTRATION' : 'PENDAFTARAN EJEN'}
                    </h1>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 print:text-slate-800 mt-0.5">
                      Foodpanda, GrabFood and ShopeeFood — Malaysia
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1 max-w-2xl leading-relaxed print:text-[6.8pt] print:text-slate-600">
                      {isEn
                        ? 'This form is to be completed by the AGENT only for personal records, commission payments and self-review before registering any merchant.'
                        : 'Borang ini diisi oleh EJEN sahaja bagi tujuan rekod peribadi, pembayaran komisen dan semakan kendiri sebelum mendaftarkan mana-mana peniaga.'}
                    </p>
                  </div>

                  {/* Circular Legacy Cuisine Logo */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-red-600 shadow-sm print-logo-container print:border-black">
                    <img src="/logo-circle.png" alt="Legacy Cuisine Logo" className="object-contain w-full h-full" />
                  </div>
                </div>

                {/* Section 1: Agent Personal Info */}
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                    {isEn ? "SECTION 1: AGENT'S PERSONAL INFORMATION" : 'SEKSYEN 1: MAKLUMAT PERIBADI EJEN'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Date (DD/MM/YYYY) *' : 'Tarikh (DD/MM/YYYY) *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                        {formatDateToDDMMYYYY(viewingForm.data.date)}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Agent No. *' : 'No. Ejen *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-red-600 dark:text-red-400 print:text-black">
                        {viewingForm.data.agentNo}
                      </div>
                    </div>
                    <div className="sm:col-span-2 print:col-span-2">
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? "Agent's Name (As per NRIC/Passport) *" : 'Nama Ejen (Seperti dalam IC) *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-900 dark:text-white">
                        {viewingForm.data.agentName}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Identity Card No. *' : 'No. Kad Pengenalan *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.icNumber}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Telephone No. *' : 'No. Telefon *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.phoneNumber}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Race' : 'Bangsa'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.race || (isEn ? 'Malay' : 'Melayu')}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Religion' : 'Agama'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.religion || 'Islam'}
                      </div>
                    </div>
                    <div className="sm:col-span-2 print:col-span-2">
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Residential Address *' : 'Alamat Kediaman *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.address}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Banking Info */}
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                    {isEn ? 'SECTION 2: BANKING INFORMATION' : 'SEKSYEN 2: MAKLUMAT PERBANKAN'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 print:grid-cols-3">
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? "Bank Account Holder's Name *" : 'Nama Pemegang Akaun Bank *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                        {viewingForm.data.bankAccountName}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Bank Name *' : 'Nama Bank *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.bankName}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Bank Account No. *' : 'Nombor Akaun Bank *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {viewingForm.data.bankAccountNumber}
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 italic mt-0.5 print:text-[6.5pt] print:text-slate-500">
                    {isEn
                      ? 'Disclaimer: Requirements, fees, service areas and approval decisions may change without notice. Please check the official merchant application or contact the support centre before final submission.'
                      : 'Penafian: Syarat, yuran, liputan kawasan dan kelulusan tertakluk kepada perubahan. Sila semak permohonan rasmi atau hubungi pusat sokongan sebelum penghantaran.'}
                  </p>
                </div>

                {/* Optional Section: Registered Merchants Table (Only if records exist) */}
                {(() => {
                  let merchantsList: any[] = [];
                  try {
                    merchantsList = typeof viewingForm.data.registeredMerchants === 'string'
                      ? JSON.parse(viewingForm.data.registeredMerchants)
                      : (viewingForm.data.registeredMerchants || []);
                  } catch (e) { }

                  const validMerchants = merchantsList.filter((m: any) => m && (m.namaPeniaga || m.name));
                  if (validMerchants.length === 0) return null;

                  return (
                    <div className="space-y-1.5">
                      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                        {isEn ? 'REGISTERED MERCHANTS' : 'SENARAI PENIAGA BERJAYA DIDAFTARKAN'}
                      </div>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 print:rounded-none print:border-slate-400">
                        <table className="w-full min-w-[550px] text-left text-xs print-table">
                          <thead className="bg-slate-100 dark:bg-slate-950 font-bold text-slate-700 dark:text-slate-300">
                            <tr>
                              <th className="py-2 px-2.5 w-10 text-center">NO.</th>
                              <th className="py-2 px-2.5">{isEn ? 'MERCHANT NAME' : 'NAMA PENIAGA'}</th>
                              <th className="py-2 px-2.5 w-28">PLATFORM</th>
                              <th className="py-2 px-2.5 w-36">{isEn ? 'DATE REGISTERED (DD/MM/YYYY)' : 'TARIKH (DD/MM/YYYY)'}</th>
                              <th className="py-2 px-2.5">{isEn ? 'REMARKS' : 'CATATAN'}</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900">
                            {validMerchants.map((m: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-850">
                                <td className="py-2 px-2.5 text-center text-slate-500 font-bold">{m.bil || idx + 1}</td>
                                <td className="py-2 px-2.5 font-bold text-slate-900 dark:text-white print:text-black">{m.namaPeniaga || m.name || '-'}</td>
                                <td className="py-2 px-2.5">{m.platform || m.cuisine || '-'}</td>
                                <td className="py-2 px-2.5 font-mono">{formatDateToDDMMYYYY(m.tarikhDidaftarkan || m.date) || '-'}</td>
                                <td className="py-2 px-2.5 text-slate-600 dark:text-slate-400 print:text-black">{m.catatan || m.notes || m.phone || m.address || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  );
                })()}

                {/* Section 3: Declaration */}
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                    {isEn ? "SECTION 3: AGENT'S DECLARATION" : 'SEKSYEN 3: PENGAKUAN EJEN'}
                  </div>
                  {viewingForm.data.prospectSource === 'Declaration Signed & Confirmed' ? (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {isEn ? 'Terms & Conditions of Engagement Acknowledged & Accepted' : 'Terma & Syarat Perkhidmatan Diperakui & Diterima'}
                        </span>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800">
                        {isEn ? 'Declared & Signed' : 'Diperakui Sah'}
                      </span>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
                      <div>
                        <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                          {isEn ? 'Prospect Source' : 'Dari mana anda kenal peniaga ini?'}
                        </span>
                        <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                          {viewingForm.data.prospectSource} {viewingForm.data.prospectSourceOther ? `(${viewingForm.data.prospectSourceOther})` : ''}
                        </div>
                      </div>
                      <div>
                        <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                          {isEn ? 'Approached by other agents?' : 'Pernahkah peniaga didekati ejen lain?'}
                        </span>
                        <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                          {viewingForm.data.approachedByOtherAgents}
                        </div>
                      </div>
                      <div>
                        <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                          {isEn ? 'Confidence Level' : 'Tahap keyakinan peniaga bekerjasama:'}
                        </span>
                        <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                          {viewingForm.data.confidenceLevel}
                        </div>
                      </div>
                      <div>
                        <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                          {isEn ? 'Estimated Onboarding Duration' : 'Anggaran tempoh onboarding:'}
                        </span>
                        <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                          {viewingForm.data.estimatedDuration}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: Signatures */}
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                    {isEn ? 'SECTION 4: CONFIRMATION & SIGNATURE' : 'SEKSYEN 4: PENGESAHAN & TANDATANGAN'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:grid-cols-2">
                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950 print:bg-white print:border-slate-300">
                      <span className="print-data-label text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {isEn ? "Agent's Declaration & Signature:" : 'Tandatangan Ejen:'}
                      </span>
                      <div className="print-sig-box h-12 border border-dashed border-slate-300 dark:border-slate-700 rounded-lg flex items-center justify-center text-slate-600 dark:text-slate-400 font-mono text-xs bg-white dark:bg-slate-900 print:bg-white">
                        Digitally Verified Signature on File
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-2 print:text-[7pt] print:text-black">
                        <span>{isEn ? 'Name:' : 'Nama:'} <strong>{viewingForm.data.agentName}</strong></span>
                        <span>{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'} <strong>{formatDateToDDMMYYYY(viewingForm.data.agentSignatureDate || viewingForm.data.date)}</strong></span>
                      </div>
                    </div>

                    <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950 print:bg-white print:border-slate-300">
                      <span className="print-data-label text-[10px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                        {isEn ? "Supervisor's Review & Signature:" : 'Tandatangan Penyelia:'}
                      </span>
                      <div className="print-sig-box h-12 border border-dashed border-emerald-300 dark:border-emerald-700 rounded-lg flex items-center justify-center text-emerald-700 dark:text-emerald-400 font-bold text-xs bg-emerald-50/30 dark:bg-emerald-950/20 print:bg-white print:border-slate-400 print:text-black">
                        ✓ Approved & Certified
                      </div>
                      <div className="flex justify-between items-center text-[10px] text-slate-500 dark:text-slate-400 mt-2 print:text-[7pt] print:text-black">
                        <span>{isEn ? 'Supervisor:' : 'Penyelia:'} <strong>{viewingForm.data.supervisorName || 'Wai Yan Bo'}</strong></span>
                        <span>{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'} <strong>{formatDateToDDMMYYYY(viewingForm.data.supervisorDate || viewingForm.data.date)}</strong></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* 2. MERCHANT REGISTRATION VIEW */}
            {/* ============================================================= */}
            {viewingForm.type === 'merchant' && (
              <div className="space-y-4 print:space-y-2">
                {/* Official Document Header for Merchant */}
                <div className="border-b-2 border-red-600 print:border-black pb-3 mb-2 flex flex-row items-start justify-between gap-4 print-doc-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2.5 py-0.5 bg-red-600 text-white font-extrabold text-[10px] tracking-wider rounded uppercase print:bg-black print:text-white print:border-none print:px-2 print:py-0.5">
                        {isEn ? 'MERCHANT REGISTRATION' : 'PENDAFTARAN PENIAGA'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 print:text-black">
                        SSM: {viewingForm.data.registrationNo || 'N/A'} • {isEn ? 'MEMBER NO:' : 'NO. AHLI:'} {viewingForm.data.memberNo || 'N/A'}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black print:text-[13pt] print:font-extrabold">
                      {viewingForm.data.businessName || viewingForm.data.fullName}
                    </h1>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 print:text-slate-800 mt-0.5">
                      {isEn ? 'Merchant Onboarding & Store Profile Record' : 'Borang Onboarding & Profil Kedai Peniaga'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1 max-w-2xl leading-relaxed print:text-[6.8pt] print:text-slate-600">
                      {isEn
                        ? 'Official business onboarding and settlement profile for Foodpanda, GrabFood and ShopeeFood delivery platforms.'
                        : 'Profil rasmi onboarding perniagaan dan akaun pembayaran bagi platform penghantaran makanan Malaysia.'}
                    </p>
                  </div>

                  {/* Circular Legacy Cuisine Logo */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-red-600 shadow-sm print-logo-container print:border-black">
                    <img src="/logo-circle.png" alt="Legacy Cuisine Logo" className="object-contain w-full h-full" />
                  </div>
                </div>

                {/* Section 1: Merchant & Store Details */}
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                    {isEn ? '1. MERCHANT & STORE DETAILS' : '1. MAKLUMAT PENIAGA & PREMIS'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Owner Full Name *' : 'Nama Penuh Pemilik *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                        {viewingForm.data.fullName}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'NRIC / Passport *' : 'No. IC / Pasport *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.icPassportNo}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Contact / Phone *' : 'No. Telefon *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.contactNumber}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Email Address *' : 'Alamat Emel *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.emailAddress}
                      </div>
                    </div>
                    <div className="sm:col-span-2 print:col-span-2">
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Store / Outlet Address *' : 'Alamat Premis Kedai *'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.storeAddress}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Operating Days & Hours' : 'Hari & Waktu Operasi'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.operatingDays} ({viewingForm.data.operatingHours})
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Cuisine / Food Type' : 'Jenis Makanan'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.typeOfFood}
                      </div>
                    </div>
                    {viewingForm.data.createdAt && (
                      <div className="sm:col-span-2 print:col-span-2">
                        <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                          {isEn ? 'Registration Date (DD/MM/YYYY)' : 'Tarikh Pendaftaran (DD/MM/YYYY)'}
                        </span>
                        <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                          {formatDateToDDMMYYYY(viewingForm.data.createdAt)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Section 2: Banking Info */}
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                    {isEn ? '2. BANK ACCOUNT SETTLEMENT' : '2. MAKLUMAT AKAUN BANK'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 print:grid-cols-3">
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Bank Name' : 'Nama Bank'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                        {viewingForm.data.bankName}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Account Name' : 'Nama Pemegang Akaun'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.bankAccountName}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Account Number' : 'Nombor Akaun Bank'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white">
                        {viewingForm.data.bankAccountNumber}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Verified Documents & Storefront */}
                {(() => {
                  let parsedDocs: Record<string, any> = {};
                  try {
                    if (viewingForm.data.documentsChecklist) {
                      parsedDocs = typeof viewingForm.data.documentsChecklist === 'string'
                        ? JSON.parse(viewingForm.data.documentsChecklist)
                        : viewingForm.data.documentsChecklist;
                    }
                  } catch (e) {}

                  const docEntries = Object.entries(parsedDocs);
                  const hasStorePhoto = Boolean(viewingForm.data.shopPhotoUrl);
                  if (docEntries.length === 0 && !hasStorePhoto) return null;

                  return (
                    <div className="space-y-2">
                      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                        {isEn ? '3. VERIFIED DOCUMENTS & STOREFRONT' : '3. DOKUMEN & GAMBAR PREMIS'}
                      </div>

                      {hasStorePhoto && (
                        <div className="w-full h-44 sm:h-52 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-950">
                          <img src={viewingForm.data.shopPhotoUrl} alt="Storefront" className="w-full h-full object-contain" />
                        </div>
                      )}

                      {docEntries.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {docEntries.map(([docKey, val]: [string, any]) => {
                            const isObj = typeof val === 'object' && val !== null;
                            const fileUrl = isObj ? val.url : null;
                            const isReceived = isObj
                              ? (val.status === 'Received' || val.status === 'Diterima' || val.status === 'Uploaded' || Boolean(val.url))
                              : (val === true || val === 'Received' || val === 'Diterima');
                            const docName = docKey === 'ic' ? (isEn ? 'Identity Card' : 'Kad Pengenalan')
                              : docKey === 'ssm' ? 'SSM'
                              : docKey === 'pbt' ? (isEn ? 'PBT Licence' : 'Lesen PBT')
                              : docKey === 'bank' ? (isEn ? 'Bank Statement' : 'Penyata Bank')
                              : docKey === 'logo' ? 'Logo'
                              : docKey === 'premis' ? (isEn ? 'Premises Photo' : 'Gambar Premis')
                              : docKey === 'menu' ? (isEn ? 'Menu Photo' : 'Gambar Menu')
                              : docKey === 'harga' ? (isEn ? 'Price List' : 'Senarai Harga')
                              : docKey === 'halal' ? (isEn ? 'Halal Certificate' : 'Sijil Halal')
                              : docKey;

                            return (
                              <div key={docKey} className="p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                                {fileUrl ? (
                                  <a
                                    href={fileUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-400 shrink-0 block hover:scale-105 transition-transform"
                                    title={isEn ? 'Click to open document' : 'Buka dokumen'}
                                  >
                                    <img src={fileUrl} alt={docName} className="w-full h-full object-cover" />
                                  </a>
                                ) : (
                                  <span className="text-xs font-bold text-slate-500">{isReceived ? '✓' : '✗'}</span>
                                )}
                                <div className="min-w-0">
                                  <div className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{docName}</div>
                                  <div className="text-[10px] text-slate-500 truncate">
                                    {isReceived ? (fileUrl ? (isEn ? 'Attached' : 'Dilampirkan') : (isEn ? 'Verified' : 'Disahkan')) : (isEn ? 'Pending' : 'Belum')}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Section 4: Verification Status */}
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-950 print:bg-white print:border-slate-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Onboarding Status' : 'Status Onboarding'}
                      </span>
                      <span className="font-bold text-sm text-emerald-600 dark:text-emerald-400 print:text-black">
                        {(viewingForm.data.status || '').toLowerCase().includes('lulus') ? (isEn ? '✓ Approved & Activated' : '✓ Diluluskan & Aktif') : (isEn ? 'In Progress' : 'Dalam Proses')}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Supervisor Review' : 'Semakan Penyelia'}
                      </span>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 print:text-black">
                        Wai Yan Bo
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* 3. CHECKLIST VIEW */}
            {/* ============================================================= */}
            {viewingForm.type === 'checklist' && (
              <div className="space-y-4 print:space-y-2">
                {/* Official Document Header for Checklist */}
                <div className="border-b-2 border-red-600 print:border-black pb-3 mb-2 flex flex-row items-start justify-between gap-4 print-doc-header">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-block px-2.5 py-0.5 bg-red-600 text-white font-extrabold text-[10px] tracking-wider rounded uppercase print:bg-black print:text-white print:border-none print:px-2 print:py-0.5">
                        {isEn ? 'CHECKLIST FORM' : 'BORANG SENARAI SEMAK'}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-600 dark:text-slate-400 print:text-black">
                        {isEn ? 'AGENT:' : 'EJEN:'} {viewingForm.data.agentName}
                      </span>
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white print:text-black print:text-[13pt] print:font-extrabold">
                      {viewingForm.data.merchant || viewingForm.data.vendor}
                    </h1>
                    <p className="text-xs font-bold text-red-600 dark:text-red-400 print:text-slate-800 mt-0.5">
                      {isEn ? 'Merchant Recruitment & Field Audit Assessment' : 'Senarai Semak Perekrutan & Audit Lapangan Peniaga'}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 italic mt-1 max-w-2xl leading-relaxed print:text-[6.8pt] print:text-slate-600">
                      {isEn
                        ? 'Official on-site audit and qualification assessment checklist conducted by authorized recruitment agent.'
                        : 'Senarai semak audit lapangan dan penilaian kelayakan rasmi yang dijalankan oleh ejen bertauliah.'}
                    </p>
                  </div>

                  {/* Circular Legacy Cuisine Logo */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-full bg-white p-1.5 flex items-center justify-center border-2 border-red-600 shadow-sm print-logo-container print:border-black">
                    <img src="/logo-circle.png" alt="Legacy Cuisine Logo" className="object-contain w-full h-full" />
                  </div>
                </div>

                {/* Section 1: Store Profile */}
                <div className="space-y-1.5">
                  <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                    {isEn ? '1. STORE & OUTLET AUDIT PROFILE' : '1. PROFIL PREMIS & AUDIT PENIAGA'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 print:grid-cols-2">
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Target Delivery Platform' : 'Platform Sasaran'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white">
                        {viewingForm.data.targetPlatform}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Lead Classification' : 'Status Prospek'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-red-600 dark:text-red-400 print:text-black">
                        {viewingForm.data.leadStatus}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Business Type' : 'Jenis Perniagaan'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.businessType}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Number of Outlets' : 'Bilangan Cawangan'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.numberOfOutlets}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Audit Date (DD/MM/YYYY)' : 'Tarikh Audit (DD/MM/YYYY)'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {formatDateToDDMMYYYY(viewingForm.data.createdAt)}
                      </div>
                    </div>
                    <div>
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Audit Score' : 'Skor Audit'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-bold text-emerald-600 dark:text-emerald-400 print:text-black">
                        {viewingForm.data.yesScore} / {viewingForm.data.totalChecked || 10} {isEn ? 'YES' : 'YA'}
                      </div>
                    </div>
                    <div className="sm:col-span-2 print:col-span-2">
                      <span className="print-data-label text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-0.5 uppercase tracking-wider">
                        {isEn ? 'Outlet Address' : 'Alamat Cawangan'}
                      </span>
                      <div className="print-data-box px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-medium text-slate-900 dark:text-white">
                        {viewingForm.data.outletAddress}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 2: Agent Audit Notes */}
                {viewingForm.data.agentNotes && (
                  <div className="space-y-1.5">
                    <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-3 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider print-section-banner">
                      {isEn ? '2. AGENT AUDIT NOTES & REMARKS' : '2. CATATAN & ULASAN AUDIT EJEN'}
                    </div>
                    <div className="print-data-box p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 print:text-black">
                      {viewingForm.data.agentNotes}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Modal Bottom Actions (Hidden on paper) */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end print:hidden">
              <button
                type="button"
                onClick={() => setViewingForm(null)}
                className="px-6 py-2.5 bg-slate-900 dark:bg-white hover:bg-slate-800 text-white dark:text-slate-900 font-bold text-xs rounded-xl transition-all shadow-md"
              >
                {isEn ? 'Close Form View' : 'Tutup Paparan'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

