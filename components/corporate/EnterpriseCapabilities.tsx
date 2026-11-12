'use client';

import React, { useState } from 'react';

interface EnterpriseCapabilitiesProps {
  currentLang?: 'en' | 'ms';
}

export default function EnterpriseCapabilities({ currentLang = 'en' }: EnterpriseCapabilitiesProps) {
  const isEn = currentLang === 'en';
  const [activeTab, setActiveTab] = useState<number>(0);

  const capabilities = [
    {
      code: 'FP-01',
      dept: isEn ? 'Merchant Registration & Fast-Track Activation' : 'Pendaftaran Peniaga & Pengaktifan Pantas',
      headline: isEn
        ? 'Authorised Foodpanda Onboarding & Document Verification'
        : 'Pengaktifan Rasmi Foodpanda & Pengesahan Dokumen',
      scope: isEn
        ? 'As the appointed intermediary, we collect and audit all statutory documents required by Foodpanda (SSM registration, bank statement proofs, owner NRIC, premise health certificates, and Halal status). We guarantee error-free submissions to avoid delays.'
        : 'Sebagai perantara rasmi, kami mengumpul dan mengaudit semua dokumen yang diperlukan Foodpanda (pendaftaran SSM, penyata bank, MyKad pemilik, lesen premis, dan status Halal). Kami menjamin penyerahan bebas ralat bagi mengelakkan kelewatan.',
      deliverables: [
        isEn ? '20-point merchant qualification and readiness audit' : 'Audit kelayakan dan kesediaan peniaga 20-perkara',
        isEn ? 'Fast-track priority Foodpanda account creation SLA < 48 hours' : 'SLA pembukaan akaun Foodpanda keutamaan bawah 48 jam',
        isEn ? 'Direct communication channel with Foodpanda merchant operations' : 'Saluran komunikasi terus dengan operasi peniaga Foodpanda',
        isEn ? 'SSM entity, bank proof and Halal certificate pre-screening' : 'Pra-saringan entiti SSM, bukti akaun bank dan sijil Halal',
      ],
      metrics: isEn ? '48-Hour Target Account Activation' : 'Sasaran Pengaktifan Akaun 48 Jam',
    },
    {
      code: 'FP-02',
      dept: isEn ? 'Menu Digitization & Platform Indexing' : 'Pendigitalan Menu & Kedudukan Platform',
      headline: isEn
        ? 'Foodpanda Menu Formatting & High-Conversion Optimisation'
        : 'Penyusunan Menu Foodpanda & Pengoptimuman Penukaran Jualan',
      scope: isEn
        ? 'A poorly formatted menu causes customer drop-off. We structure your dishes according to Foodpanda’s high-conversion guidelines: category tags, allergen disclosures, combo creation, modifier selections, and appetite-inducing photography styling.'
        : 'Menu yang tidak tersusun menyebabkan pelanggan membatalkan pesanan. Kami menyusun hidangan mengikut garis panduan penukaran tinggi Foodpanda: tag kategori, pilihan kombo, set pilihan, dan penggambaran hidangan yang menyelerakan.',
      deliverables: [
        isEn ? 'Standardized Foodpanda digital menu formatting & pricing structure' : 'Penyusunan format menu digital & struktur harga piawai Foodpanda',
        isEn ? 'Combo, add-on, and modifier optimization to increase average basket size' : 'Pengoptimuman kombo dan pilihan sampingan untuk menaikkan nilai pesanan',
        isEn ? 'High-resolution food image upload conforming to platform guidelines' : 'Muat naik gambar makanan resolusi tinggi mengikut garis panduan platform',
        isEn ? 'Bi-weekly stockout management SOP to safeguard merchant algorithm rank' : 'SOP pengurusan stok dua minggu sekali untuk melindungi ranking algoritma',
      ],
      metrics: isEn ? '+28% Higher Menu Conversion Velocity' : '+28% Peningkatan Penukaran Pesanan Menu',
    },
    {
      code: 'FP-03',
      dept: isEn ? 'Hardware Dispatch & Operational Onboarding' : 'Penyerahan Peranti & Latihan Operasi Di Lokasi',
      headline: isEn
        ? 'Foodpanda Order Tablet Deployment & Staff Kitchen Training'
        : 'Pemasangan Tablet Pesanan Foodpanda & Latihan Dapur Kakitangan',
      scope: isEn
        ? 'Our field onboarding representatives deliver and set up the official Foodpanda order tablet at the merchant’s outlet. We provide hands-on kitchen staff training, print test orders, and configure opening hours and delivery pause controls.'
        : 'Wakil lapangan kami menghantar dan memasang tablet pesanan rasmi Foodpanda di premis peniaga. Kami melatih staf dapur secara praktikal, menguji pesanan, dan mengkonfigurasi waktu operasi serta butang jeda pesanan.',
      deliverables: [
        isEn ? 'Physical delivery and configuration of the Foodpanda merchant terminal' : 'Penyerahan fizikal dan konfigurasi terminal peniaga Foodpanda',
        isEn ? 'Kitchen staff live order acceptance, preparation, and rider handover training' : 'Latihan penerimaan pesanan, penyediaan, dan penyerahan kepada penghantar',
        isEn ? 'Order cancellation prevention SOP to maintain 99%+ fulfillment score' : 'SOP pencegahan pembatalan pesanan bagi mengekalkan skor pemenuhan 99%+',
        isEn ? 'On-site technical troubleshooting and hardware replacement liaison' : 'Penyelesaian masalah teknikal di lokasi dan penggantian perkakasan',
      ],
      metrics: isEn ? '< 1.0% Out-of-Stock Cancellation Rate' : '< 1.0% Kadar Pembatalan Kehabisan Stok',
    },
    {
      code: 'FP-04',
      dept: isEn ? 'Settlement Audit & Weekly Payout Reconciliation' : 'Audit Penyata & Penyesuaian Bayaran Mingguan',
      headline: isEn
        ? 'Automated Foodpanda Remittance Audit & Dispute Recovery'
        : 'Audit Penyata Pembayaran Foodpanda & Tuntutan Wang',
      scope: isEn
        ? 'Foodpanda remits payments weekly, but calculating deductions for promotions, rider delays, cancellations, and statutory SST is complex. Our proprietary ledger matches every POS order with Foodpanda payout records to catch and recover missing payments.'
        : 'Foodpanda membayar peniaga setiap minggu, tetapi mengira potongan promosi, kelewatan penghantar, pesanan dibatalkan, dan SST adalah rumit. Lejar proprietari kami memadankan setiap pesanan POS dengan rekod Foodpanda untuk menuntut bayaran yang tercicir.',
      deliverables: [
        isEn ? 'Weekly automated line-item reconciliation of Foodpanda remittance statements' : 'Penyesuaian automatik baris demi baris penyata bayaran mingguan Foodpanda',
        isEn ? 'Identification and submission of dispute tickets for unjustified deductions' : 'Pengesanan dan penyerahan tiket pertikaian untuk potongan tidak sah',
        isEn ? 'Tax-compliant SST reconciliation and invoice record consolidation' : 'Penyesuaian SST patuh cukai dan penyatuan rekod invois rasmi',
        isEn ? 'Direct merchant finance liaison with Foodpanda finance division' : 'Perhubungan kewangan peniaga terus dengan bahagian kewangan Foodpanda',
      ],
      metrics: isEn ? '99.85% Audit Precision • Zero Leakage' : 'Ketepatan Audit 99.85% • Sifar Ketirisan',
    },
  ];

  return (
    <section id="capabilities" className="bg-slate-900 text-white py-20 sm:py-28 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-slate-800 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-500 block mb-3">
              {isEn ? 'Authorised Agency Scope' : 'Skop Agensi Rasmi'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-white leading-tight sm:leading-snug">
              {isEn
                ? 'Our 4 Core Foodpanda Intermediary Services'
                : '4 Perkhidmatan Utama Perantara Foodpanda Kami'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono tracking-wider shrink-0 uppercase">
            {isEn ? 'Section 02 // Functional Scope' : 'Bahagian 02 // Skop Fungsi'}
          </div>
        </div>

        {/* Corporate Linear Capability List (NO CARDS - Sleek Horizontal Rows) */}
        <div className="divide-y divide-slate-800 mt-6">
          {capabilities.map((cap, index) => {
            const isSelected = activeTab === index;

            return (
              <div
                key={cap.code}
                className={`py-8 sm:py-10 transition-colors ${
                  isSelected ? 'bg-slate-950/60 -mx-4 px-4 sm:-mx-8 sm:px-8 border-l-2 border-l-red-600' : 'hover:bg-slate-850/30'
                }`}
              >
                {/* Row Header & Trigger */}
                <div
                  onClick={() => setActiveTab(isSelected ? -1 : index)}
                  className="cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                    <span className="text-red-500 font-mono text-xs sm:text-sm font-bold tracking-widest bg-red-950/80 px-2.5 py-1 border border-red-800/40 shrink-0">
                      {cap.code}
                    </span>
                    <div>
                      <div className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
                        {cap.dept}
                      </div>
                      <h3 className="text-base sm:text-lg font-sans font-semibold text-white leading-snug mt-1">
                        {cap.headline}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                    <span className="text-xs font-mono text-red-400 hidden lg:inline">
                      {cap.metrics}
                    </span>
                    <button
                      type="button"
                      aria-label="Toggle details"
                      className="w-8 h-8 rounded-none border border-slate-700 bg-slate-800 flex items-center justify-center text-slate-300 hover:text-white transition-colors"
                    >
                      <svg
                        className={`w-4 h-4 transition-transform duration-200 ${isSelected ? 'rotate-180' : ''}`}
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isSelected && (
                  <div className="mt-6 pt-6 border-t border-slate-800/80 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-5">
                        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
                          {isEn ? 'Operational Scope' : 'Skop Operasi'}
                        </div>
                        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-light">
                          {cap.scope}
                        </p>
                        <div className="mt-4 p-3 bg-slate-900 border border-slate-800 text-xs">
                          <span className="text-red-400 font-mono font-bold block mb-1">
                            {isEn ? 'KEY BENCHMARK:' : 'PENANDA ARAS UTAMA:'}
                          </span>
                          <span className="text-slate-300">{cap.metrics}</span>
                        </div>
                      </div>

                      <div className="lg:col-span-7">
                        <div className="text-xs font-mono uppercase tracking-wider text-slate-400 mb-3 font-bold">
                          {isEn ? 'Deliverables for Your Restaurant' : 'Hasil Kerja Untuk Restoran Anda'}
                        </div>
                        <ul className="space-y-2.5">
                          {cap.deliverables.map((item, dIdx) => (
                            <li key={dIdx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300">
                              <span className="text-red-500 font-bold shrink-0 font-mono">—</span>
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
