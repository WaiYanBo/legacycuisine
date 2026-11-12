'use client';

import React from 'react';

interface GovernanceComplianceProps {
  currentLang?: 'en' | 'ms';
}

export default function GovernanceCompliance({ currentLang = 'en' }: GovernanceComplianceProps) {
  const isEn = currentLang === 'en';

  const standards = [
    {
      code: 'GOV-MY-01',
      title: isEn ? 'JAKIM Halal Assurance System' : 'Sistem Jaminan Halal JAKIM',
      desc: isEn
        ? 'All partner commissaries, cloud kitchens, and central processing units operate under certified Halal Assurance Systems. We mandate traceable ingredient sourcing and continuous hygiene audit logs.'
        : 'Semua dapur awan, unit pemprosesan pusat, dan rakan dapur beroperasi di bawah Sistem Jaminan Halal yang disahkan. Kami mewajibkan kebolehkesanan ramuan dan log audit kebersihan berterusan.',
    },
    {
      code: 'GOV-MY-02',
      title: isEn ? 'PDPA 2010 Data Protection' : 'Perlindungan Data Peribadi PDPA 2010',
      desc: isEn
        ? 'Merchant financial records, banking information, and customer order metadata are encrypted end-to-end with strict role-based access control and zero third-party disclosure.'
        : 'Rekod kewangan peniaga, maklumat perbankan, dan metadata pesanan pelanggan disulitkan hujung ke hujung dengan kawalan akses berasaskan peranan yang ketat.',
    },
    {
      code: 'GOV-MY-03',
      title: isEn ? 'SSM Corporate Transparency & Tax Invoicing' : 'Ketelusan Korporat SSM & Invois Cukai',
      desc: isEn
        ? 'Fully registered with the Companies Commission of Malaysia (SSM). Every reconciliation adjustment is backed by tax-compliant invoices, valid SST schedules, and verifiable bank settlement statements.'
        : 'Berdaftar sepenuhnya dengan Suruhanjaya Syarikat Malaysia (SSM). Setiap pelarasan penyesuaian disokong oleh invois patuh cukai, jadual SST sah, dan penyata penyelesaian bank yang boleh disahkan.',
    },
  ];

  return (
    <section id="governance" className="bg-slate-900 text-white py-20 sm:py-28 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-slate-800 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-500 block mb-3">
              {isEn ? 'Institutional Governance' : 'Tadbir Urus Institusi'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-white leading-tight sm:leading-snug">
              {isEn ? 'Compliance, Halal Integrity & Enterprise Trust' : 'Pematuhan, Integriti Halal & Amanah Korporat'}
            </h2>
          </div>
          <div className="text-xs text-slate-400 font-mono tracking-wider shrink-0 uppercase">
            {isEn ? 'Section 06 // Regulatory Standards' : 'Bahagian 06 // Piawaian Kawal Selia'}
          </div>
        </div>

        {/* 3-Column Linear Governance Pillars (NO CARDS - Vertical Hairline Dividers) */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 mt-10">
          {standards.map((std, idx) => (
            <div key={idx} className="py-8 md:py-4 px-0 md:px-8 first:pl-0 last:pr-0">
              <div className="text-[11px] font-mono text-red-500 font-bold tracking-widest uppercase mb-3">
                {std.code}
              </div>
              <h3 className="text-base sm:text-lg font-sans font-semibold text-white leading-snug mb-2">
                {std.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-light">
                {std.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Statutory Credentials Strip */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-wrap items-center justify-between gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-6">
            <span>REGISTRY: <strong className="text-white">SURUHANJAYA SYARIKAT MALAYSIA</strong></span>
            <span className="hidden sm:inline text-slate-700">|</span>
            <span>STANDARD: <strong className="text-white">MS 1500:2019 COMPLIANT</strong></span>
          </div>
          <div className="text-emerald-400">
            {isEn ? 'Enterprise SLA: 99.9% Uptime Verified' : 'SLA Perusahaan: 99.9% Kebolehcapaian Disahkan'}
          </div>
        </div>

      </div>
    </section>
  );
}

