'use client';

import React from 'react';

interface CaseStudiesSectionProps {
  currentLang?: 'en' | 'ms';
}

export default function CaseStudiesSection({ currentLang = 'en' }: CaseStudiesSectionProps) {
  const isEn = currentLang === 'en';

  const cases = [
    {
      brand: isEn ? 'Heritage Kopitiam & Hainan Delights' : 'Rangkaian Kopitiam & Masakan Warisan',
      outlets: isEn ? '14 Locations • Klang Valley • Foodpanda Active' : '14 Cawangan • Lembah Klang • Aktif Foodpanda',
      challenge: isEn
        ? 'Had repeatedly tried to register on Foodpanda directly, but applications stalled for 6 weeks due to document mismatches and bank header rejections.'
        : 'Pernah cuba mendaftar sendiri di Foodpanda berkali-kali, namun permohonan tergantung selama 6 minggu akibat masalah dokumen dan penyata bank ditolak.',
      solution: isEn
        ? 'Legacy Cuisine took over as the authorised intermediary. Conducted 20-point pre-screening, formatted their digital menu, and secured live Foodpanda status in 48 hours.'
        : 'Legacy Cuisine mengambil alih sebagai perantara rasmi. Menjalankan saringan 20-perkara, menyusun menu digital, dan mengaktifkan restoran di Foodpanda dalam masa 48 jam.',
      metrics: [
        { label: isEn ? 'Approval Speed' : 'Kelajuan Kelulusan', val: '48 Hours' },
        { label: isEn ? 'Payout Leakage Recovered' : 'Tuntutan Bayaran', val: 'RM 28,400 / Q2' },
        { label: isEn ? 'Foodpanda GMV Growth' : 'Pertumbuhan Jualan', val: '+54% YoY' },
      ],
    },
    {
      brand: isEn ? 'Restoran Nasi Kandar & Bistro Chain' : 'Rangkaian Restoran Nasi Kandar & Bistro',
      outlets: isEn ? '22 Locations • Selangor & Penang' : '22 Cawangan • Selangor & Pulau Pinang',
      challenge: isEn
        ? 'High kitchen order cancellation rate (over 7%) on Foodpanda due to untrained staff handling tablet orders and missing promotional vouchers.'
        : 'Kadar pembatalan pesanan dapur tinggi (melebihi 7%) di Foodpanda akibat kakitangan kurang mahir mengendalikan tablet dan baucar promosi yang tercicir.',
      solution: isEn
        ? 'Our field agents conducted on-site staff walkthroughs, optimized the menu layout, and deployed weekly automated Foodpanda remittance auditing.'
        : 'Ejen lapangan kami menjalankan latihan staf di premis, menyusun semula susunan menu, dan mengaktifkan audit penyata Foodpanda mingguan secara automatik.',
      metrics: [
        { label: isEn ? 'Order Cancellation Rate' : 'Kadar Batal Pesanan', val: '< 0.8% (from 7%)' },
        { label: isEn ? 'Weekly Remittance SLA' : 'SLA Bayaran Mingguan', val: '100% On-Time' },
        { label: isEn ? 'Net Margin Expansion' : 'Peningkatan Margin', val: '+4.9% Lift' },
      ],
    },
  ];

  return (
    <section className="bg-white text-slate-900 py-20 sm:py-28 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-slate-200 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-600 block mb-3">
              {isEn ? 'Foodpanda Merchant Success Stories' : 'Kisah Kejayaan Peniaga Foodpanda'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-slate-950 leading-tight sm:leading-snug">
              {isEn ? 'Empirical Results & Merchant Case Profiles' : 'Keputusan Empirikal & Profil Kes Peniaga'}
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-mono tracking-wider shrink-0 uppercase">
            {isEn ? 'Section 07 // Portfolio Impact' : 'Bahagian 07 // Impak Portfolio'}
          </div>
        </div>

        {/* Case Studies Editorial Rows - Zero Cards! */}
        <div className="divide-y divide-slate-200 mt-8">
          {cases.map((c, idx) => (
            <div key={idx} className="py-10 first:pt-4 last:pb-0">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Brand & Context */}
                <div className="lg:col-span-4">
                  <div className="text-xs font-mono text-red-600 font-bold uppercase tracking-wider mb-1">
                    {c.outlets}
                  </div>
                  <h3 className="text-lg sm:text-xl font-sans font-bold text-slate-900 leading-snug">
                    {c.brand}
                  </h3>
                  <div className="mt-4 text-xs text-slate-500 space-y-2">
                    <p>
                      <strong className="text-slate-800 uppercase font-mono text-[11px] block">
                        {isEn ? 'Operational Challenge:' : 'Kekangan Operasi:'}
                      </strong>
                      {c.challenge}
                    </p>
                    <p className="pt-2">
                      <strong className="text-slate-800 uppercase font-mono text-[11px] block">
                        {isEn ? 'Intermediary Solution:' : 'Penyelesaian Perantara:'}
                      </strong>
                      {c.solution}
                    </p>
                  </div>
                </div>

                {/* Metrics Breakdown (Hairline Ribbon Format) */}
                <div className="lg:col-span-8 bg-slate-50 border border-slate-200 p-6 sm:p-8">
                  <div className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold mb-4">
                    {isEn ? 'Audited Deliverables on Foodpanda:' : 'Hasil Kerja Diaudit di Foodpanda:'}
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                    {c.metrics.map((m, mIdx) => (
                      <div key={mIdx} className="py-3 sm:py-0 px-0 sm:px-6 first:pl-0 last:pr-0">
                        <div className="text-2xl sm:text-3xl font-sans font-bold text-slate-900 tracking-normal">
                          {m.val}
                        </div>
                        <div className="text-xs font-bold text-slate-600 uppercase tracking-wider mt-1">
                          {m.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
