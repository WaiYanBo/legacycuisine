'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Locale } from '../../lib/i18n';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';

export interface DocumentItemDef {
  id: string;
  label: string;
  sublabel: string;
  required: boolean;
  guidance: string;
}

export interface UploadedDocumentRecord {
  status: 'Received' | 'Not Received' | 'Diterima' | 'Belum';
  url?: string | null;
  fileName?: string;
  fileSize?: string;
  uploadedAt?: string;
}

// Client-side image compressor: scales high-res smartphone photos (5-15MB) to crisp, lightweight JPEGs (<250KB)
const compressAndReadImage = (
  file: File
): Promise<{ url: string; fileName: string; fileSize: string; uploadedAt: string }> => {
  return new Promise((resolve, reject) => {
    const sizeInKb = Math.round(file.size / 1024);
    const originalSizeStr = sizeInKb > 1024 ? `${(sizeInKb / 1024).toFixed(1)} MB` : `${sizeInKb} KB`;

    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          url: reader.result as string,
          fileName: file.name,
          fileSize: originalSizeStr,
          uploadedAt: new Date().toISOString(),
        });
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
      return;
    }

    const img = new window.Image();
    const objUrl = URL.createObjectURL(file);
    img.src = objUrl;

    img.onload = () => {
      URL.revokeObjectURL(objUrl);
      const maxWidth = 1400;
      const maxHeight = 1400;
      let { width, height } = img;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () =>
          resolve({
            url: reader.result as string,
            fileName: file.name,
            fileSize: originalSizeStr,
            uploadedAt: new Date().toISOString(),
          });
        reader.readAsDataURL(file);
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      const approxBytes = Math.round((dataUrl.length * 3) / 4);
      const compressedKb = Math.round(approxBytes / 1024);
      const compressedSizeStr = compressedKb > 1024 ? `${(compressedKb / 1024).toFixed(1)} MB` : `${compressedKb} KB`;

      resolve({
        url: dataUrl,
        fileName: file.name,
        fileSize: compressedSizeStr,
        uploadedAt: new Date().toISOString(),
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objUrl);
      const reader = new FileReader();
      reader.onload = () =>
        resolve({
          url: reader.result as string,
          fileName: file.name,
          fileSize: originalSizeStr,
          uploadedAt: new Date().toISOString(),
        });
      reader.onerror = reject;
      reader.readAsDataURL(file);
    };
  });
};

interface BusinessRegistrationFormProps {
  lang?: Locale;
}

export default function BusinessRegistrationForm({ lang = 'ms' }: BusinessRegistrationFormProps) {
  const isEn = lang === 'en';

  const documentItems: DocumentItemDef[] = [
    {
      id: 'ic',
      label: isEn ? 'Identity Card' : 'Kad Pengenalan',
      sublabel: isEn ? 'MyKad / Passport (Front & Back)' : 'Salinan MyKad (Depan & Belakang)',
      required: true,
      guidance: isEn
        ? 'Clear photo/scan of NRIC front and back. Ensure all details, photo, and IC number are sharp and legible without flash glare.'
        : 'Salinan gambar depan & belakang MyKad yang jelas. Pastikan nombor IC, nama dan gambar kelihatan terang tanpa pantulan cahaya.',
    },
    {
      id: 'ssm',
      label: isEn ? 'SSM Certificate' : 'Sijil Pendaftaran SSM',
      sublabel: isEn ? 'SSM Borang D/E / Corporate Profile (Optional)' : 'SSM Borang D / E / Maklumat Perniagaan (Pilihan)',
      required: false,
      guidance: isEn
        ? 'Official SSM business registration certificate or corporate profile displaying valid 12-digit registration number and expiry date (Optional - leave blank if not applicable or operating as home kitchen/individual).'
        : 'Sijil perakuan pendaftaran SSM atau profil syarikat rasmi yang memaparkan nombor pendaftaran 12-digit dan tarikh luput sah (Pilihan - boleh dikosongkan sekiranya tiada SSM atau perniagaan dari rumah/individu).',
    },
    {
      id: 'pbt',
      label: isEn ? 'Local Authority Licence' : 'Lesen Pihak Berkuasa Tempatan (PBT)',
      sublabel: isEn ? 'Municipal Council Business License' : 'Lesen Majlis Perbandaran / Dewan Bandaraya',
      required: false,
      guidance: isEn
        ? 'Valid business operating licence from local council (e.g. DBKL, MBPJ, MBSA). If currently pending or operating home kitchen, you may leave this blank.'
        : 'Lesen perniagaan sah daripada pihak berkuasa tempatan (PBT). Boleh dikosongkan sekiranya permohonan dalam proses atau perniagaan dari rumah.',
    },
    {
      id: 'bank',
      label: isEn ? 'Bank Statement' : 'Penyata Akaun Bank',
      sublabel: isEn ? 'Bank Header showing Name & Account No.' : 'Bahagian Atas Penyata Bank (Nama & No Akaun)',
      required: true,
      guidance: isEn
        ? 'Top header portion of bank statement or online bank slip showing bank name, registered account name, and account number matching Section 3.'
        : 'Keratan atas penyata bank atau slip bank dalam talian yang jelas memaparkan nama bank, nama pemegang akaun dan nombor akaun sepadan Seksyen 3.',
    },
    {
      id: 'logo',
      label: isEn ? 'Brand / Store Logo' : 'Logo Perniagaan / Restoran',
      sublabel: isEn ? 'High-resolution logo (PNG/JPG)' : 'Logo resolusi tinggi (PNG / JPG)',
      required: false,
      guidance: isEn
        ? 'High-resolution brand logo or store banner for delivery platform storefront branding.'
        : 'Fail logo kedai atau jenama beresolusi tinggi untuk profil paparan di aplikasi penghantaran makanan.',
    },
    {
      id: 'premis',
      label: isEn ? 'Business Premises Photo' : 'Gambar Hadapan Premis Perniagaan',
      sublabel: isEn ? 'Storefront showing signage & entrance' : 'Papan tanda kedai & pintu masuk utama',
      required: true,
      guidance: isEn
        ? 'Clear wide-angle daytime photo of the shop frontage clearly displaying the official commercial signboard and entrance.'
        : 'Gambar sudut luas hadapan premis yang jelas memaparkan papan tanda perniagaan dan pintu masuk kedai pada waktu siang.',
    },
    {
      id: 'menu',
      label: isEn ? 'Menu Photo' : 'Gambar Menu Makanan',
      sublabel: isEn ? 'Dine-in or Takeaway Menu' : 'Menu Lengkap Makanan & Minuman',
      required: true,
      guidance: isEn
        ? 'Clear photo or digital copy of the full food and beverage menu including all dishes and item names.'
        : 'Gambar atau salinan digital menu hidangan yang jelas memaparkan senarai nama makanan dan minuman.',
    },
    {
      id: 'harga',
      label: isEn ? 'Price List' : 'Senarai Harga',
      sublabel: isEn ? 'Official Itemized Pricing' : 'Senarai Harga Rasmi Setiap Menu',
      required: true,
      guidance: isEn
        ? 'Itemized price list for all menu items to be accurately configured and synced on delivery platforms.'
        : 'Senarai harga rasmi bagi setiap hidangan untuk diselaraskan ke dalam platform pesanan pelanggan.',
    },
    {
      id: 'halal',
      label: isEn ? 'Halal Certificate' : 'Sijil Pengesahan Halal',
      sublabel: isEn ? 'JAKIM / State Islamic Council (Optional)' : 'JAKIM / JAIN (Pilihan)',
      required: false,
      guidance: isEn
        ? 'Valid Halal certificate issued by JAKIM or recognized state Islamic department (required only if claiming halal-certified status).'
        : 'Sijil Halal sah yang dikeluarkan oleh JAKIM atau MAIN/JAIN (wajib sekiranya memohon pengesahan status Halal rasmi).',
    },
  ];

  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Header State
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [memberNo, setMemberNo] = useState('');

  // Section 1: Merchant Information / Maklumat Peniaga
  const [fullName, setFullName] = useState('');
  const [mailingAddress, setMailingAddress] = useState('');
  const [storeAddress, setStoreAddress] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [registrationNo, setRegistrationNo] = useState('');
  const [icPassportNo, setIcPassportNo] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [age, setAge] = useState('');
  const [religion, setReligion] = useState(isEn ? 'Islam' : 'Islam');
  const [race, setRace] = useState(isEn ? 'Malay' : 'Melayu');
  const [nationality, setNationality] = useState(isEn ? 'Malaysian' : 'Malaysia');
  const [contactNumber, setContactNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [gender, setGender] = useState(isEn ? 'Male' : 'Lelaki');

  // Section 2: Operating Information / Maklumat Operasi
  const [operatingDays, setOperatingDays] = useState<string[]>(
    isEn
      ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
      : ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad']
  );
  const [operatingHours, setOperatingHours] = useState('8:00 AM - 10:00 PM');

  // Section 3: Bank Account Information / Maklumat Akaun Bank
  const [bankName, setBankName] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');

  // Section 4: Document Checklist & Uploads / Senarai Semak Dokumen & Muat Naik Foto
  const [documentsData, setDocumentsData] = useState<Record<string, UploadedDocumentRecord>>({
    ic: { status: isEn ? 'Not Received' : 'Belum' },
    ssm: { status: isEn ? 'Not Received' : 'Belum' },
    pbt: { status: isEn ? 'Not Received' : 'Belum' },
    bank: { status: isEn ? 'Not Received' : 'Belum' },
    logo: { status: isEn ? 'Not Received' : 'Belum' },
    premis: { status: isEn ? 'Not Received' : 'Belum' },
    menu: { status: isEn ? 'Not Received' : 'Belum' },
    harga: { status: isEn ? 'Not Received' : 'Belum' },
    halal: { status: isEn ? 'Not Received' : 'Belum' },
  });
  const [shopPhotoUrl, setShopPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [uploadingDocId, setUploadingDocId] = useState<string | null>(null);
  const [activeInspectorDocId, setActiveInspectorDocId] = useState<string>('premis');
  const [previewModalDoc, setPreviewModalDoc] = useState<{
    id: string;
    label: string;
    sublabel?: string;
    icon?: string;
    url: string;
    fileName?: string;
    fileSize?: string;
    uploadedAt?: string;
  } | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [isDraggingOverDocId, setIsDraggingOverDocId] = useState<string | null>(null);

  // Section 5: For Office/Agent Use / Bahagian Kegunaan Pejabat/Ejen
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [processingOfficer, setProcessingOfficer] = useState('');
  const [status, setStatus] = useState<'Incomplete' | 'In Process' | 'Approved' | 'Rejected' | 'Belum Lengkap' | 'Dalam Proses' | 'Diluluskan' | 'Ditolak'>(
    isEn ? 'In Process' : 'Dalam Proses'
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [activationDate, setActivationDate] = useState('');

  // Section 6: Disclaimer & Terms of Service
  const [agreedToTerms, setAgreedToTerms] = useState(true);

  // Section 7: Confirmation & Signature
  const [merchantSignatureName, setMerchantSignatureName] = useState('');
  const [merchantSignatureIc, setMerchantSignatureIc] = useState('');
  const [merchantSignatureDate, setMerchantSignatureDate] = useState(new Date().toISOString().split('T')[0]);

  const [agentSignatureName, setAgentSignatureName] = useState('');
  const [agentSignatureId, setAgentSignatureId] = useState('');
  const [agentSignatureDate, setAgentSignatureDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoggedInAgent, setIsLoggedInAgent] = useState(false);

  // Auto-bind logged in agent on mount
  useEffect(() => {
    try {
      const savedUser = typeof window !== 'undefined' ? localStorage.getItem('lc_user') : null;
      if (savedUser) {
        const u = JSON.parse(savedUser);
        if (u.role === 'AGENT') {
          setIsLoggedInAgent(true);
          setAgentSignatureName(u.fullName || '');
          setAgentSignatureId(u.username || u.email || '');
        }
      }
    } catch {}
  }, []);

  const [reviewerName, setReviewerName] = useState('');
  const [reviewerRole, setReviewerRole] = useState(isEn ? 'Audit Supervisor' : 'Penyelia Audit');
  const [reviewerDate, setReviewerDate] = useState('');

  const [approverName, setApproverName] = useState('');
  const [approverRole, setApproverRole] = useState(isEn ? 'Merchant Manager' : 'Pengurus Peniaga');
  const [approverDate, setApproverDate] = useState('');

  // Helper toggle operating days
  const toggleOperatingDay = (day: string) => {
    if (operatingDays.includes(day)) {
      setOperatingDays(operatingDays.filter((d) => d !== day));
    } else {
      setOperatingDays([...operatingDays, day]);
    }
  };

  // Helper toggle doc checklist (maintained for backwards compatibility)
  const toggleDocChecklist = (docId: string, value: any) => {
    setDocumentsData((prev) => ({
      ...prev,
      [docId]: {
        ...(prev[docId] || {}),
        status: value,
      },
    }));
  };

  // Upload handler with client-side canvas compression
  const handleUploadDocument = async (docId: string, file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/') && !file.type.includes('pdf')) {
      alert(isEn ? 'Please upload a valid image file (JPG, PNG, WEBP).' : 'Sila muat naik fail imej yang sah (JPG, PNG, WEBP).');
      return;
    }

    setUploadingDocId(docId);
    setIsUploadingPhoto(true);
    try {
      const res = await compressAndReadImage(file);
      setDocumentsData((prev) => ({
        ...prev,
        [docId]: {
          status: isEn ? 'Received' : 'Diterima',
          url: res.url,
          fileName: res.fileName,
          fileSize: res.fileSize,
          uploadedAt: res.uploadedAt,
        },
      }));
      if (docId === 'premis') {
        setShopPhotoUrl(res.url);
      }
      setActiveInspectorDocId(docId);
    } catch (err: any) {
      alert(isEn ? 'Failed to process image file.' : 'Gagal memproses fail imej.');
    } finally {
      setUploadingDocId(null);
      setIsUploadingPhoto(false);
    }
  };

  // Delete uploaded document and reset to pending
  const handleDeleteDocument = (docId: string) => {
    const targetDoc = documentItems.find((d) => d.id === docId);
    const confirmMsg = isEn
      ? `Are you sure you want to delete the uploaded photo for "${targetDoc?.label || 'this document'}"?`
      : `Adakah anda pasti mahu memadam foto yang dimuat naik bagi "${targetDoc?.label || 'dokumen ini'}"?`;
    if (!window.confirm(confirmMsg)) return;

    setDocumentsData((prev) => ({
      ...prev,
      [docId]: {
        status: isEn ? 'Not Received' : 'Belum',
        url: null,
        fileName: undefined,
        fileSize: undefined,
        uploadedAt: undefined,
      },
    }));

    if (docId === 'premis') {
      setShopPhotoUrl(null);
    }

    if (previewModalDoc?.id === docId) {
      setPreviewModalDoc(null);
      setZoomLevel(1);
    }
  };

  // Handle Premises Photo Upload alias
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadDocument('premis', file);
    }
  };

  // Close Lightbox Modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && previewModalDoc) {
        setPreviewModalDoc(null);
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewModalDoc]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!agreedToTerms) {
      setErrorMsg(isEn ? 'Please check the Terms of Service & Disclaimer confirmation box.' : 'Sila tanda kotak pengesahan Terma Perkhidmatan & Penafian.');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        date,
        memberNo,
        fullName: fullName || merchantSignatureName,
        mailingAddress,
        storeAddress: storeAddress || mailingAddress,
        businessName,
        registrationNo,
        icPassportNo: icPassportNo || merchantSignatureIc,
        dateOfBirth,
        age,
        religion,
        race,
        nationality,
        contactNumber,
        emailAddress,
        gender,
        personInCharge: fullName || businessName,
        typeOfFood: isEn ? 'Restaurant / Food' : 'Restoran / Makanan',
        operatingDays,
        operatingHours,
        bankName,
        bankAccountName: bankAccountName || fullName,
        bankAccountNumber,
        documentsChecklist: documentsData,
        shopPhotoUrl: documentsData.premis?.url || shopPhotoUrl || null,
        receivedDate,
        processingOfficer,
        status,
        rejectionReason,
        activationDate,
        agreedToTerms,
        merchantSignatureName: merchantSignatureName || fullName,
        merchantSignatureIc: merchantSignatureIc || icPassportNo,
        merchantSignatureDate,
        agentSignatureName,
        agentSignatureId,
        agentSignatureDate,
        agentUserId: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lc_user') || '{}')?.id : undefined,
        agentEmail: typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('lc_user') || '{}')?.email : undefined,
        reviewerName,
        reviewerRole,
        reviewerDate,
        approverName,
        approverRole,
        approverDate,
        language: lang.toUpperCase(),
      };

      const res = await fetch('/api/forms/registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || (isEn ? 'Failed to save merchant registration.' : 'Gagal menyimpan borang peniaga.'));

      setSuccessMsg(isEn ? 'Merchant Form submitted and saved successfully!' : 'Borang Peniaga berjaya dihantar dan disimpan ke pangkalan data!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      setErrorMsg(err.message || (isEn ? 'An error occurred while processing application.' : 'Ralat berlaku semasa memproses permohonan peniaga.'));
    } finally {
      setSubmitting(false);
    }
  };

  const daysList = isEn
    ? ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    : ['Isnin', 'Selasa', 'Rabu', 'Khamis', 'Jumaat', 'Sabtu', 'Ahad'];

  return (
    <div className="max-w-4xl mx-auto bg-white dark:bg-[#0d1117] text-slate-900 dark:text-slate-100 p-4 sm:p-8 md:p-10 rounded-2xl sm:rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 print:border-none print:shadow-none print:p-0 printable-card">
      
      {/* DOCUMENT HEADER */}
      <div className="border-b-2 border-red-600 pb-5 mb-6 sm:mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 print-doc-header print:pb-2 print:mb-2">
        <div>
          <div className="flex items-center gap-3 mb-2 print:mb-0.5">
            <div className="inline-block px-3 py-1 print:px-2 print:py-0.5 bg-red-600 text-white font-extrabold text-xs print:text-[7pt] tracking-widest rounded-md uppercase">
              {isEn ? 'MERCHANT REGISTRATION' : 'PENDAFTARAN PENIAGA'}
            </div>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-950/40 text-slate-700 dark:text-slate-200 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-bold border border-slate-300 dark:border-slate-700 hover:border-red-300 transition-all flex items-center gap-1.5 shadow-sm print:hidden"
            >
              <span>{isEn ? 'Print Form' : 'Cetak Borang'}</span>
            </button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white print:text-[13pt] print:leading-tight">
            {isEn ? 'MERCHANT REGISTRATION' : 'PENDAFTARAN PENIAGA'}
          </h1>
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-1 print:mt-0.5 print:text-[7.5pt]">
            Foodpanda, GrabFood and ShopeeFood — Malaysia
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-2 max-w-2xl leading-relaxed print:hidden">
            {isEn
              ? 'This form is used to register and assess individuals or companies applying to become merchants.'
              : 'Borang ini digunakan untuk pendaftaran dan penilaian individu atau syarikat yang memohon menjadi peniaga.'}
          </p>
        </div>

        <div className="flex flex-col items-center md:items-end gap-2.5 shrink-0 print:self-center">
          <div className="w-20 h-20 sm:w-24 sm:h-24 print:w-14 print:h-14 rounded-full bg-white p-2.5 print:p-1 flex items-center justify-center border-2 border-red-600 shadow-md ring-4 ring-red-600/15 transition-transform hover:scale-105 print-logo-container">
            <Image src="/logo-circle.png" alt="Legacy Cuisine Logo" width={96} height={96} className="object-contain w-full h-full" priority />
          </div>
          <div className="flex gap-2 text-xs print:hidden">
            <div className="bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
              <span className="font-semibold text-slate-500 dark:text-slate-400">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</span> <span className="font-bold text-slate-900 dark:text-white">{formatDateToDDMMYYYY(date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-2xl animate-fadeIn print:hidden">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-sm font-semibold rounded-2xl animate-fadeIn print:hidden">
          {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8 print:space-y-2">

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: MERCHANT INFORMATION */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 print:p-1.5 rounded-xl print:rounded-lg font-extrabold text-sm print:text-[8pt] uppercase tracking-wider shadow-sm mt-6 print:mt-0">
          {isEn ? 'SECTION 1: MERCHANT INFORMATION' : 'SEKSYEN 1: MAKLUMAT PENIAGA'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-1.5">
          {/* Row 1: Date & Member No (standardized like Agent Form) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Date (DD/MM/YYYY) *' : 'Tarikh Permohonan (DD/MM/YYYY) *'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Member No.' : 'No. Ahli / ID Peniaga'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'e.g. MCH-9941' : 'Contoh: MCH-9941'}
              value={memberNo}
              onChange={(e) => setMemberNo(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          {/* Row 2: Full Name & Company Name */}
          <div className="md:col-span-2 print:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Full Name *' : 'Nama Penuh *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Full name as per Identity Card / Passport' : 'Nama penuh seperti dalam Kad Pengenalan / Pasport'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div className="print:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Company Name *' : 'Nama Syarikat / Kedai *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Registered business / store name' : 'Nama pendaftaran perniagaan / kedai'}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          {/* Row 3: Registration No & IC/Passport */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Registration No. / SSM (Optional)' : 'No. Pendaftaran Syarikat / SSM (Pilihan)'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'e.g. 202301099882 (Optional)' : 'Contoh: 202301099882 (Pilihan)'}
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Identity Card / Passport No. *' : 'No. Kad Pengenalan / Pasport *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'e.g. 881024-08-6631' : 'Contoh: 881024-08-6631'}
              value={icPassportNo}
              onChange={(e) => setIcPassportNo(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          {/* Row 4: Gender & Date of Birth */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Gender' : 'Jantina'}
            </label>
            <div className="flex gap-4 pt-2 print:pt-0.5">
              {(isEn ? ['Male', 'Female'] : ['Lelaki', 'Perempuan']).map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer text-sm print:text-[7.5pt] font-semibold">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={(e) => setGender(e.target.value)}
                    className="accent-red-600"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Date of Birth (DD/MM/YYYY)' : 'Tarikh Lahir (DD/MM/YYYY)'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          {/* Row 5: Age & Religion */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Age' : 'Umur'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'e.g. 35 Years Old' : 'Contoh: 35 Tahun'}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Religion' : 'Agama'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Islam / Buddhism / Hinduism / Christianity' : 'Islam / Buddha / Hindu / Kristian'}
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          {/* Row 6: Race & Nationality */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Race' : 'Bangsa'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Malay / Chinese / Indian / Others' : 'Melayu / Cina / India / Lain-lain'}
              value={race}
              onChange={(e) => setRace(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Nationality' : 'Kewarganegaraan'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Malaysian' : 'Warganegara Malaysia'}
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          {/* Row 7: Telephone & Email */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Telephone No. *' : 'No. Telefon *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'e.g. 012-3456789' : 'Contoh: 012-3456789'}
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Email *' : 'E-mel *'}
            </label>
            <input
              type="email"
              required
              placeholder="name@domain.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          {/* Row 8: Mailing Address & Business Premises Address (Side-by-side in print) */}
          <div className="md:col-span-2 print:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Mailing Address *' : 'Alamat Surat-Menyurat *'}
            </label>
            <textarea
              required
              rows={2}
              placeholder={isEn ? 'Full residential or mailing address' : 'Alamat kediaman / surat-menyurat penuh'}
              value={mailingAddress}
              onChange={(e) => setMailingAddress(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div className="md:col-span-2 print:col-span-1">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Business Premises Address *' : 'Alamat Premis Perniagaan *'}
            </label>
            <textarea
              required
              rows={2}
              placeholder={isEn ? 'Full physical store/premises address' : 'Alamat kedai / premis fizikal perniagaan'}
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: OPERATING INFORMATION */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 print:p-1.5 rounded-xl print:rounded-lg font-extrabold text-sm print:text-[8pt] uppercase tracking-wider shadow-sm mt-6 print:mt-1">
          {isEn ? 'SECTION 2: OPERATING INFORMATION' : 'SEKSYEN 2: MAKLUMAT OPERASI'}
        </div>

        <div className="space-y-3 print:space-y-0 print:grid print:grid-cols-2 print:gap-2 print:items-center bg-slate-50 dark:bg-slate-950/60 p-4 print:p-1 rounded-2xl print:rounded-lg border border-slate-200 dark:border-slate-800 print:bg-transparent print:border-none print:shadow-none">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 print:mb-0.5">
              {isEn ? 'Operating Days:' : 'Hari Operasi:'}
            </label>
            <div className="flex flex-wrap gap-1.5 print:gap-1">
              {daysList.map((day) => {
                const isSelected = operatingDays.includes(day);
                return (
                  <span
                    key={day}
                    onClick={() => toggleOperatingDay(day)}
                    className={`cursor-pointer px-3 py-1 print:px-1 print:py-0.2 rounded-lg print:rounded text-xs print:text-[6.5pt] font-bold transition-all border inline-flex items-center gap-1.5 print:gap-0.5 select-none ${
                      isSelected
                        ? 'bg-red-600 text-white border-red-600 shadow-sm print:bg-transparent print:text-black print:border-black'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800 print:bg-transparent print:text-slate-400 print:border-slate-300'
                    }`}
                  >
                    <span className="font-mono text-xs print:text-[6.5pt]">{isSelected ? '[x]' : '[ ]'}</span>
                    <span>{day}</span>
                  </span>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Operating Hours — Time:' : 'Waktu Operasi — Masa:'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'e.g. 8:00 AM - 10:00 PM' : 'Contoh: 8:00 AM - 10:00 PM'}
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 3: BANK ACCOUNT INFORMATION */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 print:p-1.5 rounded-xl print:rounded-lg font-extrabold text-sm print:text-[8pt] uppercase tracking-wider shadow-sm mt-6 print:mt-1">
          {isEn ? 'SECTION 3: BANK ACCOUNT INFORMATION' : 'SEKSYEN 3: MAKLUMAT AKAUN BANK'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 print:grid-cols-3 gap-4 print:gap-1.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Bank Name *' : 'Nama Bank *'}
            </label>
            <input
              type="text"
              required
              placeholder="Maybank / CIMB / RHB / Public Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? "Account Holder's Name *" : 'Nama Pemegang Akaun *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Must match IC / Company Name' : 'Mesti sama dengan IC / Nama Syarikat'}
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Account No. *' : 'No. Akaun *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Bank Account Number' : 'Nombor Akaun Bank'}
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm print:text-[7.5pt] focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-red-600 transition-all"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 4: DOCUMENT & PHOTO VERIFICATION CHECKLIST (PAGE 2) */}
        {/* ------------------------------------------------------------- */}
        {(() => {
          const uploadedDocsList = Object.entries(documentsData).filter(([_, doc]) => Boolean(doc?.url));
          const uploadedCount = uploadedDocsList.length;
          const totalCount = documentItems.length;
          const completionPct = Math.round((uploadedCount / totalCount) * 100);

          const requiredItems = documentItems.filter((d) => d.required);
          const requiredUploadedCount = requiredItems.filter((d) => Boolean(documentsData[d.id]?.url)).length;
          const requiredTotalCount = requiredItems.length;

          const activeDoc = documentItems.find((d) => d.id === activeInspectorDocId) || documentItems[0];
          const activeDocData = documentsData[activeDoc.id];

          return (
            <div className="print-break-before space-y-4 print:space-y-1.5 print:mt-0">
              {/* Header Banner */}
              <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 print:p-1.5 rounded-xl print:rounded-lg font-extrabold text-sm print:text-[8pt] uppercase tracking-wider shadow-sm mt-8 print:mt-0 flex flex-wrap items-center justify-between gap-2">
                <span>{isEn ? 'SECTION 4: DOCUMENT CHECKLIST' : 'SEKSYEN 4: SENARAI SEMAK DOKUMEN'}</span>
                <span className="text-xs print:text-[7pt] font-bold bg-white/20 px-3 py-1 print:px-2 print:py-0.5 rounded-full backdrop-blur-sm">
                  {uploadedCount} / {totalCount} {isEn ? 'Uploaded' : 'Dimuat Naik'}
                </span>
              </div>

              {/* Progress & Guidance Banner (On-screen) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm print:hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-slate-900 dark:text-white text-sm">
                        {isEn ? 'Onboarding Document Verification' : 'Status Pengesahan Dokumen Onboarding'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {isEn ? 'Direct Upload' : 'Muat Naik Langsung'}
                      </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1 leading-relaxed">
                      {isEn
                        ? 'Upload photo scans for each document below (JPG, PNG, WEBP). Photos are automatically compressed client-side. Click any photo to inspect, replace, or delete.'
                        : 'Muat naik salinan foto bagi setiap dokumen di bawah (JPG, PNG, WEBP). Gambar dipadatkan secara automatik. Anda boleh lihat saiz penuh, ganti, atau padam bila-bila masa.'}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 self-start sm:self-center">
                    <span className="font-bold text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/50 px-3 py-1 rounded-xl border border-red-200 dark:border-red-900">
                      {isEn ? 'Required:' : 'Wajib:'} {requiredUploadedCount} / {requiredTotalCount}
                    </span>
                    <span className="font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-900">
                      {completionPct}% {isEn ? 'Completed' : 'Lengkap'}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-600 rounded-full transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>

              {/* -------------------------------------------------------- */}
              {/* PRINT ONLY: CLEAN OFFICIAL COMPACT SUMMARY TABLE         */}
              {/* -------------------------------------------------------- */}
              <div className="hidden print:block border border-slate-300 rounded-lg overflow-hidden mt-1">
                <table className="w-full text-left text-xs text-black border-collapse">
                  <thead className="bg-slate-100 border-b border-slate-300 font-bold uppercase text-[7.5pt]">
                    <tr>
                      <th className="py-1 px-2 w-6 text-center">No</th>
                      <th className="py-1 px-2">Dokumen / Document</th>
                      <th className="py-1 px-2 w-20 text-center">Keperluan</th>
                      <th className="py-1 px-2 w-28 text-center">Status</th>
                      <th className="py-1 px-2 w-20 text-center">Lampiran</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-[6.8pt]">
                    {documentItems.map((item, idx) => {
                      const doc = documentsData[item.id];
                      const isAttached = Boolean(doc?.url);
                      return (
                        <tr key={item.id} className="leading-tight">
                          <td className="py-1 px-2 text-center font-bold text-slate-600">{idx + 1}</td>
                          <td className="py-1 px-2 font-semibold">
                            <div>{item.label}</div>
                            <div className="text-[6.2pt] text-slate-500 font-normal print:hidden">{item.sublabel}</div>
                          </td>
                          <td className="py-1 px-2 text-center">
                            <span className={`px-1.5 py-0.2 rounded text-[6.5pt] font-bold ${item.required ? 'text-red-700 bg-red-50 border border-red-200' : 'text-slate-600 bg-slate-100'}`}>
                              {item.required ? (isEn ? 'Required' : 'Wajib') : (isEn ? 'Optional' : 'Pilihan')}
                            </span>
                          </td>
                          <td className="py-1 px-2 text-center font-bold">
                            {isAttached ? (
                              <span className="text-emerald-700">{isEn ? 'Attached' : 'Dilampirkan'}</span>
                            ) : (
                              <span className="text-slate-400">{isEn ? 'Pending / Not Provided' : 'Belum Disediakan'}</span>
                            )}
                          </td>
                          <td className="py-1 px-2 text-center">
                            {isAttached && doc.url ? (
                              <div className="w-6 h-6 mx-auto rounded border border-slate-300 overflow-hidden">
                                <img src={doc.url} alt={item.label} className="w-full h-full object-cover" />
                              </div>
                            ) : (
                              <span className="text-slate-400 text-[6.5pt]">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* -------------------------------------------------------- */}
              {/* ON-SCREEN: FULL-WIDTH INTERACTIVE DOCUMENT UPLOAD HUB     */}
              {/* -------------------------------------------------------- */}
              <div className="space-y-3 print:hidden">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
                  <span>{isEn ? 'Required Documents Checklist' : 'Senarai Semakan Dokumen'}</span>
                  <span>{isEn ? 'Upload clear photo copies (JPG, PNG, WEBP)' : 'Muat naik foto jelas (JPG, PNG, WEBP)'}</span>
                </div>

                {documentItems.map((item, idx) => {
                  const docData = documentsData[item.id];
                  const hasFile = Boolean(docData?.url);
                  const isUploadingThis = uploadingDocId === item.id;
                  const isDragOver = isDraggingOverDocId === item.id;

                  return (
                    <div
                      key={item.id}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDraggingOverDocId(item.id);
                      }}
                      onDragLeave={() => setIsDraggingOverDocId(null)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setIsDraggingOverDocId(null);
                        const file = e.dataTransfer.files?.[0];
                        if (file) handleUploadDocument(item.id, file);
                      }}
                      className={`relative p-4 rounded-xl border transition-all ${
                        hasFile
                          ? 'bg-slate-50/60 dark:bg-slate-900/30 border-slate-300 dark:border-slate-700 shadow-sm'
                          : 'bg-white dark:bg-[#0d1117] border-slate-200 dark:border-slate-800 shadow-sm'
                      } ${isDragOver ? 'ring-2 ring-red-500 border-red-500' : ''}`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        {/* Item Meta & Guidance */}
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center border border-slate-200 dark:border-slate-700 shrink-0 mt-0.5">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                                {item.label}
                              </span>
                              {item.required ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-red-50 dark:bg-red-950/60 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900 shrink-0">
                                  {isEn ? 'Required' : 'Wajib'}
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shrink-0">
                                  {isEn ? 'Optional' : 'Pilihan'}
                                </span>
                              )}
                              {hasFile && (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 shrink-0">
                                  {isEn ? 'Attached' : 'Dilampirkan'}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1 leading-relaxed">
                              {item.sublabel}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                              {item.guidance}
                            </p>
                          </div>
                        </div>

                        {/* Item Actions / Controls */}
                        <div className="flex items-center gap-2.5 shrink-0 self-end md:self-center">
                          {hasFile ? (
                            <div className="flex items-center gap-2.5 flex-wrap justify-end">
                              {/* Thumbnail */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModalDoc({
                                    id: item.id,
                                    label: item.label,
                                    sublabel: item.sublabel,
                                    url: docData.url!,
                                    fileName: docData.fileName,
                                    fileSize: docData.fileSize,
                                    uploadedAt: docData.uploadedAt,
                                  })
                                }
                                className="w-12 h-12 rounded-lg overflow-hidden border border-slate-300 dark:border-slate-700 shadow-sm hover:border-red-500 transition-all shrink-0 bg-slate-100 dark:bg-slate-800"
                                title={isEn ? 'Click to inspect photo in full resolution' : 'Klik untuk lihat foto saiz penuh'}
                              >
                                <img src={docData.url!} alt={item.label} className="w-full h-full object-cover" />
                              </button>

                              {/* File Specs */}
                              <div className="hidden sm:block text-left text-[11px] text-slate-500 dark:text-slate-400 font-mono leading-tight max-w-[120px] truncate">
                                <div className="truncate font-semibold text-slate-700 dark:text-slate-300">
                                  {docData.fileName || `${item.id}-document.jpg`}
                                </div>
                                <div>{docData.fileSize || 'Attached'}</div>
                              </div>

                              {/* View Fullscreen Button */}
                              <button
                                type="button"
                                onClick={() =>
                                  setPreviewModalDoc({
                                    id: item.id,
                                    label: item.label,
                                    sublabel: item.sublabel,
                                    url: docData.url!,
                                    fileName: docData.fileName,
                                    fileSize: docData.fileSize,
                                    uploadedAt: docData.uploadedAt,
                                  })
                                }
                                className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-all shadow-sm border border-slate-300 dark:border-slate-700"
                                title={isEn ? 'Inspect full size photo' : 'Lihat foto saiz penuh'}
                              >
                                {isEn ? 'View' : 'Lihat'}
                              </button>

                              {/* Replace Button */}
                              <label
                                htmlFor={`replace-file-${item.id}`}
                                className="cursor-pointer px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all border border-slate-300 dark:border-slate-700 shadow-sm"
                                title={isEn ? 'Replace photo' : 'Tukar foto'}
                              >
                                <span>{isEn ? 'Replace' : 'Ganti'}</span>
                                <input
                                  id={`replace-file-${item.id}`}
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadDocument(item.id, file);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </label>

                              {/* Delete Button */}
                              <button
                                type="button"
                                onClick={() => handleDeleteDocument(item.id)}
                                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 transition-all shadow-sm"
                                title={isEn ? 'Delete uploaded photo' : 'Padam foto'}
                              >
                                {isEn ? 'Delete' : 'Padam'}
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                                {isEn ? 'Pending' : 'Belum'}
                              </span>

                              <label
                                htmlFor={`upload-file-${item.id}`}
                                className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                                  isUploadingThis
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : 'bg-red-600 hover:bg-red-700 text-white active:scale-95'
                                }`}
                              >
                                {isUploadingThis ? (
                                  <span>{isEn ? 'Processing...' : 'Memproses...'}</span>
                                ) : (
                                  <span>{isEn ? 'Upload File' : 'Muat Naik Fail'}</span>
                                )}
                                <input
                                  id={`upload-file-${item.id}`}
                                  type="file"
                                  accept="image/*"
                                  disabled={isUploadingThis}
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleUploadDocument(item.id, file);
                                    e.target.value = '';
                                  }}
                                  className="hidden"
                                />
                              </label>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* ------------------------------------------------------------- */}
        {/* SECTION 5: FOR OFFICE/AGENT USE */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 print:p-1.5 rounded-xl print:rounded-lg font-extrabold text-sm print:text-[8pt] uppercase tracking-wider shadow-sm mt-8 print:mt-1">
          {isEn ? 'SECTION 5: FOR OFFICE / AGENT USE' : 'SEKSYEN 5: KEGUNAAN PEJABAT / EJEN'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-1.5 bg-slate-50 dark:bg-slate-950 p-5 print:p-1.5 rounded-2xl print:rounded-lg border border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Date received (DD/MM/YYYY):' : 'Tarikh Diterima (DD/MM/YYYY):'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[8pt] focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Processing officer:' : 'Pegawai Yang Memproses'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Processing Officer Name' : 'Nama Pegawai / Ejen Audit'}
              value={processingOfficer}
              onChange={(e) => setProcessingOfficer(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[8pt] focus:ring-1 focus:ring-red-600"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Status:' : 'Status Permohonan'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[8pt] font-bold focus:ring-1 focus:ring-red-600"
            >
              <option value={isEn ? 'In Process' : 'Dalam Proses'}>{isEn ? 'In Process' : 'Dalam Proses'}</option>
              <option value={isEn ? 'Incomplete' : 'Belum Lengkap'}>{isEn ? 'Incomplete' : 'Belum Lengkap'}</option>
              <option value={isEn ? 'Approved' : 'Diluluskan'}>{isEn ? 'Approved' : 'Diluluskan'}</option>
              <option value={isEn ? 'Rejected' : 'Ditolak'}>{isEn ? 'Rejected' : 'Ditolak'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 print:mb-0.5">
              {isEn ? 'Account activation date (DD/MM/YYYY):' : 'Tarikh Akaun Diaktifkan (DD/MM/YYYY):'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              value={activationDate}
              onChange={(e) => setActivationDate(e.target.value)}
              className="w-full px-4 py-2.5 print:px-2 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[8pt] focus:ring-1 focus:ring-red-600"
            />
          </div>

          {(status === 'Rejected' || status === 'Ditolak') && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-red-600 uppercase tracking-wider mb-1 print:mb-0.5">
                {isEn ? 'Reason for rejection:' : 'Sebab Penolakan'}
              </label>
              <textarea
                rows={2}
                placeholder={isEn ? 'State reason for rejection...' : 'Nyatakan sebab permohonan ditolak...'}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-300 dark:border-red-800 text-xs text-red-900 dark:text-red-200"
              />
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 6: DISCLAIMER & TERMS OF SERVICE */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 print:p-1.5 rounded-xl print:rounded-lg font-extrabold text-sm print:text-[8pt] uppercase tracking-wider shadow-sm mt-8 print:mt-1">
          {isEn ? 'SECTION 6: DISCLAIMER & TERMS OF SERVICE' : 'SEKSYEN 6: PENAFIAN & TERMA PERKHIDMATAN'}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-6 print:p-1.5 rounded-2xl print:rounded-lg border border-slate-200 dark:border-slate-800 space-y-3 print:space-y-0.5 text-xs print:text-[6.2pt] leading-relaxed text-slate-700 dark:text-slate-300">
          <ol className="list-decimal pl-4 print:pl-3 space-y-2 print:space-y-0 print-terms-grid text-xs print:text-[6.2pt]">
            {isEn ? (
              <>
                <li>This form is submitted to collect information and process an application to register a business on the Foodpanda, GrabFood and/or ShopeeFood platforms.</li>
                <li>The Company acts as a coordinator with the service providers to assist with the registration process. Approval is entirely subject to the assessment, terms and policies of the platform applied for.</li>
                <li>The applicant is responsible for ensuring that all information and documents submitted are true, complete and up to date. The applicant shall be responsible for any delay or rejection resulting from inaccurate or incomplete information.</li>
                <li>If the platform requires additional documents or information, the applicant must submit them within the stated period to avoid processing delays.</li>
                <li>The Company shall not be responsible for any changes to policies, terms, commissions, fees, coverage areas, application features or procedures set by Foodpanda, GrabFood or ShopeeFood.</li>
                <li>All personal information and documents received will be used only to process the application and related matters, in accordance with the <strong>Personal Data Protection Act 2010 [Act 709]</strong>.</li>
                <li>Any service fees paid are subject to the Company's terms and conditions. Fees already used for processing work, document preparation or application submission may be non-refundable.</li>
                <li>The Company reserves the right to reject or discontinue the processing of an application if the information provided is found to be false, misleading, incomplete or in violation of any applicable law.</li>
                <li>By signing this form, the applicant confirms that they have read, understood and agreed to all the terms, conditions and disclaimers stated in this form.</li>
              </>
            ) : (
              <>
                <li>Borang ini dikemukakan bagi tujuan pengumpulan maklumat dan pemprosesan permohonan pendaftaran perniagaan ke platform Foodpanda, GrabFood dan/atau ShopeeFood.</li>
                <li>Syarikat bertindak sebagai penyelaras kepada penyedia perkhidmatan bagi membantu proses pendaftaran. Keputusan kelulusan adalah tertakluk sepenuhnya kepada penilaian, syarat dan polisi platform yang dipohon.</li>
                <li>Pemohon bertanggungjawab memastikan semua maklumat dan dokumen yang dikemukakan adalah benar, lengkap dan terkini. Sebarang kelewatan atau penolakan akibat maklumat yang tidak tepat atau tidak lengkap adalah di bawah tanggungjawab pemohon.</li>
                <li>Sekiranya platform memerlukan dokumen atau maklumat tambahan, pemohon hendaklah mengemukakannya dalam tempoh yang dimaklumkan bagi mengelakkan kelewatan pemprosesan.</li>
                <li>Syarikat tidak bertanggungjawab terhadap sebarang perubahan dasar, syarat, komisen, fi, kawasan liputan, ciri aplikasi atau prosedur yang ditetapkan oleh Foodpanda, GrabFood atau ShopeeFood.</li>
                <li>Segala maklumat peribadi dan dokumen yang diterima akan digunakan hanya bagi tujuan pemprosesan permohonan serta urusan berkaitan, selaras dengan <strong>Akta Perlindungan Data Peribadi 2010 [Akta 709]</strong>.</li>
                <li>Sebarang fi perkhidmatan yang telah dibayar adalah tertakluk kepada terma dan syarat syarikat. Fi yang telah digunakan bagi kerja-kerja pemprosesan, penyediaan dokumen atau penghantaran permohonan mungkin tidak boleh dituntut semula.</li>
                <li>Syarikat berhak menolak atau menghentikan pemprosesan permohonan sekiranya didapati maklumat yang diberikan adalah palsu, mengelirukan, tidak lengkap atau melanggar mana-mana undang-undang yang berkuat kuasa.</li>
                <li>Dengan menandatangani borang ini, pemohon mengesahkan bahawa telah membaca, memahami dan bersetuju dengan semua terma, syarat dan penafian yang dinyatakan di dalam borang ini.</li>
              </>
            )}
          </ol>

          <div className="pt-4 print:pt-1 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 print:gap-1.5 cursor-pointer bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-3.5 print:p-1 rounded-xl print:rounded-md">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 accent-red-600 w-4 h-4 print:w-3 print:h-3"
              />
              <span className="font-bold text-slate-900 dark:text-red-200 text-xs print:text-[6.8pt]">
                {isEn
                  ? "I confirm that I have read, understood and agreed to the Company's Terms of Service, Disclaimer and Privacy Policy."
                  : 'Saya mengesahkan bahawa saya telah membaca, memahami dan bersetuju dengan Terma Perkhidmatan, Penafian dan Dasar Privasi syarikat.'}
              </span>
            </label>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 7: CONFIRMATION & SIGNATURE */}
        {/* ------------------------------------------------------------- */}
        <div className="print:mt-1">
          <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-3 print:p-1.5 rounded-xl print:rounded-lg font-extrabold text-sm print:text-[8pt] uppercase tracking-wider shadow-sm mt-8 print:mt-0">
            {isEn ? 'SECTION 7: CONFIRMATION & SIGNATURE' : 'SEKSYEN 7: PENGESAHAN & TANDATANGAN'}
          </div>

          <div className="space-y-4 print:space-y-1 mt-4 print:mt-1">
            {/* Declaration Text */}
            <div className="bg-slate-50 dark:bg-slate-950 p-4 print:p-1.5 rounded-xl print:rounded-md text-xs print:text-[6.5pt] italic text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-slate-800">
              {isEn ? (
                <>
                  <p className="font-semibold mb-1 print:hidden text-slate-900 dark:text-white">Applicant Confirmation (Merchant)</p>
                  <p>I confirm that all information, documents and particulars submitted in this form are true, accurate and complete to the best of my knowledge under the Personal Data Protection Act 2010.</p>
                </>
              ) : (
                <p>Saya mengesahkan bahawa semua maklumat, dokumen dan butiran yang dikemukakan dalam borang ini adalah benar, tepat dan lengkap setakat pengetahuan saya di bawah Akta Perlindungan Data Peribadi 2010.</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 print-grid-2 signature-grid gap-4 print:gap-1.5">
              {/* Merchant Signature Box */}
              <div className="p-4 print:p-1.5 rounded-2xl print:rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 print:space-y-0.5 signature-box break-inside-avoid">
                <h4 className="font-bold text-xs print:text-[7pt] uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 print:pb-0.5">
                  {isEn ? 'Applicant Confirmation (Merchant)' : 'Pengesahan Pemohon (Peniaga)'}
                </h4>
              
              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Name:' : 'Nama Peniaga:'}</label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? "Merchant Name" : "Nama Pengesah Peniaga"}
                  value={merchantSignatureName}
                  onChange={(e) => setMerchantSignatureName(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Identity Card No.:' : 'No. Kad Pengenalan:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Identity Card / Passport No." : "Nombor IC / Pasport"}
                  value={merchantSignatureIc}
                  onChange={(e) => setMerchantSignatureIc(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  required
                  value={merchantSignatureDate}
                  onChange={(e) => setMerchantSignatureDate(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Agent Signature Box */}
            <div className="p-4 print:p-1.5 rounded-2xl print:rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 print:space-y-0.5 signature-box break-inside-avoid">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2 print:pb-0.5">
                <h4 className="font-bold text-xs print:text-[7pt] uppercase tracking-wider text-slate-900 dark:text-white">
                  {isEn ? 'Agent Confirmation' : 'Pengesahan Ejen'}
                </h4>
                {isLoggedInAgent && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] print:text-[6pt] font-extrabold bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800">
                    {isEn ? 'Verified Agent' : 'Ejen Disahkan'}
                  </span>
                )}
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Name:' : 'Nama Ejen:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Agent Name" : "Nama Ejen Pengesah"}
                  value={agentSignatureName}
                  onChange={(e) => setAgentSignatureName(e.target.value)}
                  readOnly={isLoggedInAgent}
                  className={`w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md border text-xs print:text-[7.5pt] transition-all ${
                    isLoggedInAgent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-red-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Agent ID No. / Email:' : 'No. ID / E-mel Ejen:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Agent ID No. (e.g. AGT-8821)" : "ID Ejen (Contoh: AGT-8821)"}
                  value={agentSignatureId}
                  onChange={(e) => setAgentSignatureId(e.target.value)}
                  readOnly={isLoggedInAgent}
                  className={`w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md border text-xs print:text-[7.5pt] transition-all ${
                    isLoggedInAgent
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 cursor-not-allowed'
                      : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-1 focus:ring-red-600'
                  }`}
                />
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  value={agentSignatureDate}
                  onChange={(e) => setAgentSignatureDate(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Reviewer Box */}
            <div className="p-4 print:p-1.5 rounded-2xl print:rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 print:space-y-0.5 signature-box break-inside-avoid">
              <h4 className="font-bold text-xs print:text-[7pt] uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 print:pb-0.5">
                {isEn ? 'Reviewed By' : 'Disemak Oleh (Penyelia)'}
              </h4>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Name:' : 'Nama:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Reviewer Name" : "Nama Penyelia"}
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Position:' : 'Jawatan:'}</label>
                <input
                  type="text"
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  value={reviewerDate}
                  onChange={(e) => setReviewerDate(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>

            {/* Approver Box */}
            <div className="p-4 print:p-1.5 rounded-2xl print:rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-3 print:space-y-0.5 signature-box break-inside-avoid">
              <h4 className="font-bold text-xs print:text-[7pt] uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-2 print:pb-0.5">
                {isEn ? 'Approved By' : 'Diluluskan Oleh (Pengurus)'}
              </h4>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Name:' : 'Nama:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Approver Name" : "Nama Pengurus Kelulusan"}
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Position:' : 'Jawatan:'}</label>
                <input
                  type="text"
                  value={approverRole}
                  onChange={(e) => setApproverRole(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>

              <div>
                <label className="block text-[11px] print:text-[6.5pt] font-semibold text-slate-500 mb-1 print:mb-0">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  value={approverDate}
                  onChange={(e) => setApproverDate(e.target.value)}
                  className="w-full px-3 py-2 print:px-1.5 print:py-0.5 rounded-xl print:rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs print:text-[7.5pt] focus:ring-1 focus:ring-red-600"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Submit Action Button */}
        <div className="pt-4 print:hidden">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-red-600/25 transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{isEn ? 'PROCESSING REGISTRATION...' : 'MEMPROSES PENDAFTARAN PENIAGA...'}</span>
              </>
            ) : (
              <span>{isEn ? 'SUBMIT MERCHANT REGISTRATION FORM' : 'HANTAR BORANG PENDAFTARAN PENIAGA'}</span>
            )}
          </button>
        </div>

      </form>

      {/* ============================================================= */}
      {/* HIGH-RESOLUTION DOCUMENT LIGHTBOX / INSPECTOR MODAL */}
      {/* ============================================================= */}
      {previewModalDoc && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => {
            setPreviewModalDoc(null);
            setZoomLevel(1);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn print:hidden cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl w-full bg-white dark:bg-[#0d1117] border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92dvh] cursor-default"
          >
            
            {/* Modal Header */}
            <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950">
              <div className="min-w-0">
                <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                  {previewModalDoc.label}
                </h3>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5 truncate">
                  <span>{previewModalDoc.fileName || `${previewModalDoc.id}.jpg`}</span>
                  {previewModalDoc.fileSize && <span>• {previewModalDoc.fileSize}</span>}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewModalDoc(null);
                    setZoomLevel(1);
                  }}
                  className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs transition-all shadow-sm"
                  title="Close (Esc)"
                >
                  {isEn ? 'Close' : 'Tutup'}
                </button>
              </div>
            </div>

            {/* Modal Image Viewport */}
            <div className="relative flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4 min-h-[300px] max-h-[68vh]">
              <img
                src={previewModalDoc.url}
                alt={previewModalDoc.label}
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center center' }}
                className="max-w-full max-h-[62vh] object-contain rounded-lg transition-transform duration-200 shadow-2xl"
              />
            </div>

            {/* Modal Bottom Controls Bar */}
            <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1.5 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.max(z - 0.25, 0.5))}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center"
                  title="Zoom Out"
                >
                  –
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel(1)}
                  className="px-2 h-7 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 font-bold font-mono text-slate-700 dark:text-slate-200 text-[11px] flex items-center justify-center"
                  title="Reset Zoom"
                >
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button
                  type="button"
                  onClick={() => setZoomLevel((z) => Math.min(z + 0.25, 3))}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center"
                  title="Zoom In"
                >
                  +
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {/* Download / Open */}
                <a
                  href={previewModalDoc.url}
                  download={previewModalDoc.fileName || `${previewModalDoc.id}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs transition-all shadow-sm"
                >
                  {isEn ? 'Download' : 'Muat Turun'}
                </a>

                {/* Replace File */}
                <label
                  htmlFor={`modal-replace-${previewModalDoc.id}`}
                  className="cursor-pointer px-3 py-1.5 rounded-lg bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 font-semibold text-xs transition-all shadow-sm"
                >
                  <span>{isEn ? 'Replace' : 'Ganti Fail'}</span>
                  <input
                    id={`modal-replace-${previewModalDoc.id}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadDocument(previewModalDoc.id, file);
                        setPreviewModalDoc(null);
                        setZoomLevel(1);
                      }
                    }}
                    className="hidden"
                  />
                </label>

                {/* Delete File */}
                <button
                  type="button"
                  onClick={() => handleDeleteDocument(previewModalDoc.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-all shadow-sm"
                >
                  {isEn ? 'Delete' : 'Padam'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
