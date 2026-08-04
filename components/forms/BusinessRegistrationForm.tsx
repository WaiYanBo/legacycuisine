'use client';

import React, { useState } from 'react';
import { getDictionary, Locale } from '../../lib/i18n';

interface BusinessRegistrationFormProps {
  lang: Locale;
}

export default function BusinessRegistrationForm({ lang = 'en' }: BusinessRegistrationFormProps) {
  const dict = getDictionary(lang).registration;

  const [formData, setFormData] = useState({
    businessName: '',
    personInCharge: '',
    typeOfFood: '',
    emailAddress: '',
    contactNumber: '',
    storeAddress: '',
  });

  const [shopPhotoUrl, setShopPhotoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(lang === 'ms' ? 'Sila muat naik fail imej yang sah (JPG, PNG, WEBP).' : 'Please upload a valid image file (JPG, PNG, WEBP).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setShopPhotoUrl(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      alert(lang === 'ms' ? 'Gagal membaca fail imej.' : 'Failed to read image file.');
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setStatusMessage(null);

    if (!shopPhotoUrl) {
      setStatusMessage({ type: 'error', text: dict.photoRequiredError });
      setSubmitting(false);
      return;
    }

    try {
      const payload = {
        ...formData,
        shopPhotoUrl,
        language: lang.toUpperCase(),
      };

      const res = await fetch('/api/forms/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit business registration.');

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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Brand Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 mb-8 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider mb-3">
            {lang.toUpperCase()} • {dict.badge}
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {dict.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {dict.subtitle}
          </p>
        </div>

        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-2xl shadow-lg shadow-amber-500/20 shrink-0">
          LC
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl mb-6 font-medium text-sm flex items-center justify-between shadow-lg ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border border-emerald-500/50 text-emerald-300'
              : 'bg-rose-950/80 border border-rose-500/50 text-rose-300'
          }`}
        >
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-xs underline opacity-70 hover:opacity-100">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl space-y-8">
        <h2 className="text-xl font-bold text-amber-400 border-b border-slate-800 pb-3 flex items-center gap-2">
          {dict.sectionHeader}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.businessName}
              </label>
              <input
                type="text"
                name="businessName"
                value={formData.businessName}
                onChange={handleInputChange}
                required
                placeholder={dict.fields.businessNamePlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.personInCharge}
              </label>
              <input
                type="text"
                name="personInCharge"
                value={formData.personInCharge}
                onChange={handleInputChange}
                required
                placeholder={dict.fields.personInChargePlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.typeOfFood}
              </label>
              <input
                type="text"
                name="typeOfFood"
                value={formData.typeOfFood}
                onChange={handleInputChange}
                required
                placeholder={dict.fields.typeOfFoodPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.emailAddress}
              </label>
              <input
                type="email"
                name="emailAddress"
                value={formData.emailAddress}
                onChange={handleInputChange}
                required
                placeholder={dict.fields.emailAddressPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.contactNumber}
              </label>
              <input
                type="text"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleInputChange}
                required
                placeholder={dict.fields.contactNumberPlaceholder}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-100 focus:outline-none focus:border-amber-500 transition-colors"
              />
            </div>
          </div>

          {/* Shop Photo Upload Column */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {dict.fields.shopPhoto}
              </label>

              <div className="relative border-2 border-dashed border-slate-800 rounded-2xl p-6 text-center bg-slate-950/60 hover:border-amber-500/50 transition-colors flex flex-col items-center justify-center min-h-[220px]">
                {shopPhotoUrl ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                    <img src={shopPhotoUrl} alt="Shop Frontage" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-amber-500 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs">
                        {dict.changePhoto}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center mb-3 text-2xl font-bold">
                      +
                    </div>
                    <div className="text-sm font-bold text-slate-200 uppercase tracking-wide">
                      {dict.uploadTitle}
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      {isUploading ? dict.uploadProcessing : dict.uploadSubtitle}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            {/* Photo Guidance Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                i
              </div>
              <div className="text-xs text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-200">{dict.photoGuidanceTitle}</span> {dict.photoGuidanceBody}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
            {dict.fields.storeAddress}
          </label>
          <textarea
            rows={3}
            name="storeAddress"
            value={formData.storeAddress}
            onChange={handleInputChange}
            required
            placeholder={dict.fields.storeAddressPlaceholder}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-100 text-sm focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Form Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800 text-xs text-slate-400">
          <div>{dict.requiredNote}</div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50"
          >
            {submitting ? dict.submittingBtn : dict.submitBtn}
          </button>
        </div>
      </form>
    </div>
  );
}
