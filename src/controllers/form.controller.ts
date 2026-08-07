import { Request, Response } from 'express';
import { prisma } from '../prisma';

/**
 * Helper to sanitize string inputs: trims whitespace and defaults empty values to "-"
 */
function s(val: any, fallback: string = '-'): string {
  if (val === null || val === undefined) return fallback;
  const str = String(val).trim();
  return str === '' ? fallback : str;
}

/**
 * Controller for handling Merchant Recruitment & Registration Checklist submissions.
 */
export async function createChecklist(req: Request, res: Response): Promise<void> {
  try {
    const {
      agentName,
      date,
      merchant,
      vendor,
      personInCharge,
      mobileNumber,
      emailAddress,
      outletAddress,
      numberOfOutlets,
      businessType,
      targetPlatform,
      leadStatus,
      language,
      agentSelfCheck,
      agentNotes,
      qualificationCheck,
      yesScore,
      noScore,
      naScore,
      totalChecked,
    } = req.body;

    const sAgentName = s(agentName);
    const sMerchant = s(merchant || vendor);
    const sPIC = s(personInCharge);
    const sEmail = s(emailAddress);

    if (sAgentName === '-' || sMerchant === '-' || sPIC === '-' || sEmail === '-') {
      res.status(400).json({ error: 'Sila lengkapkan maklumat wajib (Nama Ejen, Syarikat, PIC, E-mel).' });
      return;
    }

    const record = await prisma.merchantChecklist.create({
      data: {
        agentName: sAgentName,
        date: date ? new Date(date) : new Date(),
        merchant: sMerchant,
        personInCharge: sPIC,
        mobileNumber: s(mobileNumber),
        emailAddress: sEmail,
        outletAddress: s(outletAddress),
        numberOfOutlets: Number(numberOfOutlets) || 1,
        businessType: s(businessType, 'Kedai / Shop'),
        targetPlatform: s(targetPlatform, 'Foodpanda / GrabFood / ShopeeFood'),
        leadStatus: s(leadStatus, 'Berminat / Interested'),
        language: s(language, 'MS'),
        agentSelfCheck: typeof agentSelfCheck === 'string' ? agentSelfCheck : JSON.stringify(agentSelfCheck || {}),
        agentNotes: s(agentNotes),
        qualificationCheck: typeof qualificationCheck === 'string' ? qualificationCheck : JSON.stringify(qualificationCheck || {}),
        yesScore: Number(yesScore) || 0,
        noScore: Number(noScore) || 0,
        naScore: Number(naScore) || 0,
        totalChecked: Number(totalChecked) || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Merchant Recruitment Checklist saved successfully to Supabase.',
      data: record,
    });
  } catch (error: any) {
    console.error('[FormController] Error creating checklist:', error);
    res.status(500).json({ error: error.message || 'Failed to save checklist.' });
  }
}

/**
 * Controller for retrieving all Merchant Checklist submissions.
 */
export async function getChecklists(req: Request, res: Response): Promise<void> {
  try {
    const lists = await prisma.merchantChecklist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: lists });
  } catch (error: any) {
    console.error('[FormController] Error fetching checklists:', error);
    res.status(500).json({ error: error.message || 'Failed to fetch checklists.' });
  }
}

/**
 * Controller for handling Business Registration (Borang Peniaga) submissions.
 */
export async function createBusinessRegistration(req: Request, res: Response): Promise<void> {
  try {
    const {
      date,
      memberNo,
      fullName,
      mailingAddress,
      storeAddress,
      businessName,
      registrationNo,
      icPassportNo,
      dateOfBirth,
      age,
      religion,
      race,
      nationality,
      contactNumber,
      emailAddress,
      gender,
      personInCharge,
      typeOfFood,
      operatingDays,
      operatingHours,
      bankName,
      bankAccountName,
      bankAccountNumber,
      documentsChecklist,
      shopPhotoUrl,
      receivedDate,
      processingOfficer,
      status,
      rejectionReason,
      activationDate,
      agreedToTerms,
      merchantSignature,
      merchantSignatureName,
      merchantSignatureIc,
      merchantSignatureDate,
      agentSignature,
      agentSignatureName,
      agentSignatureId,
      agentSignatureDate,
      reviewerSignature,
      reviewerName,
      reviewerRole,
      reviewerDate,
      approverSignature,
      approverName,
      approverRole,
      approverDate,
      language,
    } = req.body;

    const sFullName = s(fullName || personInCharge);
    const sBusinessName = s(businessName || personInCharge);
    const sPhone = s(contactNumber);
    const sEmail = s(emailAddress);
    const sStoreAddress = s(storeAddress || mailingAddress);

    if (sFullName === '-' && sBusinessName === '-') {
      res.status(400).json({ error: 'Sila masukkan Nama Syarikat atau Nama Penuh.' });
      return;
    }

    const registration = await prisma.businessRegistration.create({
      data: {
        date: date ? new Date(date) : new Date(),
        memberNo: s(memberNo),
        fullName: sFullName,
        mailingAddress: s(mailingAddress),
        storeAddress: sStoreAddress,
        businessName: sBusinessName,
        registrationNo: s(registrationNo),
        icPassportNo: s(icPassportNo),
        dateOfBirth: s(dateOfBirth),
        age: s(age),
        religion: s(religion, 'Islam'),
        race: s(race, 'Melayu'),
        nationality: s(nationality, 'Malaysia'),
        contactNumber: sPhone,
        emailAddress: sEmail,
        gender: s(gender, 'Lelaki'),
        personInCharge: sFullName,
        typeOfFood: s(typeOfFood, 'Restoran / Makanan'),
        operatingDays: typeof operatingDays === 'string' ? operatingDays : JSON.stringify(operatingDays || []),
        operatingHours: s(operatingHours, '8:00 AM - 10:00 PM'),
        bankName: s(bankName),
        bankAccountName: s(bankAccountName, sFullName),
        bankAccountNumber: s(bankAccountNumber),
        documentsChecklist: typeof documentsChecklist === 'string' ? documentsChecklist : JSON.stringify(documentsChecklist || {}),
        shopPhotoUrl: shopPhotoUrl || null,
        receivedDate: receivedDate ? new Date(receivedDate) : null,
        processingOfficer: s(processingOfficer),
        status: s(status, 'Dalam Proses'),
        rejectionReason: s(rejectionReason),
        activationDate: activationDate ? new Date(activationDate) : null,
        agreedToTerms: agreedToTerms !== undefined ? Boolean(agreedToTerms) : true,
        merchantSignature: s(merchantSignature || merchantSignatureName, sFullName),
        merchantSignatureName: s(merchantSignatureName, sFullName),
        merchantSignatureIc: s(merchantSignatureIc, s(icPassportNo)),
        merchantSignatureDate: merchantSignatureDate ? new Date(merchantSignatureDate) : new Date(),
        agentSignature: s(agentSignature || agentSignatureName),
        agentSignatureName: s(agentSignatureName),
        agentSignatureId: s(agentSignatureId),
        agentSignatureDate: agentSignatureDate ? new Date(agentSignatureDate) : null,
        reviewerSignature: s(reviewerSignature || reviewerName),
        reviewerName: s(reviewerName),
        reviewerRole: s(reviewerRole, 'Penyelia Audit'),
        reviewerDate: reviewerDate ? new Date(reviewerDate) : null,
        approverSignature: s(approverSignature || approverName),
        approverName: s(approverName),
        approverRole: s(approverRole, 'Pengurus Peniaga'),
        approverDate: approverDate ? new Date(approverDate) : null,
        language: s(language, 'MS'),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Borang Peniaga berjaya disimpan ke pangkalan data.',
      data: registration,
    });
  } catch (error: any) {
    console.error('[FormController] Error creating business registration:', error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan borang peniaga.' });
  }
}

/**
 * Controller for retrieving all Business Registration submissions.
 */
export async function getBusinessRegistrations(req: Request, res: Response): Promise<void> {
  try {
    const registrations = await prisma.businessRegistration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: registrations });
  } catch (error: any) {
    console.error('[FormController] Error fetching registrations:', error);
    res.status(500).json({ error: error.message || 'Gagal mengambil rekod pendaftaran peniaga.' });
  }
}

/**
 * Controller for handling Agent Registration (Borang Ejen) submissions.
 */
export async function createAgentRegistration(req: Request, res: Response): Promise<void> {
  try {
    const {
      date,
      agentNo,
      agentName,
      icNumber,
      race,
      religion,
      address,
      phoneNumber,
      bankAccountName,
      bankName,
      bankAccountNumber,
      registeredMerchants,
      prospectSource,
      prospectSourceOther,
      approachedByOtherAgents,
      confidenceLevel,
      estimatedDuration,
      agentSignature,
      supervisorSignature,
      supervisorName,
      supervisorDate,
    } = req.body;

    const sAgentName = s(agentName);
    const sAgentNo = s(agentNo);
    const sIC = s(icNumber);
    const sPhone = s(phoneNumber);

    if (sAgentName === '-' || sAgentNo === '-' || sIC === '-' || sPhone === '-') {
      res.status(400).json({ error: 'Sila lengkapkan maklumat wajib ejen (Nama Ejen, No. Ejen, No. IC, No. Telefon).' });
      return;
    }

    const record = await prisma.agentRegistration.create({
      data: {
        date: date ? new Date(date) : new Date(),
        agentNo: sAgentNo,
        agentName: sAgentName,
        icNumber: sIC,
        race: s(race, 'Melayu'),
        religion: s(religion, 'Islam'),
        address: s(address),
        phoneNumber: sPhone,
        bankAccountName: s(bankAccountName, sAgentName),
        bankName: s(bankName),
        bankAccountNumber: s(bankAccountNumber),
        registeredMerchants: typeof registeredMerchants === 'string' ? registeredMerchants : JSON.stringify(registeredMerchants || []),
        prospectSource: s(prospectSource, 'Rujukan'),
        prospectSourceOther: s(prospectSourceOther),
        approachedByOtherAgents: s(approachedByOtherAgents, 'Tidak'),
        confidenceLevel: s(confidenceLevel, 'Tinggi'),
        estimatedDuration: s(estimatedDuration, '1-3 Hari'),
        agentSignature: s(agentSignature || agentName, sAgentName),
        agentSignatureDate: new Date(),
        supervisorSignature: s(supervisorSignature || supervisorName),
        supervisorName: s(supervisorName),
        supervisorDate: supervisorDate ? new Date(supervisorDate) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Borang Pendaftaran Ejen berjaya disimpan.',
      data: record,
    });
  } catch (error: any) {
    console.error('[FormController] Error creating agent registration:', error);
    res.status(500).json({ error: error.message || 'Gagal menyimpan borang ejen.' });
  }
}

/**
 * Controller for retrieving all Agent Registration submissions.
 */
export async function getAgentRegistrations(req: Request, res: Response): Promise<void> {
  try {
    const records = await prisma.agentRegistration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: records });
  } catch (error: any) {
    console.error('[FormController] Error fetching agent registrations:', error);
    res.status(500).json({ error: error.message || 'Gagal mengambil rekod pendaftaran ejen.' });
  }
}
