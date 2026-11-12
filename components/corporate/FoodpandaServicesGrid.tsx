'use client';

import React from 'react';
import Link from 'next/link';

interface FoodpandaServicesGridProps {
  currentLang?: 'en' | 'ms';
}

export default function FoodpandaServicesGrid({ currentLang = 'en' }: FoodpandaServicesGridProps) {
  const isEn = currentLang === 'en';

  const services = [
    {
      code: 'FP-01',
      title: isEn ? 'Merchant Verification & Fast-Track Lodgement' : 'Pengesahan Peniaga & Penyerahan Pantas',
      sla: isEn ? '48-Hour Turnaround' : 'Tempoh 48 Jam',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:border-emerald-800',
      tagColor: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50',
      summary: isEn
        ? 'Full statutory pre-audit of your business documents including SSM registration, owner NRIC, bank statement headers, and municipal premise licenses. Zero-defect direct lodgement to Foodpanda Malaysia.'
        : 'Audit dokumen berkanun lengkap merangkumi sijil SSM, MyKad pemilik, penyata bank, dan lesen pihak berkuasa tempatan (PBT). Penyerahan rasmi sifar ralat terus ke Foodpanda Malaysia.',
      points: [
        isEn ? '20-point regulatory compliance pre-screening' : 'Saringan pematuhan berkanun 20-perkara',
        isEn ? 'Direct liaison with Foodpanda commercial approval team' : 'Komunikasi terus dengan meja kelulusan komersial Foodpanda',
        isEn ? 'Bank account titular validation against business entity' : 'Pengesahan nama pemegang akaun bank dengan entiti perniagaan',
      ],
    },
    {
      code: 'FP-02',
      title: isEn ? 'Digital Menu Architecture & Engineering' : 'Struktur & Kejuruteraan Menu Digital',
      sla: isEn ? 'High-Converting Hierarchy' : 'Susunan Penukaran Tinggi',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/60 dark:text-purple-400 dark:border-purple-800',
      tagColor: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50',
      summary: isEn
        ? 'Restructuring physical kitchen menus into Foodpanda digital architecture: combo sets, modifier chains, pricing tiers, and appetite-inducing category tags formatted for high conversion.'
        : 'Menyusun semula menu fizikal dapur kepada struktur digital Foodpanda: set kombo, pilihan tambahan, struktur harga, dan susunan kategori yang menyelerakan.',
      points: [
        isEn ? 'Standardized item nomenclature, descriptions & prices' : 'Piawaian nama hidangan, penerangan & harga jualan',
        isEn ? 'Average order value (AOV) combo basket optimization' : 'Pengoptimuman nilai purata pesanan (AOV) melalui set kombo',
        isEn ? 'High-resolution food photography compliance tagging' : 'Format gambar makanan mengikut garis panduan fotografi Foodpanda',
      ],
    },
    {
      code: 'FP-03',
      title: isEn ? 'Terminal Dispatch & Kitchen Staff Training' : 'Penyerahan Terminal & Latihan Kakitangan',
      sla: isEn ? 'On-Site Deployment' : 'Pemasangan Di Premis',
      badgeColor: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/60 dark:text-red-400 dark:border-red-800',
      tagColor: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/50',
      summary: isEn
        ? 'Physical dispatch and configuration of official Foodpanda order-receiving tablet hardware at merchant premises. Live simulated order testing and operational staff training.'
        : 'Penghantaran dan konfigurasi peranti tablet penerimaan pesanan rasmi Foodpanda di premis peniaga. Ujian simulasi pesanan langsung dan latihan staf dapur.',
      points: [
        isEn ? 'On-site terminal delivery, SIM/Wi-Fi configuration' : 'Penyerahan peranti di lokasi beserta tetapan SIM/Wi-Fi',
        isEn ? 'Kitchen brigade live-order fulfillment drill' : 'Latihan amali pemenuhan pesanan kakitangan dapur',
        isEn ? 'Order cancellation mitigation protocol to uphold store rank' : 'Protokol pencegahan pembatalan pesanan untuk prestasi kedai',
      ],
    },
    {
      code: 'FP-04',
      title: isEn ? 'Weekly Remittance Forensic Reconciliation' : 'Penyesuaian Forensik Penyata Mingguan',
      sla: isEn ? '99.85% Audit Precision' : 'Ketepatan Audit 99.85%',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-400 dark:border-blue-800',
      tagColor: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50',
      summary: isEn
        ? 'Cross-referencing weekly Foodpanda settlement statements against merchant POS journals. Automated dispute filing for uncompensated cancellations, rider delays, and voucher deductions.'
        : 'Semakan silang penyata bayaran mingguan Foodpanda dengan rekod POS restoran. Pemfailan pertikaian automatik bagi pesanan batal tidak diganti, kelewatan penghantar, dan potongan baucar.',
      points: [
        isEn ? 'Automated line-item transaction reconciliation' : 'Penyesuaian transaksi baris demi baris secara automatik',
        isEn ? 'Direct dispute ticketing for unauthorized debits' : 'Pemfailan tiket tuntutan bagi potongan tidak tepat',
        isEn ? 'Consolidated SST and merchant commission summaries' : 'Penyata ringkasan SST dan komisen untuk audit perakaunan',
      ],
    },
  ];

  return (
    <section className="bg-slate-50/60 dark:bg-[#070a12] py-20 sm:py-28 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800 text-xs font-bold uppercase tracking-wider mb-3">
              {isEn ? 'Our Scope of Work' : 'Skop Perkhidmatan Kami'}
            </div>
            <h2 className="text-2xl sm:text-4xl font-sans font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
              {isEn
                ? 'Authorised Foodpanda Intermediary Capabilities'
                : 'Perkhidmatan Perantara Rasmi Foodpanda'}
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-sm sm:text-base leading-relaxed">
              {isEn
                ? 'End-to-end management so your restaurant operates on Foodpanda with absolute commercial and financial certainty.'
                : 'Pengurusan menyeluruh agar restoran anda beroperasi di Foodpanda dengan kepastian komersial dan kewangan.'}
            </p>
          </div>

          <Link
            href="/services"
            className="text-xs font-bold uppercase tracking-wider text-red-700 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 inline-flex items-center gap-1.5 shrink-0"
          >
            <span>{isEn ? 'View all specifications' : 'Lihat semua spesifikasi'}</span>
            <span>&rarr;</span>
          </Link>
        </div>

        {/* 4 Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((srv) => (
            <div
              key={srv.code}
              className="p-5 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`text-xs font-mono font-bold px-3 py-1 rounded-lg border ${srv.badgeColor}`}>
                    {srv.code}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500 dark:text-slate-400">
                    {srv.sla}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3 leading-snug">
                  {srv.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                  {srv.summary}
                </p>
              </div>

              <div className="pt-5 border-t border-slate-100 dark:border-slate-800/80">
                <div className="text-xs font-bold text-slate-900 dark:text-slate-200 uppercase tracking-wider mb-3">
                  {isEn ? 'Verified Deliverables:' : 'Hasil Kerja Disahkan:'}
                </div>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                  {srv.points.map((pt, pIdx) => (
                    <li key={pIdx} className="flex items-center gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-[10px] shrink-0">
                        ✓
                      </span>
                      <span>{pt}</span>
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
