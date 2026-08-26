import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await prisma.agentRegistration.findMany({
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
      agentSignatureDate,
      supervisorSignature,
      supervisorName,
      supervisorDate,
    } = body;

    const record = await prisma.agentRegistration.create({
      data: {
        date: date ? new Date(date) : new Date(),
        agentNo: agentNo || 'AGT-TEMP',
        agentName: agentName || 'Unknown Agent',
        icNumber: icNumber || '',
        race: race || 'Melayu',
        religion: religion || 'Islam',
        address: address || '',
        phoneNumber: phoneNumber || '',
        bankAccountName: bankAccountName || agentName || '',
        bankName: bankName || '',
        bankAccountNumber: bankAccountNumber || '',
        registeredMerchants: typeof registeredMerchants === 'object' ? JSON.stringify(registeredMerchants) : String(registeredMerchants || '[]'),
        prospectSource: prospectSource || 'Rujukan',
        prospectSourceOther: prospectSourceOther || null,
        approachedByOtherAgents: approachedByOtherAgents || 'Tidak',
        confidenceLevel: confidenceLevel || 'Tinggi',
        estimatedDuration: estimatedDuration || '1-3 Hari',
        agentSignature: agentSignature || null,
        agentSignatureDate: agentSignatureDate ? new Date(agentSignatureDate) : new Date(),
        supervisorSignature: supervisorSignature || null,
        supervisorName: supervisorName || null,
        supervisorDate: supervisorDate ? new Date(supervisorDate) : null,
      },
    });

    return NextResponse.json({ success: true, message: 'Agent registration submitted successfully.', data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit agent registration.' }, { status: 500 });
  }
}
