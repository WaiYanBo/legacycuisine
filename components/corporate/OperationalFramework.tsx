'use client';

import React from 'react';

interface OperationalFrameworkProps {
  currentLang?: 'en' | 'ms';
}

export default function OperationalFramework({ currentLang = 'en' }: OperationalFrameworkProps) {
  const isEn = currentLang === 'en';

  const steps = [
    {
      phase: 'STAGE 01',
      title: isEn ? 'Document Collection & Verification' : 'Pengumpulan & Pengesahan Dokumen',
      timeline: 'Day 1',
      summary: isEn
        ? 'Our agent meets you to collect and verify required documents: SSM corporate certificate, bank statement header, owner IC, and local council premise license.'
        : 'Ejen kami bertemu anda untuk mengumpul dan mengesahkan dokumen wajib: sijil SSM, penyata bank, MyKad pemilik, dan lesen premis pihak berkuasa tempatan.',
      checks: [
        isEn ? 'SSM Business Certificate verification' : 'Pengesahan Sijil Perniagaan SSM',
        isEn ? 'Bank account details match company name' : 'Nama akaun bank sepadan dengan nama syarikat',
        isEn ? 'Halal / pork-free declaration check' : 'Semakan pengisytiharan Halal / bebas babi',
      ],
    },
    {
      phase: 'STAGE 02',
      title: isEn ? 'Menu Engineering & Portal Submission' : 'Penyusunan Menu & Penyerahan Portal',
      timeline: 'Days 2 - 3',
      summary: isEn
        ? 'We digitize your restaurant menu according to Foodpanda’s official standards, setting up combos, add-ons, pricing, and high-resolution food images for fast approval.'
        : 'Kami mendigitalkan menu restoran anda mengikut piawaian rasmi Foodpanda, menyusun set kombo, pilihan tambahan, harga, dan gambar makanan berkualiti tinggi.',
      checks: [
        isEn ? 'Item descriptions & pricing configured' : 'Penerangan hidangan & penetapan harga',
        isEn ? 'Foodpanda official category indexing' : 'Penetapan kategori rasmi Foodpanda',
        isEn ? 'Direct submission to Foodpanda approval queue' : 'Penyerahan terus ke giliran kelulusan Foodpanda',
      ],
    },
    {
      phase: 'STAGE 03',
      title: isEn ? 'Tablet Delivery & Live Launch' : 'Penyerahan Tablet & Pelancaran Langsung',
      timeline: 'Days 4 - 5',
      summary: isEn
        ? 'Our field rep brings the official Foodpanda order-receiving tablet directly to your kitchen, conducts staff training, runs a test order, and turns your store live!'
        : 'Wakil kami membawa tablet pesanan rasmi Foodpanda terus ke dapur anda, melatih staf restoran, menjalankan pesanan ujian, dan mengaktifkan restoran anda!',
      checks: [
        isEn ? 'Foodpanda tablet terminal setup & testing' : 'Pemasangan & pengujian terminal tablet Foodpanda',
        isEn ? 'Kitchen staff live-order walkthrough' : 'Latihan pemenuhan pesanan kakitangan dapur',
        isEn ? 'Store goes live on the Foodpanda consumer app' : 'Restoran dibuka di aplikasi pengguna Foodpanda',
      ],
    },
    {
      phase: 'STAGE 04',
      title: isEn ? 'Weekly Payout Audit & Dispute Recovery' : 'Audit Bayaran Mingguan & Tuntutan Wang',
      timeline: 'Every Week',
      summary: isEn
        ? 'Every week when Foodpanda remits payouts, our ledger cross-checks your POS records to ensure every single order, promo voucher, and cancelled order is fully paid.'
        : 'Setiap minggu apabila Foodpanda membayar, lejar kami menyemak silang rekod POS anda bagi memastikan setiap pesanan, baucar promosi, dan pesanan batal dibayar penuh.',
      checks: [
        isEn ? 'Foodpanda remittance statement audit' : 'Audit penyata pembayaran Foodpanda',
        isEn ? 'Dispute ticketing for missing or late payouts' : 'Tiket pertikaian bagi bayaran tercicir atau lewat',
        isEn ? 'Consolidated SST invoice record for accounting' : 'Rekod invois SST disatukan untuk perakaunan',
      ],
    },
  ];

  return (
    <section id="framework" className="bg-white text-slate-900 py-20 sm:py-28 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between pb-10 border-b border-slate-200 gap-6">
          <div className="max-w-2xl">
            <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-red-600 block mb-3">
              {isEn ? 'Onboarding Protocol' : 'Protokol Pengaktifan'}
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-sans font-bold text-slate-950 leading-tight sm:leading-snug">
              {isEn ? 'The 4-Stage Foodpanda Onboarding Lifecycle' : 'Kitaran 4-Peringkat Pengaktifan Foodpanda'}
            </h2>
          </div>
          <div className="text-xs text-slate-500 font-mono tracking-wider shrink-0 uppercase">
            {isEn ? 'Section 03 // Execution Pipeline' : 'Bahagian 03 // Saluran Pelaksanaan'}
          </div>
        </div>

        {/* Linear Horizontal Timeline Matrix (NO CARDS - Structured Editorial Grid with Hairline Dividers) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-200 mt-10">
          {steps.map((step, idx) => (
            <div key={idx} className="py-8 md:py-4 px-0 md:px-6 first:pl-0 last:pr-0 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-xs font-mono mb-3">
                  <span className="text-red-600 font-bold tracking-widest">{step.phase}</span>
                  <span className="text-slate-500 bg-slate-100 px-2 py-0.5">{step.timeline}</span>
                </div>

                <h3 className="text-base sm:text-lg font-sans font-bold text-slate-900 leading-snug mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed font-light mb-6">
                  {step.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold mb-2">
                  {isEn ? 'Milestone Proof Points:' : 'Bukti Pencapaian:'}
                </div>
                <ul className="space-y-1.5">
                  {step.checks.map((check, cIdx) => (
                    <li key={cIdx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="text-emerald-600 font-bold text-[10px] mt-0.5">✓</span>
                      <span className="leading-tight">{check}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
