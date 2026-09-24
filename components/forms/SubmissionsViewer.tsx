'use client';

import React, { useEffect, useState } from 'react';
import { getDictionary, Locale } from '../../lib/i18n';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';

interface SubmissionsViewerProps {
  lang: Locale;
  initialTab?: 'agents' | 'registrations' | 'potential' | 'checklists';
}

export default function SubmissionsViewer({ lang = 'en', initialTab = 'potential' }: SubmissionsViewerProps) {
  const isEn = lang === 'en';
  const dict = getDictionary(lang).submissions;

  const [activeTab, setActiveTab] = useState<'agents' | 'registrations' | 'potential' | 'checklists'>(initialTab);
  const [agents, setAgents] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Synchronize activeTab if initialTab changes
  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  // Search & Alphabetical Sorting States
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default A-Z Alphabetical

  // Modal State for viewing the submitted form in full official layout
  const [viewingForm, setViewingForm] = useState<{
    type: 'agent' | 'merchant' | 'checklist';
    data: any;
  } | null>(null);

  // Day-by-Day Update Modal State
  const [editingClient, setEditingClient] = useState<any | null>(null);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [convertingId, setConvertingId] = useState<string | null>(null);

  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteAgent = async (agent: any) => {
    const confirmMsg = isEn
      ? `Are you sure you want to delete agent "${agent.agentName}" (No: ${agent.agentNo})? This will also delete their agent login account. This action cannot be undone.`
      : `Adakah anda pasti mahu memadam rekod ejen "${agent.agentName}" (No: ${agent.agentNo})? Ini juga akan memadam akaun log masuk ejen mereka. Tindakan ini tidak boleh diundur.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(agent.id);
    try {
      const res = await fetch(`/api/forms/agent-registration?id=${agent.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete agent');
      alert(isEn ? 'Agent deleted successfully.' : 'Rekod ejen berjaya dipadam.');
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'Error deleting agent');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteMerchant = async (merchant: any) => {
    const isPotential = (merchant.status || '').toLowerCase() === 'potential';
    const name = merchant.businessName || merchant.fullName || 'this merchant';
    const confirmMsg = isEn
      ? `Are you sure you want to delete ${isPotential ? 'potential client' : 'merchant registration'} "${name}"? This action cannot be undone.`
      : `Adakah anda pasti mahu memadam ${isPotential ? 'klien berpotensi' : 'pendaftaran peniaga'} "${name}"? Tindakan ini tidak boleh diundur.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(merchant.id);
    try {
      const res = await fetch(`/api/forms/registration?id=${merchant.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete record');
      alert(isEn
        ? `${isPotential ? 'Potential client' : 'Merchant registration'} deleted successfully.`
        : `${isPotential ? 'Klien berpotensi' : 'Pendaftaran peniaga'} berjaya dipadam.`
      );
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'Error deleting merchant');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteChecklist = async (checklist: any) => {
    const name = checklist.merchant || checklist.personInCharge || 'this checklist';
    const confirmMsg = isEn
      ? `Are you sure you want to delete checklist for "${name}"? This action cannot be undone.`
      : `Adakah anda pasti mahu memadam senarai semak untuk "${name}"? Tindakan ini tidak boleh diundur.`;
    if (!window.confirm(confirmMsg)) return;

    setDeletingId(checklist.id);
    try {
      const res = await fetch(`/api/forms/checklist?id=${checklist.id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to delete checklist');
      alert(isEn ? 'Checklist deleted successfully.' : 'Senarai semak berjaya dipadam.');
      fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'Error deleting checklist');
    } finally {
      setDeletingId(null);
    }
  };

  // Day-by-Day Update Handler
  const handleSaveEdit = async () => {
    if (!editingClient) return;

    if (!editingClient.businessName?.trim()) {
      alert(isEn ? 'Store / Business Name is required.' : 'Nama Kedai / Syarikat adalah wajib.');
      return;
    }
    if (!editingClient.fullName?.trim()) {
      alert(isEn ? 'Merchant / Owner Name is required.' : 'Nama Peniaga / Pemilik adalah wajib.');
      return;
    }
    if (!editingClient.contactNumber?.trim()) {
      alert(isEn ? 'Phone Number (WhatsApp) is required.' : 'Nombor Telefon (WhatsApp) adalah wajib.');
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await fetch('/api/forms/registration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingClient.id,
          updates: {
            businessName: editingClient.businessName.trim(),
            fullName: editingClient.fullName.trim(),
            contactNumber: editingClient.contactNumber.trim(),
            storeAddress: editingClient.storeAddress?.trim() || '',
            mailingAddress: editingClient.mailingAddress?.trim() || '',
            emailAddress: editingClient.emailAddress?.trim() || '',
            registrationNo: editingClient.registrationNo?.trim() || null,
            icPassportNo: editingClient.icPassportNo?.trim() || null,
            typeOfFood: editingClient.typeOfFood?.trim() || '',
            operatingDays: editingClient.operatingDays?.trim() || '',
            operatingHours: editingClient.operatingHours?.trim() || '',
            bankName: editingClient.bankName?.trim() || '',
            bankAccountName: editingClient.bankAccountName?.trim() || '',
            bankAccountNumber: editingClient.bankAccountNumber?.trim() || '',
            rejectionReason: editingClient.rejectionReason?.trim() || null,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isEn ? 'Failed to update potential client' : 'Gagal mengemaskini maklumat'));
      }

      alert(isEn ? 'Potential client details updated successfully!' : 'Maklumat klien berpotensi berjaya dikemaskini!');
      setEditingClient(null);
      await fetchSubmissions();
    } catch (err: any) {
      alert(err.message || 'Error updating potential client');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Convert Potential Client to Real Merchant Handler
  const handleConvertClient = async (client: any) => {
    const displayName = client.businessName || client.fullName;
    const confirmMsg = isEn
      ? `Are you sure you want to finalize and convert "${displayName}" to an Official Real Merchant?\n\nThis will assign an official Merchant ID (MCH-xxxx), transition status to 'In Progress', and move them into the official Merchant Registrations tab.`
      : `Adakah anda pasti mahu memuktamadkan dan menukar "${displayName}" kepada Peniaga Rasmi?\n\nTindakan ini akan menjana No. Ahli Peniaga rasmi (MCH-xxxx), menukar status kepada 'Dalam Proses', dan memindahkannya ke tab Pendaftaran Peniaga.`;

    if (!window.confirm(confirmMsg)) return;

    setConvertingId(client.id);
    try {
      const res = await fetch('/api/forms/registration', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: client.id,
          action: 'convert',
          updates: {
            status: 'Dalam Proses',
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || (isEn ? 'Failed to convert potential client' : 'Gagal menukar klien berpotensi'));
      }

      alert(isEn
        ? `Successfully converted "${displayName}" to Official Real Merchant!`
        : `Berjaya menukar "${displayName}" kepada Peniaga Rasmi!`
      );

      if (editingClient) setEditingClient(null);
      await fetchSubmissions();
      setActiveTab('registrations');
    } catch (err: any) {
      alert(err.message || 'Error converting client');
    } finally {
      setConvertingId(null);
    }
  };

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

  // Split registrations into Potential Clients and Real Merchants
  const potentialClients = React.useMemo(() => {
    return registrations.filter((r) => (r.status || '').toLowerCase() === 'potential');
  }, [registrations]);

  const realMerchants = React.useMemo(() => {
    return registrations.filter((r) => (r.status || '').toLowerCase() !== 'potential');
  }, [registrations]);

  // Helper to compute profile completeness for potential clients
  const getCompleteness = (client: any) => {
    const items = [
      { label: isEn ? 'Merchant Name' : 'Nama Peniaga', done: Boolean(client.fullName?.trim()) },
      { label: isEn ? 'Store Name' : 'Nama Kedai', done: Boolean(client.businessName?.trim()) },
      { label: isEn ? 'WhatsApp Phone' : 'No. Telefon', done: Boolean(client.contactNumber?.trim()) },
      { label: isEn ? 'Store Address' : 'Alamat Premis', done: Boolean(client.storeAddress?.trim() || client.mailingAddress?.trim()) },
      { label: isEn ? 'SSM Reg No' : 'No. SSM', done: Boolean(client.registrationNo?.trim()) },
      { label: isEn ? 'IC / Passport' : 'No. IC', done: Boolean(client.icPassportNo?.trim()) },
      { label: isEn ? 'Bank Account' : 'Akaun Bank', done: Boolean(client.bankName?.trim() && client.bankAccountNumber?.trim()) },
      { label: isEn ? 'Operating Info' : 'Waktu Operasi', done: Boolean(client.operatingHours?.trim() || client.operatingDays?.trim()) },
    ];
    const completed = items.filter((i) => i.done).length;
    const percent = Math.round((completed / items.length) * 100);
    return { completed, total: items.length, percent, items };
  };

  // Filter & Alphabetically Sort Potential Clients
  const filteredPotential = React.useMemo(() => {
    let result = [...potentialClients];
    const q = searchTerm.toLowerCase().trim();
    if (q) {
      result = result.filter((p) => {
        const bName = (p.businessName || '').toLowerCase().includes(q);
        const fName = (p.fullName || '').toLowerCase().includes(q);
        const memNo = (p.memberNo || '').toLowerCase().includes(q);
        const phone = (p.contactNumber || '').toLowerCase().includes(q);
        const email = (p.emailAddress || '').toLowerCase().includes(q);
        const addr = (p.storeAddress || '').toLowerCase().includes(q) || (p.mailingAddress || '').toLowerCase().includes(q);
        const ssm = (p.registrationNo || '').toLowerCase().includes(q);
        const notes = (p.rejectionReason || '').toLowerCase().includes(q);
        return bName || fName || memNo || phone || email || addr || ssm || notes;
      });
    }

    result.sort((a, b) => {
      const nameA = (a.businessName || a.fullName || '').toLowerCase();
      const nameB = (b.businessName || b.fullName || '').toLowerCase();
      return sortOrder === 'asc' ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
    });

    return result;
  }, [potentialClients, searchTerm, sortOrder]);

  // Filter & Alphabetically Sort Real Merchants (by businessName / fullName)
  const filteredRegistrations = React.useMemo(() => {
    let result = [...realMerchants];
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
  }, [realMerchants, searchTerm, sortOrder]);

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
          {/* TAB 1: POTENTIAL CLIENTS */}
          <button
            onClick={() => setActiveTab('potential')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap rounded-xl font-bold text-xs tracking-wider transition-all border flex items-center gap-2 ${
              activeTab === 'potential'
                ? 'bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-slate-950 border-amber-500 shadow-md shadow-amber-500/25 font-black'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/30 hover:text-amber-700 dark:hover:text-amber-400'
            }`}
          >
            <span className="text-sm leading-none">★</span>
            <span>{isEn ? 'Potential Clients' : 'Klien Berpotensi'}</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === 'potential'
                  ? 'bg-slate-950 text-amber-300'
                  : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
              }`}
            >
              {searchTerm ? `${filteredPotential.length}/${potentialClients.length}` : potentialClients.length}
            </span>
          </button>

          {/* TAB 2: OFFICIAL MERCHANT REGISTRATIONS */}
          <button
            onClick={() => setActiveTab('registrations')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap rounded-xl font-bold text-xs tracking-wider transition-all border ${
              activeTab === 'registrations'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
            }`}
          >
            {isEn ? 'Merchant Registrations' : 'Pendaftaran Peniaga'} ({searchTerm ? `${filteredRegistrations.length}/${realMerchants.length}` : realMerchants.length})
          </button>

          {/* TAB 3: AGENT REGISTRATIONS */}
          <button
            onClick={() => setActiveTab('agents')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap rounded-xl font-bold text-xs tracking-wider transition-all border ${
              activeTab === 'agents'
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/25'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
            }`}
          >
            {isEn ? 'Agent Registrations' : 'Pendaftaran Ejen'} ({searchTerm ? `${filteredAgents.length}/${agents.length}` : agents.length})
          </button>

          {/* TAB 4: MERCHANT CHECKLISTS */}
          <button
            onClick={() => setActiveTab('checklists')}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 whitespace-nowrap rounded-xl font-bold text-xs tracking-wider transition-all border ${
              activeTab === 'checklists'
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
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-2.5 sm:p-3 rounded-2xl shadow-sm">
          {/* Search Input Box (Searches across all tabs) */}
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
                  ? 'Search clients, merchants & agents (name, IC, SSM, cuisine, contact, notes, or bank)...'
                  : 'Cari klien, peniaga & ejen (nama, IC, SSM, masakan, no. telefon, catatan, atau bank)...'
              }
              className="w-full pl-10 pr-10 py-2.5 text-base sm:text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
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
          <div className="flex items-center justify-between sm:justify-start gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              className="flex-1 sm:flex-none justify-center px-3.5 py-2.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-300 transition-all flex items-center gap-1.5 shadow-sm"
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
            <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              {activeTab === 'potential'
                ? `${filteredPotential.length} ${isEn ? 'of' : 'daripada'} ${potentialClients.length}`
                : activeTab === 'agents'
                ? `${filteredAgents.length} ${isEn ? 'of' : 'daripada'} ${agents.length}`
                : activeTab === 'registrations'
                ? `${filteredRegistrations.length} ${isEn ? 'of' : 'daripada'} ${realMerchants.length}`
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
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setActiveTab('potential')}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'potential'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-black'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-600'
                }`}
              >
                ★ {isEn ? 'Potential:' : 'Berpotensi:'} {filteredPotential.length}
              </button>
              <button
                onClick={() => setActiveTab('registrations')}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'registrations'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600'
                }`}
              >
                {isEn ? 'Merchants:' : 'Peniaga:'} {filteredRegistrations.length}
              </button>
              <button
                onClick={() => setActiveTab('agents')}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'agents'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-red-600'
                }`}
              >
                {isEn ? 'Agents:' : 'Ejen:'} {filteredAgents.length}
              </button>
              <button
                onClick={() => setActiveTab('checklists')}
                className={`px-3 py-1 rounded-xl font-bold text-xs transition-all ${
                  activeTab === 'checklists'
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
        ) : activeTab === 'potential' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredPotential.length === 0 ? (
              <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                {searchTerm
                  ? (isEn ? 'No potential clients match your search.' : 'Tiada klien berpotensi sepadan dengan carian anda.')
                  : (isEn ? 'No potential clients registered yet. Use the "Potential Clients" form to onboard flexible leads.' : 'Belum ada klien berpotensi didaftarkan. Gunakan borang "Klien Berpotensi" untuk mendaftarkan prospek yang fleksibel.')}
              </div>
            ) : (
              filteredPotential.map((p) => {
                const { completed, total, percent, items } = getCompleteness(p);
                const rawPhone = (p.contactNumber || '').replace(/[^0-9]/g, '');
                const waPhone = rawPhone.startsWith('0') ? '60' + rawPhone.slice(1) : rawPhone;
                const waText = encodeURIComponent(
                  isEn
                    ? `Hello ${p.fullName || ''}, this is Legacy Cuisine following up regarding your store registration (${p.businessName || ''}).`
                    : `Salam ${p.fullName || ''}, kami dari Legacy Cuisine berhubung mengenai pendaftaran kedai anda (${p.businessName || ''}).`
                );

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-[#0d1117] border border-amber-200/80 dark:border-amber-900/40 rounded-2xl p-5 sm:p-6 shadow-sm flex flex-col justify-between space-y-4 text-slate-900 dark:text-slate-100 hover:border-amber-400 dark:hover:border-amber-600 transition-all relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600" />

                    <div>
                      {/* Header Row */}
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                              {p.businessName || p.fullName}
                            </h3>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 flex items-center gap-1">
                              <span>★</span>
                              <span>{isEn ? 'Potential Client' : 'Klien Berpotensi'}</span>
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {isEn ? 'Owner / PIC:' : 'Pemilik / PIC:'} <strong className="text-slate-700 dark:text-slate-200">{p.fullName || 'N/A'}</strong>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                            {p.memberNo || 'POT-LEAD'}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {formatDateToDDMMYYYY(p.createdAt)}
                          </span>
                        </div>
                      </div>

                      {/* Completeness Progress Bar */}
                      <div className="mb-4 bg-amber-50/60 dark:bg-amber-950/20 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/30">
                        <div className="flex items-center justify-between text-xs mb-1.5 font-bold">
                          <span className="text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                            <svg className="w-3.5 h-3.5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{isEn ? 'Profile Completeness' : 'Kelengkapan Profil'}</span>
                          </span>
                          <span className="text-amber-700 dark:text-amber-400 font-mono text-xs">
                            {completed} / {total} ({percent}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              percent === 100
                                ? 'bg-emerald-500'
                                : percent >= 60
                                ? 'bg-amber-500'
                                : 'bg-amber-400'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        {/* Quick Checklist Badges */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {items.map((item, idx) => (
                            <span
                              key={idx}
                              className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold ${
                                item.done
                                  ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}
                            >
                              {item.done ? '✓' : '○'} {item.label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Info Details Box */}
                      <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                        {/* WhatsApp / Phone Row with Direct Chat Button */}
                        <div className="flex items-center justify-between gap-2 pb-1 border-b border-slate-100 dark:border-slate-800">
                          <div>
                            <strong className="text-slate-900 dark:text-white">{isEn ? 'WhatsApp Phone:' : 'Telefon / WhatsApp:'}</strong>{' '}
                            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">{p.contactNumber}</span>
                          </div>
                          {waPhone && (
                            <a
                              href={`https://wa.me/${waPhone}?text=${waText}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition-all"
                            >
                              <span>WhatsApp</span>
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          )}
                        </div>

                        <div>
                          <strong className="text-slate-900 dark:text-white">{isEn ? 'Store Address:' : 'Alamat Premis:'}</strong>{' '}
                          <span className={p.storeAddress ? '' : 'text-slate-400 italic'}>
                            {p.storeAddress || (isEn ? 'Pending / Not provided yet' : 'Belum disediakan')}
                          </span>
                        </div>

                        <div>
                          <strong className="text-slate-900 dark:text-white">{isEn ? 'SSM Number:' : 'No. SSM:'}</strong>{' '}
                          <span className={p.registrationNo ? 'font-mono' : 'text-slate-400 italic'}>
                            {p.registrationNo || (isEn ? 'Optional / Pending' : 'Pilihan / Belum ada')}
                          </span>
                        </div>

                        <div>
                          <strong className="text-slate-900 dark:text-white">{isEn ? 'Bank Account:' : 'Akaun Bank:'}</strong>{' '}
                          <span className={p.bankName ? '' : 'text-slate-400 italic'}>
                            {p.bankName ? `${p.bankName} — ${p.bankAccountNumber || ''} (${p.bankAccountName || p.fullName || ''})` : (isEn ? 'Pending / Not provided yet' : 'Belum disediakan')}
                          </span>
                        </div>

                        {p.operatingHours && (
                          <div>
                            <strong className="text-slate-900 dark:text-white">{isEn ? 'Hours:' : 'Waktu Operasi:'}</strong>{' '}
                            <span>{p.operatingHours} {p.operatingDays ? `(${p.operatingDays})` : ''}</span>
                          </div>
                        )}

                        {/* Discussion Notes / Follow-up Status */}
                        {p.rejectionReason && (
                          <div className="mt-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 block mb-0.5">
                              {isEn ? 'Discussion Notes & Follow-up:' : 'Catatan Perbincangan & Status Susulan:'}
                            </span>
                            <p className="text-slate-700 dark:text-slate-300 italic whitespace-pre-line text-[11px] bg-amber-50/50 dark:bg-amber-950/20 p-2 rounded-lg border border-amber-200/50 dark:border-amber-900/30">
                              {p.rejectionReason}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Bottom Action Buttons Bar */}
                    <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      {/* Left: View Form & Delete */}
                      <div className="flex items-center justify-between sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => setViewingForm({ type: 'merchant', data: p })}
                          className="flex-1 sm:flex-none px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
                          title={isEn ? 'View summary layout' : 'Lihat paparan ringkasan'}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{isEn ? 'View' : 'Lihat'}</span>
                        </button>

                        <button
                          type="button"
                          disabled={deletingId === p.id}
                          onClick={() => handleDeleteMerchant(p)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 text-rose-600 dark:text-rose-400 hover:text-white transition-all disabled:opacity-50 flex items-center justify-center gap-1"
                          title={isEn ? 'Delete potential client' : 'Padam klien berpotensi'}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span className="sm:hidden text-xs font-bold">{isEn ? 'Delete' : 'Padam'}</span>
                        </button>
                      </div>

                      {/* Right: Update Info & Convert Buttons */}
                      <div className="grid grid-cols-2 sm:flex items-center gap-2">
                        {/* UPDATE INFO BUTTON (Day-by-Day) */}
                        <button
                          type="button"
                          onClick={() => setEditingClient({ ...p })}
                          className="w-full sm:w-auto px-3 py-2 sm:py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
                          title={isEn ? 'Update details day-by-day' : 'Kemaskini maklumat dari hari ke hari'}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>{isEn ? 'Update Info' : 'Kemaskini'}</span>
                        </button>

                        {/* CONVERT TO REAL MERCHANT BUTTON */}
                        <button
                          type="button"
                          disabled={convertingId === p.id}
                          onClick={() => handleConvertClient(p)}
                          className="w-full sm:w-auto px-3.5 py-2 sm:py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-600/20 transition-all disabled:opacity-50 text-center"
                          title={isEn ? 'Convert to Official Real Merchant' : 'Tukar kepada Peniaga Rasmi'}
                        >
                          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>
                            {convertingId === p.id
                              ? (isEn ? 'Converting...' : 'Menukar...')
                              : (isEn ? 'Convert' : 'Tukar Rasmi')}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
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

                        {/* DELETE AGENT BUTTON */}
                        <button
                          type="button"
                          disabled={deletingId === a.id}
                          onClick={() => handleDeleteAgent(a)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-700 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 hover:border-rose-600 transition-all disabled:opacity-50"
                          title={isEn ? 'Delete this agent registration' : 'Padam pendaftaran ejen ini'}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>{deletingId === a.id ? (isEn ? 'Deleting...' : 'Memadam...') : (isEn ? 'Delete' : 'Padam')}</span>
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

                      {/* DELETE CHECKLIST BUTTON */}
                      <button
                        type="button"
                        disabled={deletingId === c.id}
                        onClick={() => handleDeleteChecklist(c)}
                        className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-700 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 hover:border-rose-600 transition-all disabled:opacity-50"
                        title={isEn ? 'Delete this checklist' : 'Padam senarai semak ini'}
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>{deletingId === c.id ? (isEn ? 'Deleting...' : 'Memadam...') : (isEn ? 'Delete' : 'Padam')}</span>
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
                      <div className="flex items-center gap-2">
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

                        {/* DELETE MERCHANT REGISTRATION BUTTON */}
                        <button
                          type="button"
                          disabled={deletingId === r.id}
                          onClick={() => handleDeleteMerchant(r)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-700 text-rose-600 dark:text-rose-400 hover:text-white font-bold text-xs flex items-center gap-1.5 border border-rose-200 dark:border-rose-800 hover:border-rose-600 transition-all disabled:opacity-50"
                          title={isEn ? 'Delete this merchant registration' : 'Padam pendaftaran peniaga ini'}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>{deletingId === r.id ? (isEn ? 'Deleting...' : 'Memadam...') : (isEn ? 'Delete' : 'Padam')}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* DAY-BY-DAY POTENTIAL CLIENT UPDATE & ALTER MODAL */}
      {/* ------------------------------------------------------------- */}
      {editingClient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn">
          <div className="max-w-3xl w-full bg-white dark:bg-[#0d1117] border border-amber-300 dark:border-amber-800/60 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 max-h-[94dvh] overflow-y-auto shadow-2xl space-y-5 sm:space-y-6 text-slate-900 dark:text-slate-100">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                    ★ {isEn ? 'POTENTIAL CLIENT UPDATE' : 'KEMASKINI KLIEN BERPOTENSI'}
                  </span>
                  <span className="text-xs font-mono text-slate-400 font-bold">
                    {editingClient.memberNo || 'POT-LEAD'}
                  </span>
                </div>
                <h2 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {editingClient.businessName || editingClient.fullName}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {isEn
                    ? 'Update or alter details day-by-day. Only the 3 core fields are mandatory.'
                    : 'Kemaskini maklumat dari semasa ke semasa. Hanya 3 maklumat teras yang wajib.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all text-sm shrink-0"
              >
                ✕
              </button>
            </div>

            {/* Modal Form Content */}
            <div className="space-y-4 sm:space-y-6">
              {/* Section 1: Core 3 Requirements */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-800/50 space-y-3.5 sm:space-y-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-400">
                  <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0"></span>
                  <span>{isEn ? '1. Core Requirements (Mandatory)' : '1. Maklumat Asas (Wajib Diisi)'}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Store / Business Name *' : 'Nama Kedai / Syarikat *'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.businessName || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, businessName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Merchant / Owner Full Name *' : 'Nama Penuh Peniaga / Pemilik *'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.fullName || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, fullName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Phone Number (WhatsApp) *' : 'Nombor Telefon (WhatsApp) *'}
                    </label>
                    <input
                      type="tel"
                      value={editingClient.contactNumber || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, contactNumber: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs font-mono font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Discussion / Follow-up Notes (Day-by-Day log) */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    <span>{isEn ? '2. Discussion Notes & Follow-up Status' : '2. Catatan Perbincangan & Status Susulan'}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {isEn ? 'Log meetings, owner discussions, objections' : 'Catat perjumpaan, bincang pemilik, dsb'}
                  </span>
                </div>
                <textarea
                  rows={3}
                  value={editingClient.rejectionReason || ''}
                  onChange={(e) => setEditingClient({ ...editingClient, rejectionReason: e.target.value })}
                  placeholder={
                    isEn
                      ? 'e.g. Owner interested, discussed on Monday. Waiting for partner agreement on POS setup...'
                      : 'cth: Pemilik berminat, jumpa hari Isnin. Menunggu kelulusan rakan kongsi untuk sistem POS...'
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Section 3: Premise & Contact (Optional) */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isEn ? '3. Premise & Contact Details (Optional)' : '3. Maklumat Premis & Maklumat Perhubungan (Pilihan)'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Store / Premise Address' : 'Alamat Premis Kedai'}
                    </label>
                    <textarea
                      rows={2}
                      value={editingClient.storeAddress || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, storeAddress: e.target.value })}
                      placeholder={isEn ? 'No. 12, Jalan Komersial...' : 'No. 12, Jalan Komersial...'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Email Address' : 'Alamat Emel'}
                    </label>
                    <input
                      type="email"
                      value={editingClient.emailAddress || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, emailAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Mailing / Alternate Address' : 'Alamat Surat-Menyurat'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.mailingAddress || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, mailingAddress: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Registration & Identity (Optional) */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isEn ? '4. Business Registration & Identity (Optional)' : '4. Pendaftaran Perniagaan & Pengenalan (Pilihan)'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'SSM Registration No (Optional)' : 'No. Pendaftaran SSM (Pilihan)'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.registrationNo || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, registrationNo: e.target.value })}
                      placeholder="e.g. 202301029384 (1519307-X)"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'IC / Passport No (Optional)' : 'No. Kad Pengenalan / Pasport (Pilihan)'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.icPassportNo || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, icPassportNo: e.target.value })}
                      placeholder="e.g. 880101-14-5566"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Operations (Optional) */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isEn ? '5. Operations & Cuisine (Optional)' : '5. Operasi & Jenis Masakan (Pilihan)'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Food / Cuisine Type' : 'Jenis Masakan / Makanan'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.typeOfFood || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, typeOfFood: e.target.value })}
                      placeholder={isEn ? 'e.g. Malay Cuisine' : 'cth: Masakan Melayu'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Operating Days' : 'Hari Operasi'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.operatingDays || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, operatingDays: e.target.value })}
                      placeholder={isEn ? 'e.g. Mon - Sat' : 'cth: Isnin - Sabtu'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Operating Hours' : 'Waktu Operasi'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.operatingHours || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, operatingHours: e.target.value })}
                      placeholder="e.g. 10:00 AM - 10:00 PM"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 6: Bank Account (Optional) */}
              <div className="p-3.5 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3.5 sm:space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  {isEn ? '6. Bank Account Details (Optional)' : '6. Maklumat Akaun Bank (Pilihan)'}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Bank Name' : 'Nama Bank'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.bankName || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, bankName: e.target.value })}
                      placeholder="Maybank / CIMB / Bank Islam"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Account Number' : 'Nombor Akaun'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.bankAccountNumber || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, bankAccountNumber: e.target.value })}
                      placeholder="e.g. 164010293847"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold mb-1 text-slate-900 dark:text-slate-100">
                      {isEn ? 'Account Holder Name' : 'Nama Pemegang Akaun'}
                    </label>
                    <input
                      type="text"
                      value={editingClient.bankAccountName || ''}
                      onChange={(e) => setEditingClient({ ...editingClient, bankAccountName: e.target.value })}
                      placeholder={editingClient.fullName || 'Name as in bank'}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-base sm:text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
              <button
                type="button"
                onClick={() => setEditingClient(null)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all text-center"
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
                {/* Convert Button in Modal */}
                <button
                  type="button"
                  disabled={isSavingEdit || convertingId === editingClient.id}
                  onClick={() => handleConvertClient(editingClient)}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-extrabold text-xs shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-center"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>
                    {convertingId === editingClient.id
                      ? (isEn ? 'Converting...' : 'Menukar...')
                      : (isEn ? 'Convert to Real Merchant' : 'Tukar ke Peniaga Rasmi')}
                  </span>
                </button>

                {/* Save Changes Button */}
                <button
                  type="button"
                  disabled={isSavingEdit}
                  onClick={handleSaveEdit}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-center"
                >
                  <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span>
                    {isSavingEdit ? (isEn ? 'Saving...' : 'Menyimpan...') : (isEn ? 'Save Changes' : 'Simpan Perubahan')}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* OFFICIAL FORM VIEWING MODAL (AGENT, MERCHANT, OR CHECKLIST) */}
      {/* ------------------------------------------------------------- */}
      {viewingForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/75 backdrop-blur-sm overflow-y-auto animate-fadeIn print-modal-overlay print:static print:inset-auto print:p-0 print:m-0 print:bg-white print:overflow-visible">
          <div className="max-w-4xl w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl p-3.5 sm:p-8 max-h-[92dvh] overflow-y-auto shadow-2xl space-y-5 sm:space-y-6 text-slate-900 dark:text-slate-100 print-modal-card printable-card print:border-none print:shadow-none print:p-0 print:m-0 print:rounded-none print:max-w-none print:max-h-none print:overflow-visible">

            {/* Modal Top Bar (On-screen controls only, hidden on paper) */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 sm:pb-4 print:hidden">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2.5 sm:px-3 py-1 text-white font-extrabold text-[11px] sm:text-xs tracking-wider rounded-lg uppercase ${
                  viewingForm.type === 'merchant' && (viewingForm.data.status || '').toLowerCase() === 'potential'
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-red-600'
                }`}>
                  {viewingForm.type === 'agent'
                    ? (isEn ? 'AGENT REGISTRATION' : 'PENDAFTARAN EJEN')
                    : viewingForm.type === 'merchant'
                      ? ((viewingForm.data.status || '').toLowerCase() === 'potential'
                          ? (isEn ? '★ POTENTIAL CLIENT PROFILE' : '★ PROFAIL KLIEN BERPOTENSI')
                          : (isEn ? 'MERCHANT REGISTRATION' : 'PENDAFTARAN PENIAGA'))
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
                              : docKey === 'ssm' ? (isEn ? 'SSM (Optional)' : 'SSM (Pilihan)')
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

