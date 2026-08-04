import { Request, Response } from 'express';
import { prisma } from '../prisma';

/**
 * Controller for handling Vendor Recruitment & Registration Checklist submissions.
 */
export async function createChecklist(req: Request, res: Response): Promise<void> {
  try {
    const {
      agentName,
      date,
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

    if (!agentName || !vendor || !personInCharge || !emailAddress) {
      res.status(400).json({ error: 'Missing required header fields.' });
      return;
    }

    const record = await prisma.vendorChecklist.create({
      data: {
        agentName,
        date: date ? new Date(date) : new Date(),
        vendor,
        personInCharge,
        mobileNumber: mobileNumber || '',
        emailAddress,
        outletAddress: outletAddress || '',
        numberOfOutlets: Number(numberOfOutlets) || 1,
        businessType: businessType || 'Shop',
        targetPlatform: targetPlatform || 'Foodpanda / GrabFood / ShopeeFood',
        leadStatus: leadStatus || 'Interested',
        language: language || 'EN',
        agentSelfCheck: typeof agentSelfCheck === 'string' ? agentSelfCheck : JSON.stringify(agentSelfCheck || {}),
        agentNotes: agentNotes || '',
        qualificationCheck: typeof qualificationCheck === 'string' ? qualificationCheck : JSON.stringify(qualificationCheck || {}),
        yesScore: Number(yesScore) || 0,
        noScore: Number(noScore) || 0,
        naScore: Number(naScore) || 0,
        totalChecked: Number(totalChecked) || 0,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Vendor Recruitment Checklist saved successfully to Supabase.',
      data: record,
    });
  } catch (error: any) {
    console.error('[FormController] Error creating checklist:', error);
    res.status(500).json({ error: error.message || 'Failed to save checklist.' });
  }
}

/**
 * Controller for retrieving all Vendor Checklist submissions.
 */
export async function getChecklists(req: Request, res: Response): Promise<void> {
  try {
    const lists = await prisma.vendorChecklist.findMany({
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

    const picName = fullName || personInCharge || businessName;
    const phone = contactNumber || '';
    const email = emailAddress || '';
    const address = storeAddress || mailingAddress || '';

    if (!businessName && !fullName) {
      res.status(400).json({ error: 'Sila masukkan Nama Syarikat atau Nama Penuh.' });
      return;
    }

    const registration = await prisma.businessRegistration.create({
      data: {
        date: date ? new Date(date) : new Date(),
        memberNo: memberNo || '',
        fullName: fullName || picName,
        mailingAddress: mailingAddress || '',
        storeAddress: address,
        businessName: businessName || picName,
        registrationNo: registrationNo || '',
        icPassportNo: icPassportNo || '',
        dateOfBirth: dateOfBirth || '',
        age: age || '',
        religion: religion || '',
        race: race || '',
        nationality: nationality || 'Malaysia',
        contactNumber: phone,
        emailAddress: email,
        gender: gender || '',
        personInCharge: picName,
        typeOfFood: typeOfFood || '',
        operatingDays: typeof operatingDays === 'string' ? operatingDays : JSON.stringify(operatingDays || []),
        operatingHours: operatingHours || '',
        bankName: bankName || '',
        bankAccountName: bankAccountName || picName,
        bankAccountNumber: bankAccountNumber || '',
        documentsChecklist: typeof documentsChecklist === 'string' ? documentsChecklist : JSON.stringify(documentsChecklist || {}),
        shopPhotoUrl: shopPhotoUrl || null,
        receivedDate: receivedDate ? new Date(receivedDate) : null,
        processingOfficer: processingOfficer || '',
        status: status || 'Dalam Proses',
        rejectionReason: rejectionReason || '',
        activationDate: activationDate ? new Date(activationDate) : null,
        agreedToTerms: agreedToTerms !== undefined ? Boolean(agreedToTerms) : true,
        merchantSignature: merchantSignature || merchantSignatureName || '',
        merchantSignatureName: merchantSignatureName || fullName || picName,
        merchantSignatureIc: merchantSignatureIc || icPassportNo || '',
        merchantSignatureDate: merchantSignatureDate ? new Date(merchantSignatureDate) : new Date(),
        agentSignature: agentSignature || agentSignatureName || '',
        agentSignatureName: agentSignatureName || '',
        agentSignatureId: agentSignatureId || '',
        agentSignatureDate: agentSignatureDate ? new Date(agentSignatureDate) : null,
        reviewerSignature: reviewerSignature || reviewerName || '',
        reviewerName: reviewerName || '',
        reviewerRole: reviewerRole || '',
        reviewerDate: reviewerDate ? new Date(reviewerDate) : null,
        approverSignature: approverSignature || approverName || '',
        approverName: approverName || '',
        approverRole: approverRole || '',
        approverDate: approverDate ? new Date(approverDate) : null,
        language: language || 'MS',
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

    if (!agentName || !agentNo || !icNumber || !phoneNumber || !bankAccountNumber) {
      res.status(400).json({ error: 'Sila lengkapkan maklumat wajib ejen.' });
      return;
    }

    const record = await prisma.agentRegistration.create({
      data: {
        date: date ? new Date(date) : new Date(),
        agentNo,
        agentName,
        icNumber,
        race: race || '',
        religion: religion || '',
        address: address || '',
        phoneNumber,
        bankAccountName: bankAccountName || agentName,
        bankName: bankName || '',
        bankAccountNumber,
        registeredMerchants: typeof registeredMerchants === 'string' ? registeredMerchants : JSON.stringify(registeredMerchants || []),
        prospectSource: prospectSource || 'Rujukan',
        prospectSourceOther: prospectSourceOther || '',
        approachedByOtherAgents: approachedByOtherAgents || 'Tidak',
        confidenceLevel: confidenceLevel || 'Tinggi',
        estimatedDuration: estimatedDuration || '',
        agentSignature: agentSignature || '',
        agentSignatureDate: new Date(),
        supervisorSignature: supervisorSignature || '',
        supervisorName: supervisorName || '',
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
