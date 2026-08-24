'use client';

import React, { useState } from 'react';
import { getDictionary, Locale } from '../../lib/i18n';

interface MerchantChecklistFormProps {
  lang: Locale;
}

export default function MerchantChecklistForm({ lang = 'en' }: MerchantChecklistFormProps) {
  const dict = getDictionary(lang).checklist;

  // Header form state
  const [formData, setFormData] = useState({
    agentName: '',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    personInCharge: '',
    mobileNumber: '',
    emailAddress: '',
    outletAddress: '',
    numberOfOutlets: 1,
    businessType: lang === 'ms' ? 'Kedai' : 'Shop',
    targetPlatform: 'Foodpanda / GrabFood / ShopeeFood',
    leadStatus: lang === 'ms' ? 'Berminat' : 'Interested',
  });

  // Section 1 response state
  const [selfCheck, setSelfCheck] = useState<Record<string, 'YES' | 'NO' | 'NA'>>({});
  const [agentNotes, setAgentNotes] = useState('');

  // Section 2 response state
  const [qualification, setQualification] = useState<Record<string, 'YES' | 'NO' | 'NA'>>({});

  // Submission UI state
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Score Calculations
  const yesScore = Object.values(qualification).filter((val) => val === 'YES').length;
  const noScore = Object.values(qualification).filter((val) => val === 'NO').length;
  const naScore = Object.values(qualification).filter((val) => val === 'NA').length;
  const totalChecked = Object.keys(qualification).length;

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelfCheckChange = (id: string, val: 'YES' | 'NO' | 'NA') => {
    setSelfCheck((prev) => ({ ...prev, [id]: val }));
  };

  const handleQualificationChange = (id: string, val: 'YES' | 'NO' | 'NA') => {
    setQualification((prev) => ({ ...prev, [id]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    try {
      const payload = {
        ...formData,
        language: lang.toUpperCase(),
        agentSelfCheck: selfCheck,
        agentNotes,
        qualificationCheck: qualification,
        yesScore,
        noScore,
        naScore,
        totalChecked,
      };

      const res = await fetch('/api/forms/checklist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit checklist.');

      setStatusMessage({
        type: 'success',
        text: dict.successMsg,
      });

      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error submitting form.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 print:p-0 print:border-none print:shadow-none printable-card">
      {/* Title Header Card */}
      <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 mb-8 shadow-md">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-red-600 text-white text-xs font-extrabold uppercase tracking-wider">
              {lang.toUpperCase()} • {dict.badge}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-red-300 transition-all flex items-center gap-1.5 shadow-sm print:hidden"
            >
              <span>🖨️</span>
              <span>{lang === 'ms' ? 'Cetak Borang' : 'Print Form'}</span>
            </button>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            {dict.title}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base max-w-3xl">
            {dict.subtitle}
          </p>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl mb-6 font-medium text-sm flex items-center justify-between shadow-md print:hidden ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200'
              : 'bg-red-50 dark:bg-red-950/80 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline opacity-70 hover:opacity-100 font-bold">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Purpose Notice */}
        <div className="bg-red-50/60 dark:bg-red-950/30 border border-red-200 dark:border-red-900 rounded-2xl p-4 text-xs text-red-900 dark:text-red-200 leading-relaxed">
          <span className="font-bold text-red-700 dark:text-red-400">{dict.purposeNoticeTitle}</span> {dict.purposeNoticeBody}
        </div>

        {/* Section 0: Merchant & Agent Details */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 dark:text-slate-100">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
            {dict.sectionHeader}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.agentName}
              </label>
              <input
                type="text"
                name="agentName"
                value={formData.agentName}
                onChange={handleHeaderChange}
                required
                placeholder={dict.fields.agentNamePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.date}
              </label>
              <input
                type="date"
                lang="en-GB"
                placeholder="dd/mm/yyyy"
                name="date"
                value={formData.date}
                onChange={handleHeaderChange}
                required
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.merchant || dict.fields.vendor || 'Merchant Name'}
              </label>
              <input
                type="text"
                name="merchant"
                value={formData.merchant}
                onChange={handleHeaderChange}
                required
                placeholder={dict.fields.merchantPlaceholder || dict.fields.vendorPlaceholder || 'e.g., ABC Restaurant'}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.personInCharge}
              </label>
              <input
                type="text"
                name="personInCharge"
                value={formData.personInCharge}
                onChange={handleHeaderChange}
                required
                placeholder={dict.fields.personInChargePlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.mobileNumber}
              </label>
              <input
                type="text"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleHeaderChange}
                placeholder={dict.fields.mobileNumberPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.emailAddress}
              </label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleHeaderChange}
                required
                placeholder={dict.fields.emailAddressPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.outletAddress}
              </label>
              <input
                type="text"
                name="outletAddress"
                value={formData.outletAddress}
                onChange={handleHeaderChange}
                placeholder={dict.fields.outletAddressPlaceholder}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.numberOfOutlets}
              </label>
              <input
                type="number"
                min="1"
                name="numberOfOutlets"
                value={formData.numberOfOutlets}
                onChange={handleHeaderChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.businessType}
              </label>
              <select
                name="businessType"
                value={formData.businessType}
                onChange={handleHeaderChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              >
                <option value={lang === 'ms' ? 'Kedai' : 'Shop'}>{lang === 'ms' ? 'Kedai' : 'Shop'}</option>
                <option value="Kiosk">Kiosk</option>
                <option value={lang === 'ms' ? 'Trak Makanan' : 'Food Truck'}>{lang === 'ms' ? 'Trak Makanan' : 'Food Truck'}</option>
                <option value={lang === 'ms' ? 'Dari Rumah' : 'Home-Based'}>{lang === 'ms' ? 'Dari Rumah' : 'Home-Based'}</option>
                <option value="Mart">Mart</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.targetPlatform}
              </label>
              <select
                name="targetPlatform"
                value={formData.targetPlatform}
                onChange={handleHeaderChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              >
                <option value="Foodpanda / GrabFood / ShopeeFood">Foodpanda / GrabFood / ShopeeFood</option>
                <option value="GrabFood Only">GrabFood</option>
                <option value="Foodpanda Only">Foodpanda</option>
                <option value="ShopeeFood Only">ShopeeFood</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.leadStatus}
              </label>
              <select
                name="leadStatus"
                value={formData.leadStatus}
                onChange={handleHeaderChange}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
              >
                <option value={lang === 'ms' ? 'Berminat' : 'Interested'}>{lang === 'ms' ? 'Berminat' : 'Interested'}</option>
                <option value={lang === 'ms' ? 'Dalam Pertimbangan' : 'Keep In View'}>{lang === 'ms' ? 'Dalam Pertimbangan' : 'Keep In View'}</option>
                <option value={lang === 'ms' ? 'Perlu Disahkan' : 'To Be Confirmed'}>{lang === 'ms' ? 'Perlu Disahkan' : 'To Be Confirmed'}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 1: Agent Self-Check */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 dark:text-slate-100">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {dict.section1Title}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
            {dict.section1Subtitle}
          </p>

          <div className="space-y-4">
            {dict.selfCheckItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {idx + 1}. {item.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  {(['YES', 'NO', 'NA'] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selfCheck[item.id] === opt
                          ? opt === 'YES'
                            ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold shadow-sm'
                            : opt === 'NO'
                            ? 'bg-red-600 border-red-600 text-white font-extrabold shadow-sm'
                            : 'bg-slate-800 border-slate-800 text-white font-extrabold shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`selfcheck_${item.id}`}
                        value={opt}
                        checked={selfCheck[item.id] === opt}
                        onChange={() => handleSelfCheckChange(item.id, opt)}
                        className="hidden"
                      />
                      {opt === 'YES' ? (lang === 'ms' ? 'YA' : 'YES') : opt === 'NO' ? (lang === 'ms' ? 'TIDAK' : 'NO') : 'N/A'}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {dict.agentNotesLabel}
            </label>
            <textarea
              rows={3}
              value={agentNotes}
              onChange={(e) => setAgentNotes(e.target.value)}
              placeholder={dict.agentNotesPlaceholder}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl p-3 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-colors"
            />
          </div>
        </div>

        {/* Section 2: Merchant Qualification Interview */}
        <div className="bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-sm text-slate-900 dark:text-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                {dict.section2Title}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {dict.section2Subtitle}
              </p>
            </div>

            {/* Score Counter */}
            <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-semibold">
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">{dict.yesScore}: {yesScore} / 20</span>
              <span className="text-red-600 dark:text-red-400">{dict.noScore}: {noScore}</span>
              <span className="text-slate-500 dark:text-slate-400">{dict.naScore}: {naScore}</span>
            </div>
          </div>

          <div className="space-y-4">
            {dict.qualificationItems.map((item, idx) => (
              <div
                key={item.id}
                className="bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
              >
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 dark:text-white">
                    {idx + 1}. {item.title}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  {(['YES', 'NO', 'NA'] as const).map((opt) => (
                    <label
                      key={opt}
                      className={`cursor-pointer px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        qualification[item.id] === opt
                          ? opt === 'YES'
                            ? 'bg-emerald-600 border-emerald-600 text-white font-extrabold shadow-sm'
                            : opt === 'NO'
                            ? 'bg-red-600 border-red-600 text-white font-extrabold shadow-sm'
                            : 'bg-slate-800 border-slate-800 text-white font-extrabold shadow-sm'
                          : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`qual_${item.id}`}
                        value={opt}
                        checked={qualification[item.id] === opt}
                        onChange={() => handleQualificationChange(item.id, opt)}
                        className="hidden"
                      />
                      {opt === 'YES' ? (lang === 'ms' ? 'YA' : 'YES') : opt === 'NO' ? (lang === 'ms' ? 'TIDAK' : 'NO') : 'N/A'}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Final Score Banner */}
          <div className="mt-8 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {dict.scoreCountTitle}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {totalChecked} {dict.scoreCountSubtitle}
              </div>
            </div>
            <div className="flex items-center gap-6 text-center">
              <div>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{yesScore} / 20</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{dict.yesScore}</div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div>
                <div className="text-2xl font-black text-red-600 dark:text-red-400">{noScore}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{dict.noScore}</div>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800" />
              <div>
                <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{naScore}</div>
                <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">{dict.naScore}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4 print:hidden">
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-extrabold text-sm rounded-2xl shadow-xl shadow-red-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {submitting ? dict.submittingBtn : dict.submitBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
