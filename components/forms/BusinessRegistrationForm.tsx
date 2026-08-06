'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Locale } from '../../lib/i18n';
import { formatDateToDDMMYYYY } from '../../lib/dateUtils';

interface BusinessRegistrationFormProps {
  lang?: Locale;
}

export default function BusinessRegistrationForm({ lang = 'ms' }: BusinessRegistrationFormProps) {
  const isEn = lang === 'en';

  const documentItems = [
    { id: 'ic', label: isEn ? 'Identity Card' : 'Kad Pengenalan' },
    { id: 'ssm', label: 'SSM' },
    { id: 'pbt', label: isEn ? 'Local Authority Licence' : 'Lesen PBT' },
    { id: 'bank', label: isEn ? 'Bank Statement' : 'Penyata Bank' },
    { id: 'logo', label: 'Logo' },
    { id: 'premis', label: isEn ? 'Business Premises Photo' : 'Gambar Premis' },
    { id: 'menu', label: isEn ? 'Menu Photo' : 'Gambar Menu' },
    { id: 'harga', label: isEn ? 'Price List' : 'Senarai Harga' },
    { id: 'halal', label: isEn ? 'Halal Certificate' : 'Sijil Halal' },
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

  // Section 4: Document Checklist / Senarai Semak Dokumen
  const [documentsChecklist, setDocumentsChecklist] = useState<Record<string, 'Received' | 'Not Received' | 'Diterima' | 'Belum'>>({
    ic: isEn ? 'Received' : 'Diterima',
    ssm: isEn ? 'Received' : 'Diterima',
    pbt: isEn ? 'Not Received' : 'Belum',
    bank: isEn ? 'Received' : 'Diterima',
    logo: isEn ? 'Received' : 'Diterima',
    premis: isEn ? 'Received' : 'Diterima',
    menu: isEn ? 'Received' : 'Diterima',
    harga: isEn ? 'Received' : 'Diterima',
    halal: isEn ? 'Not Received' : 'Belum',
  });
  const [shopPhotoUrl, setShopPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

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

  // Helper toggle doc checklist
  const toggleDocChecklist = (docId: string, value: any) => {
    setDocumentsChecklist((prev) => ({ ...prev, [docId]: value }));
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert(isEn ? 'Please upload a valid image file (JPG, PNG, WEBP).' : 'Sila muat naik fail imej yang sah (JPG, PNG, WEBP).');
      return;
    }

    setIsUploadingPhoto(true);
    const reader = new FileReader();
    reader.onload = () => {
      setShopPhotoUrl(reader.result as string);
      setIsUploadingPhoto(false);
    };
    reader.onerror = () => {
      alert(isEn ? 'Failed to read image file.' : 'Gagal membaca fail imej.');
      setIsUploadingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

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
        documentsChecklist,
        shopPhotoUrl,
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
    <div className="max-w-4xl mx-auto bg-white dark:bg-black text-black dark:text-white p-6 sm:p-10 rounded-3xl shadow-xl border border-[#b0712d]">
      
      {/* 📄 DOCUMENT HEADER */}
      <div className="border-b-2 border-[#b0712d] pb-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-block px-3 py-1 bg-[#aa0505] text-white font-extrabold text-xs tracking-widest rounded-md uppercase mb-2">
            {isEn ? 'MERCHANT FORM' : 'BORANG PENIAGA'}
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-black dark:text-white">
            {isEn ? 'MERCHANT RECRUITMENT & REGISTRATION CHECKLIST' : 'SENARAI SEMAK PEREKRUTAN & PENDAFTARAN PENIAGA'}
          </h1>
          <p className="text-sm font-bold text-[#b0712d] mt-1">
            Foodpanda, GrabFood and ShopeeFood — Malaysia
          </p>
          <p className="text-xs text-[#b0712d] italic mt-2 max-w-2xl leading-relaxed">
            {isEn
              ? 'This form is used to register and assess individuals or companies applying to become merchants.'
              : 'Borang ini digunakan untuk pendaftaran dan penilaian individu atau syarikat yang memohon menjadi peniaga.'}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-white p-2 flex items-center justify-center border border-[#b0712d]">
            <Image src="/logo.png" alt="Legacy Cuisine Logo" width={80} height={80} className="object-contain" />
          </div>
          <div className="flex gap-2 text-xs">
            <div className="bg-white dark:bg-black px-2 py-1 rounded border border-[#b0712d]">
              <span className="font-semibold text-[#b0712d]">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</span> {formatDateToDDMMYYYY(date)}
            </div>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {successMsg && (
        <div className="mb-6 p-4 bg-white dark:bg-black border border-[#b0712d] text-black dark:text-white text-sm font-semibold rounded-2xl animate-fadeIn">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="mb-6 p-4 bg-[#aa0505]/15 border border-[#aa0505] text-[#aa0505] text-sm font-semibold rounded-2xl animate-fadeIn">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ------------------------------------------------------------- */}
        {/* HEADER META ROW: DATE & MEMBER NO */}
        {/* ------------------------------------------------------------- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-black p-4 rounded-2xl border border-[#b0712d]">
          <div>
            <label className="block text-xs font-bold text-[#b0712d] uppercase tracking-wider mb-1">
              {isEn ? 'Date (DD/MM/YYYY) *' : 'Tarikh Permohonan (DD/MM/YYYY) *'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-[#b0712d] text-black dark:text-white text-sm focus:outline-none focus:border-[#aa0505] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#b0712d] uppercase tracking-wider mb-1">
              {isEn ? 'Member No.' : 'No. Ahli / ID Peniaga'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'e.g. MCH-9941' : 'Contoh: MCH-9941'}
              value={memberNo}
              onChange={(e) => setMemberNo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-[#b0712d] text-black dark:text-white text-sm focus:outline-none focus:border-[#aa0505] transition-all"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 1: MERCHANT INFORMATION */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-[#aa0505] text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm">
          {isEn ? '1. MERCHANT INFORMATION' : '1. MAKLUMAT PENIAGA'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-[#b0712d] uppercase tracking-wider mb-1">
              {isEn ? 'Full Name *' : 'Nama Penuh *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Full name as per Identity Card / Passport' : 'Nama penuh seperti dalam Kad Pengenalan / Pasport'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-[#b0712d] text-black dark:text-white text-sm focus:outline-none focus:border-[#aa0505] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#b0712d] uppercase tracking-wider mb-1">
              {isEn ? 'Company Name *' : 'Nama Syarikat / Kedai *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Registered business / store name' : 'Nama pendaftaran perniagaan / kedai'}
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-white dark:bg-black border border-[#b0712d] text-black dark:text-white text-sm focus:outline-none focus:border-[#aa0505] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Registration No.' : 'No. Pendaftaran Syarikat (SSM)'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'e.g. 202301099882 (150992-X)' : 'Contoh: 202301099882 (150992-X)'}
              value={registrationNo}
              onChange={(e) => setRegistrationNo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Identity Card / Passport No. *' : 'No. Kad Pengenalan / Pasport *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'e.g. 881024-08-6631' : 'Contoh: 881024-08-6631'}
              value={icPassportNo}
              onChange={(e) => setIcPassportNo(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Gender' : 'Jantina'}
            </label>
            <div className="flex gap-4 pt-2">
              {(isEn ? ['Male', 'Female'] : ['Lelaki', 'Perempuan']).map((g) => (
                <label key={g} className="flex items-center gap-2 cursor-pointer text-sm font-semibold">
                  <input
                    type="radio"
                    name="gender"
                    value={g}
                    checked={gender === g}
                    onChange={(e) => setGender(e.target.value)}
                    className="accent-amber-500"
                  />
                  <span>{g}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Date of Birth (DD/MM/YYYY)' : 'Tarikh Lahir (DD/MM/YYYY)'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Age' : 'Umur'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'e.g. 35 Years Old' : 'Contoh: 35 Tahun'}
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Religion' : 'Agama'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Islam / Buddhism / Hinduism / Christianity' : 'Islam / Buddha / Hindu / Kristian'}
              value={religion}
              onChange={(e) => setReligion(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Race' : 'Bangsa'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Malay / Chinese / Indian / Others' : 'Melayu / Cina / India / Lain-lain'}
              value={race}
              onChange={(e) => setRace(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Nationality' : 'Kewarganegaraan'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Malaysian' : 'Warganegara Malaysia'}
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Telephone No. *' : 'No. Telefon *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'e.g. 012-3456789' : 'Contoh: 012-3456789'}
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Email *' : 'E-mel *'}
            </label>
            <input
              type="email"
              required
              placeholder="name@domain.com"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Mailing Address *' : 'Alamat Surat-Menyurat *'}
            </label>
            <textarea
              required
              rows={2}
              placeholder={isEn ? 'Full residential or mailing address' : 'Alamat kediaman / surat-menyurat penuh'}
              value={mailingAddress}
              onChange={(e) => setMailingAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Business Premises Address *' : 'Alamat Premis Perniagaan *'}
            </label>
            <textarea
              required
              rows={2}
              placeholder={isEn ? 'Full physical store/premises address' : 'Alamat kedai / premis fizikal perniagaan'}
              value={storeAddress}
              onChange={(e) => setStoreAddress(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 2: OPERATING INFORMATION */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-900 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
          {isEn ? '2. OPERATING INFORMATION' : '2. MAKLUMAT OPERASI'}
        </div>

        <div className="space-y-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              {isEn ? 'Operating Days:' : 'Hari Operasi:'}
            </label>
            <div className="flex flex-wrap gap-2">
              {daysList.map((day) => {
                const isSelected = operatingDays.includes(day);
                return (
                  <button
                    type="button"
                    key={day}
                    onClick={() => toggleOperatingDay(day)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-md'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-800'
                    }`}
                  >
                    {isSelected ? '✓ ' : ''}{day}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Operating Hours — Time:' : 'Waktu Operasi — Masa:'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'e.g. 8:00 AM - 10:00 PM' : 'Contoh: 8:00 AM - 10:00 PM'}
              value={operatingHours}
              onChange={(e) => setOperatingHours(e.target.value)}
              className="w-full max-w-md px-4 py-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 3: BANK ACCOUNT INFORMATION */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-900 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
          {isEn ? '3. BANK ACCOUNT INFORMATION' : '3. MAKLUMAT AKAUN BANK'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Bank Name *' : 'Nama Bank *'}
            </label>
            <input
              type="text"
              required
              placeholder="Maybank / CIMB / RHB / Public Bank"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? "Account Holder's Name *" : 'Nama Pemegang Akaun *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Must match IC / Company Name' : 'Mesti sama dengan IC / Nama Syarikat'}
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Account No. *' : 'No. Akaun *'}
            </label>
            <input
              type="text"
              required
              placeholder={isEn ? 'Bank Account Number' : 'Nombor Akaun Bank'}
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 4: DOCUMENT CHECKLIST */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-900 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
          {isEn ? '4. DOCUMENT CHECKLIST' : '4. SENARAI SEMAK DOKUMEN & PREMIS'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Document Checklist Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs text-slate-800 dark:text-slate-200">
              <thead className="bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white font-bold uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-4">{isEn ? 'Document' : 'Dokumen'}</th>
                  <th className="py-3 px-3 w-28 text-center">{isEn ? 'Received' : 'Diterima'}</th>
                  <th className="py-3 px-3 w-28 text-center">{isEn ? 'Not Received' : 'Belum'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {documentItems.map((item) => {
                  const statusVal = documentsChecklist[item.id] || (isEn ? 'Not Received' : 'Belum');
                  const isReceived = statusVal === 'Received' || statusVal === 'Diterima';
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="py-2.5 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        {item.label}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleDocChecklist(item.id, isEn ? 'Received' : 'Diterima')}
                          className={`px-3 py-1 rounded-lg font-extrabold transition-all border ${
                            isReceived
                              ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-300 dark:border-slate-800'
                          }`}
                        >
                          ✓ {isEn ? 'Received' : 'Diterima'}
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleDocChecklist(item.id, isEn ? 'Not Received' : 'Belum')}
                          className={`px-3 py-1 rounded-lg font-extrabold transition-all border ${
                            !isReceived
                              ? 'bg-amber-500/20 text-amber-500 border-amber-500/50'
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-400 border-slate-300 dark:border-slate-800'
                          }`}
                        >
                          {isEn ? 'Not Received' : 'Belum'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Premise Photo Uploader */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
                {isEn ? 'Upload Business Premises Photo *' : 'Muat Naik Gambar Premis Perniagaan *'}
              </label>

              <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-6 text-center bg-slate-50 dark:bg-slate-950/60 hover:border-amber-500/50 transition-colors flex flex-col items-center justify-center min-h-[220px]">
                {shopPhotoUrl ? (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden group">
                    <img src={shopPhotoUrl} alt="Premises Photo" className="w-full h-full object-cover rounded-xl" />
                    <div className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-amber-500 text-slate-950 px-4 py-2 rounded-lg font-bold text-xs">
                        {isEn ? 'Change Photo' : 'Tukar Gambar Premis'}
                        <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer w-full flex flex-col items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3 text-2xl font-bold">
                      📷
                    </div>
                    <div className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
                      {isEn ? 'Upload Premises Photo' : 'Muat Naik Gambar Premis'}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      {isUploadingPhoto ? (isEn ? 'Processing file...' : 'Memproses fail...') : (isEn ? 'Choose image file (JPG, PNG, WEBP)' : 'Pilih fail gambar (JPG, PNG, WEBP)')}
                    </div>
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex gap-3 items-start">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                i
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                <span className="font-semibold text-slate-900 dark:text-slate-200">{isEn ? 'Guidance:' : 'Panduan:'}</span>{' '}
                {isEn
                  ? 'Please ensure the premises photo clearly displays the shop frontage and main entrance.'
                  : 'Sila pastikan paparan gambar premis jelas menunjukkan papan tanda nama kedai dan pintu masuk utama.'}
              </div>
            </div>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 5: FOR OFFICE/AGENT USE */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-900 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
          {isEn ? '5. FOR OFFICE/AGENT USE' : '5. BAHAGIAN KEGUNAAN PEJABAT / EJEN'}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200 dark:border-slate-850">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Date received (DD/MM/YYYY):' : 'Tarikh Diterima (DD/MM/YYYY):'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Processing officer:' : 'Pegawai Yang Memproses'}
            </label>
            <input
              type="text"
              placeholder={isEn ? 'Processing Officer Name' : 'Nama Pegawai / Ejen Audit'}
              value={processingOfficer}
              onChange={(e) => setProcessingOfficer(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Status:' : 'Status Permohonan'}
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as any)}
              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs font-bold"
            >
              <option value={isEn ? 'In Process' : 'Dalam Proses'}>{isEn ? 'In Process' : 'Dalam Proses'}</option>
              <option value={isEn ? 'Incomplete' : 'Belum Lengkap'}>{isEn ? 'Incomplete' : 'Belum Lengkap'}</option>
              <option value={isEn ? 'Approved' : 'Diluluskan'}>{isEn ? 'Approved' : 'Diluluskan'}</option>
              <option value={isEn ? 'Rejected' : 'Ditolak'}>{isEn ? 'Rejected' : 'Ditolak'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {isEn ? 'Account activation date (DD/MM/YYYY):' : 'Tarikh Akaun Diaktifkan (DD/MM/YYYY):'}
            </label>
            <input
              type="date"
              lang="en-GB"
              placeholder="dd/mm/yyyy"
              value={activationDate}
              onChange={(e) => setActivationDate(e.target.value)}
              className="w-full px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
            />
          </div>

          {(status === 'Rejected' || status === 'Ditolak') && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-rose-500 uppercase tracking-wider mb-1">
                {isEn ? 'Reason for rejection:' : 'Sebab Penolakan'}
              </label>
              <textarea
                rows={2}
                placeholder={isEn ? 'State reason for rejection...' : 'Nyatakan sebab permohonan ditolak...'}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-4 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-300 dark:border-rose-800 text-xs text-rose-900 dark:text-rose-200"
              />
            </div>
          )}
        </div>

        {/* ------------------------------------------------------------- */}
        {/* SECTION 6: DISCLAIMER & TERMS OF SERVICE */}
        {/* ------------------------------------------------------------- */}
        <div className="bg-slate-900 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
          {isEn ? 'DISCLAIMER & TERMS OF SERVICE' : 'PENAFIAN & TERMA PERKHIDMATAN'}
        </div>

        <div className="bg-slate-50 dark:bg-slate-950 p-6 rounded-2xl border border-slate-200 dark:border-slate-850 space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <ol className="list-decimal pl-4 space-y-2">
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

          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <label className="flex items-start gap-3 cursor-pointer bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl">
              <input
                type="checkbox"
                required
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 accent-amber-500 w-4 h-4"
              />
              <span className="font-bold text-slate-900 dark:text-amber-300 text-xs">
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
        <div className="bg-slate-900 text-white p-3 rounded-xl font-extrabold text-sm uppercase tracking-wider shadow-sm mt-8">
          {isEn ? 'CONFIRMATION & SIGNATURE' : 'PENGESAHAN & TANDATANGAN'}
        </div>

        <div className="space-y-6">
          {/* Declaration Text */}
          <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-xl text-xs italic text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-200 dark:border-slate-850">
            {isEn ? (
              <>
                <p className="font-semibold mb-1">Applicant Confirmation (Merchant)</p>
                <p className="mb-2">I confirm that all information, documents and particulars submitted in this form are true, accurate and complete to the best of my knowledge. I also agree to cooperate if additional information or documents are required to process the application.</p>
                <p>I agree that the personal information and documents submitted may be collected, used and processed by the agent for registration, verification and matters relating to Foodpanda, GrabFood and ShopeeFood, in accordance with the Personal Data Protection Act 2010.</p>
              </>
            ) : (
              <p>Saya mengesahkan bahawa semua maklumat, dokumen dan butiran yang dikemukakan dalam borang ini adalah benar, tepat dan lengkap setakat pengetahuan saya. Saya juga bersetuju memberikan kerjasama sekiranya maklumat atau dokumen tambahan diperlukan bagi tujuan pemprosesan permohonan.</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Merchant Signature Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-850 pb-2">
                {isEn ? 'Applicant Confirmation (Merchant)' : 'Pengesahan Pemohon (Peniaga)'}
              </h4>
              
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Name:' : 'Nama Peniaga:'}</label>
                <input
                  type="text"
                  required
                  placeholder={isEn ? "Merchant Name" : "Nama Pengesah Peniaga"}
                  value={merchantSignatureName}
                  onChange={(e) => setMerchantSignatureName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Identity Card No.:' : 'No. Kad Pengenalan:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Identity Card / Passport No." : "Nombor IC / Pasport"}
                  value={merchantSignatureIc}
                  onChange={(e) => setMerchantSignatureIc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  required
                  value={merchantSignatureDate}
                  onChange={(e) => setMerchantSignatureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Agent Signature Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-850 pb-2">
                {isEn ? 'Agent Confirmation' : 'Pengesahan Ejen'}
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Name:' : 'Nama Ejen:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Agent Name" : "Nama Ejen Pengesah"}
                  value={agentSignatureName}
                  onChange={(e) => setAgentSignatureName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Agent ID No.:' : 'No. ID Ejen:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Agent ID No. (e.g. AGT-8821)" : "ID Ejen (Contoh: AGT-8821)"}
                  value={agentSignatureId}
                  onChange={(e) => setAgentSignatureId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  value={agentSignatureDate}
                  onChange={(e) => setAgentSignatureDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Reviewer Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-850 pb-2">
                {isEn ? 'Reviewed By' : 'Disemak Oleh (Penyelia)'}
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Name:' : 'Nama:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Reviewer Name" : "Nama Penyelia"}
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Position:' : 'Jawatan:'}</label>
                <input
                  type="text"
                  value={reviewerRole}
                  onChange={(e) => setReviewerRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  value={reviewerDate}
                  onChange={(e) => setReviewerDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>
            </div>

            {/* Approver Box */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-850 space-y-3">
              <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white border-b border-slate-200 dark:border-slate-850 pb-2">
                {isEn ? 'Approved By' : 'Diluluskan Oleh (Pengurus)'}
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Name:' : 'Nama:'}</label>
                <input
                  type="text"
                  placeholder={isEn ? "Approver Name" : "Nama Pengurus Kelulusan"}
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Position:' : 'Jawatan:'}</label>
                <input
                  type="text"
                  value={approverRole}
                  onChange={(e) => setApproverRole(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">{isEn ? 'Date (DD/MM/YYYY):' : 'Tarikh (DD/MM/YYYY):'}</label>
                <input
                  type="date"
                  lang="en-GB"
                  placeholder="dd/mm/yyyy"
                  value={approverDate}
                  onChange={(e) => setApproverDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 px-6 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl shadow-amber-500/20 transition-all transform active:scale-98 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-slate-950" fill="none" viewBox="0 0 24 24">
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
    </div>
  );
}
