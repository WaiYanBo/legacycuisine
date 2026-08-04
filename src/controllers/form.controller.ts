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
 * Controller for handling Business Registration submissions.
 */
export async function createBusinessRegistration(req: Request, res: Response): Promise<void> {
  try {
    const {
      businessName,
      personInCharge,
      typeOfFood,
      emailAddress,
      contactNumber,
      storeAddress,
      shopPhotoUrl,
      language,
    } = req.body;

    if (!businessName || !personInCharge || !typeOfFood || !emailAddress || !contactNumber || !storeAddress) {
      res.status(400).json({ error: 'Missing required business registration fields.' });
      return;
    }

    const registration = await prisma.businessRegistration.create({
      data: {
        businessName,
        personInCharge,
        typeOfFood,
        emailAddress,
        contactNumber,
        storeAddress,
        shopPhotoUrl: shopPhotoUrl || null,
        language: language || 'EN',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Business registration submitted successfully to Supabase.',
      data: registration,
    });
  } catch (error: any) {
    console.error('[FormController] Error creating business registration:', error);
    res.status(500).json({ error: error.message || 'Failed to save business registration.' });
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
    res.status(500).json({ error: error.message || 'Failed to fetch registrations.' });
  }
}
