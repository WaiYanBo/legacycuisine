'use client';

import React from 'react';

interface ExecutiveThesisProps {
  currentLang?: 'en' | 'ms';
}

export default function ExecutiveThesis({ currentLang = 'en' }: ExecutiveThesisProps) {
  const isEn = currentLang === 'en';

  const pillars = [
    {
      num: '01',
      title: isEn ? 'Authorised Fast-Track Foodpanda Registration' : 'Pendaftaran Foodpanda Pantas & Sah',
      desc: isEn
        ? 'Independent restaurants attempting to register on Foodpanda often face weeks of document rejection, mismatched bank details, and delayed device activation. As the appointed intermediary, we complete 20-point verification to ensure first-time approval within 48 hours.'
        : 'Restoran yang mendaftar sendiri di Foodpanda sering berdepan penolakan dokumen berminggu-minggu, maklumat bank tidak sepadan, dan kelewatan peranti. Sebagai perantara rasmi, kami menjalankan saringan 20-perkara untuk memastikan kelulusan kali pertama dalam tempoh 48 jam.',
    },
    {
      num: '02',
      title: isEn ? 'Weekly Payout Audit & Settlement Ledger' : 'Audit Bayaran Mingguan & Lejar Penyesuaian',
      desc: isEn
        ? 'Foodpanda settles payouts weekly, but restaurants struggle to audit deductions, promotional vouchers, customer refund deductions, and cancelled orders. Our dedicated reconciliation ledger audits every line item to ensure merchants receive every Ringgit owed.'
        : 'Foodpanda membayar penyelesaian setiap minggu, tetapi peniaga sukar menyemak potongan yuran, baucar promosi, dan pesanan dibatalkan. Lejar penyesuaian kami mengaudit setiap baris transaksi untuk memastikan peniaga menerima hak kewangan sepenuhnya.',
    },
    {
      num: '03',
      title: isEn ? 'On-the-Ground Device & Operational Support' : 'Sokongan Peranti & Operasi Di Lokasi',
      desc: isEn
        ? 'We don’t just submit an application and disappear. Our field agents deliver and set up the official Foodpanda order-receiving tablet, train kitchen staff, test live orders, and ensure minimal order cancellations from day one.'
        : 'Kami tidak sekadar menghantar borang dan menghilangkan diri. Ejen lapangan kami menghantar dan memasang tablet pesanan rasmi Foodpanda, melatih staf dapur, menguji pesanan langsung, dan memastikan sifar pembatalan pesanan dari hari pertama.',
    },
  ];

  return (
    <section id="overview" className="bg-white text-slate-900 py-20 sm:py-28 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Editorial Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-slate-200 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-600 block mb-3">
              {isEn ? 'Our Sole Purpose & Mandate' : 'Tujuan Utama & Mandat Kami'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-slate-950 leading-tight sm:leading-snug">
              {isEn
                ? 'Empowering Malaysian Restaurants with Frictionless Foodpanda Success'
                : 'Memperkasakan Restoran Malaysia Meraih Kejayaan Lancar Bersama Foodpanda'}
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-mono tracking-wider shrink-0 uppercase">
            {isEn ? 'Section 01 // Authorised Intermediary' : 'Bahagian 01 // Perantara Rasmi'}
          </div>
        </div>

        {/* Asymmetrical 2-Column Corporate Spread (No Cards) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 pt-12 items-start">
          
          {/* Left Column: Thesis Statement */}
          <div className="lg:col-span-5 space-y-6">
            <blockquote className="text-base sm:text-lg font-sans text-slate-700 italic leading-relaxed border-l-2 border-red-600 pl-6">
              {isEn
                ? '“Our business has one singular focus: serving as the trusted, authorised bridge between Foodpanda and restaurant merchants. We handle the paperwork, device setup, and payout auditing so restaurant owners can focus on cooking great food.”'
                : '“Perniagaan kami mempunyai satu fokus mutlak: bertindak sebagai jambatan rasmi dan dipercayai antara Foodpanda dan peniaga restoran. Kami menguruskan dokumentasi, peranti, dan audit bayaran agar pemilik restoran dapat fokus memasak hidangan terbaik.”'}
            </blockquote>

            <div className="pt-4">
              <div className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Corporate Directorate
              </div>
              <div className="text-xs text-slate-500">
                Legacy Cuisine
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100 text-xs text-slate-600 leading-relaxed">
              {isEn
                ? 'Headquartered in Kuala Lumpur, our nationwide agent force operates across Selangor, Penang, Johor, and the Klang Valley, ensuring seamless Foodpanda merchant integration and financial transparency.'
                : 'Beribu pejabat di Kuala Lumpur, pasukan ejen kami beroperasi di seluruh Selangor, Pulau Pinang, Johor, dan Lembah Klang, menjamin integrasi Foodpanda yang lancar dan ketelusan kewangan.'}
            </div>
          </div>

          {/* Right Column: 3 Linear Pillars (Zero Cards - Horizontal Flow) */}
          <div className="lg:col-span-7 divide-y divide-slate-200">
            {pillars.map((pillar) => (
              <div key={pillar.num} className="py-8 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-4 mb-2">
                  <span className="text-red-600 font-mono text-sm font-bold">{pillar.num}</span>
                  <h3 className="text-base sm:text-lg font-sans font-bold text-slate-900 leading-snug">
                    {pillar.title}
                  </h3>
                </div>
                <p className="text-sm text-slate-600 font-light leading-relaxed pl-8">
                  {pillar.desc}
                </p>
              </div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
