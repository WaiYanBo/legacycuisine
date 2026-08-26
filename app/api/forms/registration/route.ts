import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await prisma.businessRegistration.findMany({
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
      merchantSignatureName,
      merchantSignatureIc,
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
      language,
    } = body;

    const record = await prisma.businessRegistration.create({
      data: {
        date: date ? new Date(date) : new Date(),
        memberNo: memberNo || null,
        fullName: fullName || merchantSignatureName || 'Unknown Merchant',
        mailingAddress: mailingAddress || '',
        storeAddress: storeAddress || mailingAddress || '',
        businessName: businessName || '',
        registrationNo: registrationNo || null,
        icPassportNo: icPassportNo || merchantSignatureIc || '',
        dateOfBirth: dateOfBirth ? String(dateOfBirth) : null,
        age: age ? String(age) : null,
        religion: religion || null,
        race: race || null,
        nationality: nationality || 'Malaysian',
        contactNumber: contactNumber || '',
        emailAddress: emailAddress || '',
        gender: gender || 'Lelaki',
        personInCharge: personInCharge || fullName || businessName || '',
        typeOfFood: typeOfFood || 'Restoran / Makanan',
        operatingDays: Array.isArray(operatingDays) ? operatingDays.join(', ') : String(operatingDays || ''),
        operatingHours: operatingHours || '',
        bankName: bankName || '',
        bankAccountName: bankAccountName || fullName || '',
        bankAccountNumber: bankAccountNumber || '',
        documentsChecklist: typeof documentsChecklist === 'object' ? JSON.stringify(documentsChecklist) : String(documentsChecklist || '{}'),
        shopPhotoUrl: shopPhotoUrl || null,
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        processingOfficer: processingOfficer || null,
        status: status || 'Dalam Proses',
        rejectionReason: rejectionReason || null,
        activationDate: activationDate ? new Date(activationDate) : null,
        agreedToTerms: Boolean(agreedToTerms),
        merchantSignatureName: merchantSignatureName || fullName || null,
        merchantSignatureIc: merchantSignatureIc || icPassportNo || null,
        merchantSignatureDate: merchantSignatureDate ? new Date(merchantSignatureDate) : new Date(),
        agentSignatureName: agentSignatureName || null,
        agentSignatureId: agentSignatureId || null,
        agentSignatureDate: agentSignatureDate ? new Date(agentSignatureDate) : new Date(),
        reviewerName: reviewerName || null,
        reviewerRole: reviewerRole || null,
        reviewerDate: reviewerDate ? new Date(reviewerDate) : null,
        approverName: approverName || null,
        approverRole: approverRole || null,
        approverDate: approverDate ? new Date(approverDate) : null,
        language: language || 'MS',
      },
    });

    return NextResponse.json({ success: true, message: 'Registration submitted successfully.', data: record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit registration.' }, { status: 500 });
  }
}
