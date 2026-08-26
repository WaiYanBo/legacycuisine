import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await prisma.merchantChecklist.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(records);
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      agentName,
      date,
      merchant,
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
    } = body;

    const record = await prisma.merchantChecklist.create({
      data: {
        agentName: agentName || 'Unknown Agent',
        date: date ? new Date(date) : new Date(),
        merchant: merchant || 'Unknown Merchant',
        personInCharge: personInCharge || merchant || '',
        mobileNumber: mobileNumber || '',
        emailAddress: emailAddress || '',
        outletAddress: outletAddress || '',
        numberOfOutlets: numberOfOutlets ? parseInt(String(numberOfOutlets), 10) : 1,
        businessType: businessType || 'General Food',
        targetPlatform: targetPlatform || 'GrabFood',
        leadStatus: leadStatus || 'QUALIFIED',
        language: language || 'EN',
        agentSelfCheck: typeof agentSelfCheck === 'object' ? JSON.stringify(agentSelfCheck) : String(agentSelfCheck || '{}'),
        agentNotes: agentNotes || null,
        qualificationCheck: typeof qualificationCheck === 'object' ? JSON.stringify(qualificationCheck) : String(qualificationCheck || '{}'),
        yesScore: yesScore || 0,
        noScore: noScore || 0,
        naScore: naScore || 0,
        totalChecked: totalChecked || 0,
      },
    });

    return NextResponse.json({ success: true, message: 'Checklist submitted successfully.', data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit checklist.' }, { status: 500 });
  }
}
