'use client';

import React, { useEffect, useState } from 'react';
import { getDictionary, Locale } from '../../lib/i18n';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';

interface SubmissionsViewerProps {
  lang: Locale;
}

export default function SubmissionsViewer({ lang = 'en' }: SubmissionsViewerProps) {
  const dict = getDictionary(lang).submissions;

  const [activeTab, setActiveTab] = useState<'agents' | 'registrations' | 'checklists'>('agents');
  const [agents, setAgents] = useState<any[]>([]);
  const [checklists, setChecklists] = useState<any[]>([]);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

      if (aJson.success) setAgents(aJson.data || []);
      if (cJson.success) setChecklists(cJson.data || []);
      if (rJson.success) setRegistrations(rJson.data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-2 sm:px-4 py-4">
      {/* Title Header Card */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-slate-900 dark:text-slate-100">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{dict.title}</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
            {dict.subtitle}
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-bold text-xs shadow-md shadow-red-600/25 transition-all flex items-center justify-center gap-2 self-start sm:self-auto"
        >
          <span>🔄</span>
          <span>{dict.refreshBtn}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 mb-6">
        <button
          onClick={() => setActiveTab('agents')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all border ${
            activeTab === 'agents'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
          }`}
        >
          {dict.agentsTab || 'Agent Registrations'} ({agents.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all border ${
            activeTab === 'registrations'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
          }`}
        >
          {dict.registrationsTab} ({registrations.length})
        </button>
        <button
          onClick={() => setActiveTab('checklists')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all border ${
            activeTab === 'checklists'
              ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-600 shadow-md shadow-red-600/25'
              : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-700 dark:hover:text-red-400'
          }`}
        >
          {dict.checklistsTab} ({checklists.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
          {dict.loading}
        </div>
      ) : activeTab === 'agents' ? (
        <div className="space-y-4">
          {agents.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              {dict.emptyAgents || 'No agent registration records found yet.'}
            </div>
          ) : (
            agents.map((a) => {
              let parsedMerchants: any[] = [];
              try {
                parsedMerchants = typeof a.registeredMerchants === 'string' ? JSON.parse(a.registeredMerchants) : (a.registeredMerchants || []);
              } catch (e) {}

              return (
                <div key={a.id} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm text-slate-900 dark:text-slate-100">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl font-black text-slate-900 dark:text-white">{a.agentName}</span>
                        <span className="px-2.5 py-0.5 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/50 text-[10px] font-bold tracking-wider">
                          NO: {a.agentNo}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        IC: {a.icNumber} • Tel: {a.phoneNumber} • {a.race || 'Melayu'} ({a.religion || 'Islam'})
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Tarikh:</span> <strong className="text-slate-900 dark:text-white">{formatDateToDDMMYYYY(a.date || a.createdAt)}</strong>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                        <span className="text-slate-500 dark:text-slate-400">Penyelia:</span> <strong className="text-slate-900 dark:text-white">{a.supervisorName || 'Pengurusan'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div><strong className="text-slate-900 dark:text-white">Alamat:</strong> <span className="text-slate-600 dark:text-slate-400">{a.address || 'N/A'}</span></div>
                      <div><strong className="text-slate-900 dark:text-white">Perbankan:</strong> <span className="text-slate-600 dark:text-slate-400">{a.bankName || 'N/A'} — {a.bankAccountNumber} ({a.bankAccountName})</span></div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 space-y-1">
                      <div><strong className="text-slate-900 dark:text-white">Sumber Prospek:</strong> <span className="text-slate-600 dark:text-slate-400">{a.prospectSource} {a.prospectSourceOther ? `(${a.prospectSourceOther})` : ''}</span></div>
                      <div><strong className="text-slate-900 dark:text-white">Tahap Keyakinan:</strong> <span className="text-slate-600 dark:text-slate-400">{a.confidenceLevel} • Anggaran: {a.estimatedDuration}</span></div>
                    </div>
                  </div>

                  {parsedMerchants.length > 0 && (
                    <div className="mt-3">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1.5">
                        Senarai Peniaga Didaftarkan ({parsedMerchants.filter((m: any) => m.namaPeniaga).length})
                      </span>
                      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 dark:bg-slate-950 text-slate-700 dark:text-slate-300 font-bold">
                            <tr>
                              <th className="py-2 px-3 w-10 text-center">#</th>
                              <th className="py-2 px-3">Nama Peniaga</th>
                              <th className="py-2 px-3 w-32">Platform</th>
                              <th className="py-2 px-3 w-32">Tarikh (DD/MM/YYYY)</th>
                              <th className="py-2 px-3">Catatan</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                            {parsedMerchants.map((m: any, idx: number) => (
                              <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                                <td className="py-2 px-3 text-center text-slate-400">{m.bil || idx + 1}</td>
                                <td className="py-2 px-3 font-semibold text-slate-900 dark:text-white">{m.namaPeniaga || '-'}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{m.platform || '-'}</td>
                                <td className="py-2 px-3 text-slate-600 dark:text-slate-400">{formatDateToDDMMYYYY(m.tarikhDidaftarkan) || '-'}</td>
                                <td className="py-2 px-3 text-slate-500">{m.catatan || '-'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-400 pt-3 mt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between">
                    <span>ID Ejen: {a.id.slice(0, 8)}...</span>
                    <span>{new Date(a.createdAt).toLocaleString('en-GB')}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : activeTab === 'checklists' ? (
        <div className="space-y-4">
          {checklists.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              {dict.emptyChecklists}
            </div>
          ) : (
            checklists.map((c) => (
              <div key={c.id} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm transition-colors text-slate-900 dark:text-slate-100">
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
                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                      <span className="text-slate-500 dark:text-slate-400">Agent:</span> <strong className="text-slate-900 dark:text-white">{c.agentName}</strong>
                    </div>
                    <div className="bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 font-bold">
                      Score: {c.yesScore} / 20 YES
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <div><strong className="text-slate-900 dark:text-white">Platform:</strong> {c.targetPlatform}</div>
                  <div><strong className="text-slate-900 dark:text-white">Outlets:</strong> {c.numberOfOutlets}</div>
                  <div><strong className="text-slate-900 dark:text-white">Type:</strong> {c.businessType}</div>
                  <div><strong className="text-slate-900 dark:text-white">Submitted:</strong> {formatDateToDDMMYYYY(c.createdAt)}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.length === 0 ? (
            <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center text-slate-500 dark:text-slate-400 text-sm">
              {dict.emptyRegistrations}
            </div>
          ) : (
            registrations.map((r) => (
              <div key={r.id} className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4 text-slate-900 dark:text-slate-100">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{r.businessName || r.fullName}</h3>
                      {r.registrationNo && (
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">SSM: {r.registrationNo}</div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        r.status === 'Diluluskan' || r.status === 'Approved'
                          ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                          : r.status === 'Ditolak' || r.status === 'Rejected'
                          ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}>
                        {r.status || 'Dalam Proses'}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400">No. Ahli: {r.memberNo || 'N/A'}</span>
                    </div>
                  </div>

                  {r.shopPhotoUrl && (
                    <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-slate-200 dark:border-slate-800">
                      <img src={r.shopPhotoUrl} alt={r.businessName} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div><strong className="text-slate-900 dark:text-white">Nama Penuh:</strong> {r.fullName || r.personInCharge}</div>
                    <div><strong className="text-slate-900 dark:text-white">No. IC / Pasport:</strong> {r.icPassportNo || 'N/A'}</div>
                    <div><strong className="text-slate-900 dark:text-white">Contact / Phone:</strong> {r.contactNumber}</div>
                    <div><strong className="text-slate-900 dark:text-white">Email:</strong> {r.emailAddress}</div>
                    <div><strong className="text-slate-900 dark:text-white">Alamat Premis:</strong> {r.storeAddress}</div>
                    {r.bankName && (
                      <div><strong className="text-slate-900 dark:text-white">Bank:</strong> {r.bankName} — {r.bankAccountNumber} ({r.bankAccountName})</div>
                    )}
                    {r.operatingHours && (
                      <div><strong className="text-slate-900 dark:text-white">Waktu Operasi:</strong> {r.operatingHours}</div>
                    )}
                  </div>
                </div>

                <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between">
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

