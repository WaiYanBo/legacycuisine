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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white">{dict.title}</h1>
          <p className="text-slate-400 text-sm mt-1">
            {dict.subtitle}
          </p>
        </div>
        <button
          onClick={fetchSubmissions}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-xl font-bold text-xs border border-slate-700 transition-colors"
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
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          {dict.checklistsTab} ({checklists.length})
        </button>
        <button
          onClick={() => setActiveTab('registrations')}
          className={`px-5 py-2.5 rounded-xl font-bold text-xs tracking-wider transition-all border ${
            activeTab === 'registrations'
              ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
          }`}
        >
          {dict.registrationsTab} ({registrations.length})
        </button>
      </div>

      {loading ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-400 text-sm">
          {dict.loading}
        </div>
      ) : activeTab === 'checklists' ? (
        <div className="space-y-4">
          {checklists.length === 0 ? (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
              {dict.emptyChecklists}
            </div>
          ) : (
            checklists.map((c) => (
              <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md hover:border-slate-700 transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-white">{c.vendor}</span>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold uppercase">
                        {c.language}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      PIC: {c.personInCharge} • Email: {c.emailAddress} • Mobile: {c.mobileNumber || 'N/A'}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <span className="text-slate-400">Agent:</span> <strong className="text-white">{c.agentName}</strong>
                    </div>
                    <div className="bg-emerald-950/60 px-3 py-1.5 rounded-lg border border-emerald-500/30 text-emerald-400 font-bold">
                      Score: {c.yesScore} / 20 YES
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs text-slate-400">
                  <div><strong className="text-slate-300">Platform:</strong> {c.targetPlatform}</div>
                  <div><strong className="text-slate-300">Outlets:</strong> {c.numberOfOutlets}</div>
                  <div><strong className="text-slate-300">Type:</strong> {c.businessType}</div>
                  <div><strong className="text-slate-300">Submitted:</strong> {new Date(c.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {registrations.length === 0 ? (
            <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-sm">
              {dict.emptyRegistrations}
            </div>
          ) : (
            registrations.map((r) => (
              <div key={r.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="text-xl font-bold text-white">{r.businessName}</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-amber-400 text-[10px] font-bold uppercase">
                      {r.language}
                    </span>
                  </div>
                  <div className="text-xs text-amber-400 font-medium mb-3">{r.typeOfFood}</div>

                  {r.shopPhotoUrl && (
                    <div className="w-full h-44 rounded-xl overflow-hidden mb-4 border border-slate-800">
                      <img src={r.shopPhotoUrl} alt={r.businessName} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-slate-300">
                    <div><strong className="text-slate-400">PIC:</strong> {r.personInCharge}</div>
                    <div><strong className="text-slate-400">Contact:</strong> {r.contactNumber}</div>
                    <div><strong className="text-slate-400">Email:</strong> {r.emailAddress}</div>
                    <div><strong className="text-slate-400">Address:</strong> {r.storeAddress}</div>
                  </div>
                </div>

                <div className="text-[11px] text-slate-500 pt-3 border-t border-slate-800 flex justify-between">
                  <span>ID: {r.id.slice(0, 8)}...</span>
                  <span>{new Date(r.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
