'use client';

import React, { useEffect, useState } from 'react';
import { getDictionary, Locale } from '../../lib/i18n';

interface SubmissionsViewerProps {
  lang: Locale;
}

export default function SubmissionsViewer({ lang = 'en' }: SubmissionsViewerProps) {
  const dict = getDictionary(lang).submissions;

  const [activeTab, setActiveTab] = useState<'checklists' | 'registrations'>('checklists');
  const [checklists, setChecklists] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const [cRes, rRes] = await Promise.all([
        fetch('/api/forms/checklist'),
        fetch('/api/forms/registration'),
      ]);
      const cJson = await cRes.json();
      const rJson = await rRes.json();

      if (cJson.success) setChecklists(cJson.data);
      if (rJson.success) setRegistrations(rJson.data);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Title Header */}
      <div className="bg-white dark:bg-black border border-[#b0712d] rounded-2xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-black dark:text-white">
        <div>
          <h1 className="text-3xl font-extrabold text-black dark:text-white">{dict.title}</h1>
          <p className="text-[#b0712d] text-sm mt-1">
            {dict.subtitle}
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 bg-[#aa0505] hover:bg-[#b0712d] text-white rounded-xl font-bold text-xs border border-[#b0712d] transition-colors"
        >
          {dict.refreshBtn}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('checklists')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all border ${
            activeTab === 'checklists'
              ? 'bg-[#aa0505] text-white border-[#b0712d] shadow-md'
              : 'bg-white dark:bg-black text-black dark:text-white border-[#b0712d] hover:text-[#b0712d]'
          }`}
        >
          {dict.checklistsTab} ({checklists.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all border ${
            activeTab === 'registrations'
              ? 'bg-[#aa0505] text-white border-[#b0712d] shadow-md'
              : 'bg-white dark:bg-black text-black dark:text-white border-[#b0712d] hover:text-[#b0712d]'
          }`}
        >
          {dict.registrationsTab} ({registrations.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-black border border-[#b0712d] rounded-2xl p-12 text-center text-[#b0712d] text-sm">
          {dict.loading}
        </div>
      ) : activeTab === 'checklists' ? (
        <div className="space-y-4">
          {checklists.length === 0 ? (
            <div className="bg-white dark:bg-black border border-[#b0712d] rounded-2xl p-12 text-center text-[#b0712d] text-sm">
              {dict.emptyChecklists}
            </div>
          ) : (
            checklists.map((c) => (
              <div key={c.id} className="bg-white dark:bg-black border border-[#b0712d] rounded-2xl p-6 shadow-md transition-colors text-black dark:text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#b0712d]/50 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-black dark:text-white">{c.merchant || c.vendor}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#b0712d]/15 text-[#b0712d] border border-[#b0712d] text-[10px] font-bold uppercase">
                        {c.language}
                      </span>
                    </div>
                    <div className="text-xs text-[#b0712d] mt-1">
                      PIC: {c.personInCharge} • Email: {c.emailAddress} • Mobile: {c.mobileNumber || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-white dark:bg-black px-3 py-1.5 rounded-lg border border-[#b0712d]">
                      <span className="text-[#b0712d]">Agent:</span> <strong className="text-black dark:text-white">{c.agentName}</strong>
                    </div>
                    <div className="bg-[#aa0505]/15 px-3 py-1.5 rounded-lg border border-[#aa0505] text-[#aa0505] font-bold">
                      Score: {c.yesScore} / 20 YES
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-[#b0712d]">
                  <div><strong className="text-black dark:text-white">Platform:</strong> {c.targetPlatform}</div>
                  <div><strong className="text-black dark:text-white">Outlets:</strong> {c.numberOfOutlets}</div>
                  <div><strong className="text-black dark:text-white">Type:</strong> {c.businessType}</div>
                  <div><strong className="text-black dark:text-white">Submitted:</strong> {new Date(c.createdAt).toLocaleDateString('en-GB')}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.length === 0 ? (
            <div className="md:col-span-2 bg-white dark:bg-black border border-[#b0712d] rounded-2xl p-12 text-center text-[#b0712d] text-sm">
              {dict.emptyRegistrations}
            </div>
          ) : (
            registrations.map((r) => (
              <div key={r.id} className="bg-white dark:bg-black border border-[#b0712d] rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4 text-black dark:text-white">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-black dark:text-white">{r.businessName || r.fullName}</h3>
                      {r.registrationNo && (
                        <div className="text-[11px] text-[#b0712d]">SSM: {r.registrationNo}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        r.status === 'Diluluskan'
                          ? 'bg-[#b0712d]/15 text-black dark:text-white border-[#b0712d]'
                          : r.status === 'Ditolak'
                          ? 'bg-[#aa0505]/15 text-[#aa0505] border-[#aa0505]'
                          : 'bg-[#b0712d]/15 text-[#b0712d] border-[#b0712d]'
                      }`}>
                        {r.status || 'Dalam Proses'}
                      </span>
                      <span className="text-[10px] text-[#b0712d]">No. Ahli: {r.memberNo || 'N/A'}</span>
                    </div>
                  </div>

                  {r.shopPhotoUrl && (
                    <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-[#b0712d]">
                      <img src={r.shopPhotoUrl} alt={r.businessName} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-black dark:text-white bg-white dark:bg-black p-4 rounded-xl border border-[#b0712d]">
                    <div><strong className="text-[#b0712d]">Nama Penuh:</strong> {r.fullName || r.personInCharge}</div>
                    <div><strong className="text-[#b0712d]">No. IC / Pasport:</strong> {r.icPassportNo || 'N/A'}</div>
                    <div><strong className="text-[#b0712d]">Contact / Phone:</strong> {r.contactNumber}</div>
                    <div><strong className="text-[#b0712d]">Email:</strong> {r.emailAddress}</div>
                    <div><strong className="text-[#b0712d]">Alamat Premis:</strong> {r.storeAddress}</div>
                    {r.bankName && (
                      <div><strong className="text-[#b0712d]">Bank:</strong> {r.bankName} — {r.bankAccountNumber} ({r.bankAccountName})</div>
                    )}
                    {r.operatingHours && (
                      <div><strong className="text-[#b0712d]">Waktu Operasi:</strong> {r.operatingHours}</div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-[#b0712d] pt-3 border-t border-[#b0712d] flex justify-between">
                  <span>Merchant ID: {r.id.slice(0, 8)}...</span>
                  <span>{new Date(r.createdAt).toLocaleString('en-GB')}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
