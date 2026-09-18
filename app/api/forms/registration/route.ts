import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { verifySessionToken, hashPassword } from '../../../../src/utils/security';
import { archiveMerchantForm } from '../../../../src/services/storage.service';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

function getSessionUser(request: NextRequest) {
  const authCookie = request.cookies.get('lc_session')?.value;
  const authHeader = request.headers.get('authorization');
  let token = authCookie;
  if (!token && authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }
  if (!token) return null;
  const verified = verifySessionToken(token);
  return verified.valid ? verified.user : null;
}

export async function GET(request: NextRequest) {
  try {
    const session = getSessionUser(request);

    // If requester is an AGENT, restrict results to only merchants registered under this agent
    let whereClause: any = undefined;
    if (session && session.role === 'AGENT') {
      const orConditions: any[] = [];
      if (session.id) orConditions.push({ agentUserId: session.id });
      if (session.email) orConditions.push({ agentEmail: { equals: session.email, mode: 'insensitive' } });
      if (session.fullName) orConditions.push({ agentSignatureName: { equals: session.fullName, mode: 'insensitive' } });
      if (session.username) orConditions.push({ agentSignatureId: { equals: session.username, mode: 'insensitive' } });
      
      if (orConditions.length > 0) {
        whereClause = { OR: orConditions };
      }
    }

    let records: any[] = [];
    try {
      records = await prisma.businessRegistration.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
      });
    } catch (prismaErr: any) {
      console.warn('[GET /api/forms/registration] Prisma error, using direct PG pool fallback:', prismaErr?.message);
      const pool = new Pool({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      if (session && session.role === 'AGENT') {
        const query = `
          SELECT * FROM business_registrations 
          WHERE (agent_user_id = $1)
             OR (agent_email IS NOT NULL AND LOWER(agent_email) = LOWER($2))
             OR (agent_signature_name IS NOT NULL AND LOWER(agent_signature_name) = LOWER($3))
             OR (agent_signature_id IS NOT NULL AND LOWER(agent_signature_id) = LOWER($4))
          ORDER BY created_at DESC
        `;
        const res = await pool.query(query, [
          session.id,
          session.email || '',
          session.fullName || '',
          session.username || '',
        ]);
        records = res.rows;
      } else {
        const res = await pool.query('SELECT * FROM business_registrations ORDER BY created_at DESC');
        records = res.rows;
      }
      await pool.end();
    }

    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, data: [], error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = getSessionUser(request);
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

    // Automatically bind to agent if logged in as AGENT
    const isAgent = session?.role === 'AGENT';
    const resolvedAgentUserId = isAgent ? session.id : (body.agentUserId || null);
    const resolvedAgentEmail = isAgent ? (session.email || null) : (body.agentEmail || null);
    const resolvedAgentSignatureName = isAgent ? session.fullName : (agentSignatureName || null);
    const resolvedAgentSignatureId = isAgent ? (session.username || session.id) : (agentSignatureId || null);

    let record: any = null;
    try {
      record = await prisma.businessRegistration.create({
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
          processingOfficer: processingOfficer || (isAgent ? session.fullName : null),
          status: status || 'Dalam Proses',
          rejectionReason: rejectionReason || null,
          activationDate: activationDate ? new Date(activationDate) : null,
          agreedToTerms: Boolean(agreedToTerms),
          merchantSignatureName: merchantSignatureName || fullName || null,
          merchantSignatureIc: merchantSignatureIc || icPassportNo || null,
          merchantSignatureDate: merchantSignatureDate ? new Date(merchantSignatureDate) : new Date(),
          agentSignatureName: resolvedAgentSignatureName,
          agentSignatureId: resolvedAgentSignatureId,
          agentSignatureDate: agentSignatureDate ? new Date(agentSignatureDate) : new Date(),
          agentUserId: resolvedAgentUserId,
          agentEmail: resolvedAgentEmail,
          reviewerName: reviewerName || null,
          reviewerRole: reviewerRole || null,
          reviewerDate: reviewerDate ? new Date(reviewerDate) : null,
          approverName: approverName || null,
          approverRole: approverRole || null,
          approverDate: approverDate ? new Date(approverDate) : null,
          language: language || 'MS',
        },
      });
    } catch (prismaErr: any) {
      console.warn('[POST /api/forms/registration] Prisma insert error, using direct PG pool:', prismaErr?.message);
      const pool = new Pool({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      const insertQuery = `
        INSERT INTO business_registrations (
          date, member_no, full_name, mailing_address, store_address, business_name,
          registration_no, ic_passport_no, date_of_birth, age, religion, race, nationality,
          contact_number, email_address, gender, person_in_charge, type_of_food,
          operating_days, operating_hours, bank_name, bank_account_name, bank_account_number,
          documents_checklist, shop_photo_url, received_date, processing_officer, status,
          rejection_reason, activation_date, agreed_to_terms, merchant_signature_name,
          merchant_signature_ic, merchant_signature_date, agent_signature_name, agent_signature_id,
          agent_signature_date, agent_user_id, agent_email, reviewer_name, approver_name, language,
          created_at, updated_at
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18,
          $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34,
          $35, $36, $37, $38, $39, $40, $41, $42, NOW(), NOW()
        ) RETURNING *
      `;
      const res = await pool.query(insertQuery, [
        date ? new Date(date) : new Date(),
        memberNo || null,
        fullName || merchantSignatureName || 'Unknown Merchant',
        mailingAddress || '',
        storeAddress || mailingAddress || '',
        businessName || '',
        registrationNo || null,
        icPassportNo || merchantSignatureIc || '',
        dateOfBirth ? String(dateOfBirth) : null,
        age ? String(age) : null,
        religion || null,
        race || null,
        nationality || 'Malaysian',
        contactNumber || '',
        emailAddress || '',
        gender || 'Lelaki',
        personInCharge || fullName || businessName || '',
        typeOfFood || 'Restoran / Makanan',
        Array.isArray(operatingDays) ? operatingDays.join(', ') : String(operatingDays || ''),
        operatingHours || '',
        bankName || '',
        bankAccountName || fullName || '',
        bankAccountNumber || '',
        typeof documentsChecklist === 'object' ? JSON.stringify(documentsChecklist) : String(documentsChecklist || '{}'),
        shopPhotoUrl || null,
        receivedDate ? new Date(receivedDate) : new Date(),
        processingOfficer || (isAgent ? session.fullName : null),
        status || 'Dalam Proses',
        rejectionReason || null,
        activationDate ? new Date(activationDate) : null,
        Boolean(agreedToTerms),
        merchantSignatureName || fullName || null,
        merchantSignatureIc || icPassportNo || null,
        merchantSignatureDate ? new Date(merchantSignatureDate) : new Date(),
        resolvedAgentSignatureName,
        resolvedAgentSignatureId,
        agentSignatureDate ? new Date(agentSignatureDate) : new Date(),
        resolvedAgentUserId,
        resolvedAgentEmail,
        reviewerName || null,
        approverName || null,
        language || 'MS',
      ]);
      await pool.end();
      record = res.rows[0];
    }

    // Archive merchant form snapshot to Supabase Cloud Storage
    let storageResult = null;
    if (record) {
      storageResult = await archiveMerchantForm(record);
    }

    // Auto-provision or update merchant user account in Supabase `users` table with Default123! password
    const merchantEmail = (emailAddress || '').trim().toLowerCase();
    const merchantDisplayName = (fullName || businessName || 'Merchant Partner').trim();
    if (merchantEmail) {
      const defaultPasswordHash = hashPassword('Default123!');
      try {
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: merchantEmail, mode: 'insensitive' } },
              { username: { equals: merchantEmail, mode: 'insensitive' } },
            ],
          },
        });

        if (existingUser) {
          const isPrivileged = (existingUser.role as string) === 'SUPER_ADMIN' || (existingUser.role as string) === 'ADMIN' || (existingUser.role as string) === 'MANAGER';
          await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              fullName: merchantDisplayName || existingUser.fullName,
              // Preserve existing password if user already has one
              passwordHash: existingUser.passwordHash || defaultPasswordHash,
              // Retain high-privilege role if existing user is SUPER_ADMIN, ADMIN or MANAGER
              role: isPrivileged ? existingUser.role : (existingUser.role || ('MERCHANT' as any)),
              department: existingUser.department || 'Merchant Storefront',
              position: existingUser.position || 'Merchant Partner',
              isActive: true,
            },
          });
        } else {
          await prisma.user.create({
            data: {
              username: merchantEmail,
              email: merchantEmail,
              fullName: merchantDisplayName,
              passwordHash: defaultPasswordHash,
              department: 'Merchant Storefront',
              position: 'Merchant Partner',
              role: 'MERCHANT',
              permissions: JSON.stringify(['merchant:view', 'forms:submit']),
              isActive: true,
            },
          });
        }
      } catch (userErr: any) {
        console.warn('[POST /api/forms/registration] User provisioning via Prisma failed, running direct SQL upsert:', userErr?.message);
        try {
          const pool = new Pool({
            connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
            ssl: { rejectUnauthorized: false },
            connectionTimeoutMillis: 5000,
          });
          await pool.query(
            `INSERT INTO users (id, username, email, full_name, password_hash, department, position, role, permissions, is_active, created_at, updated_at)
             VALUES (gen_random_uuid(), $1, $2, $3, $4, 'Merchant Storefront', 'Merchant Partner', 'MERCHANT', '["merchant:view", "forms:submit"]', true, NOW(), NOW())
             ON CONFLICT (email) DO UPDATE
             SET full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), users.full_name),
                 role = CASE WHEN users.role IN ('ADMIN', 'MANAGER') THEN users.role ELSE 'MERCHANT' END,
                 is_active = true,
                 updated_at = NOW()`,
            [merchantEmail, merchantEmail, merchantDisplayName, defaultPasswordHash]
          );
          await pool.end();
        } catch (sqlErr: any) {
          console.error('[POST /api/forms/registration] Direct SQL user creation failed:', sqlErr?.message);
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Registration submitted successfully.',
      data: record,
      storage: storageResult,
    });
  } catch (error: any) {
    console.error('[POST /api/forms/registration] Error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to submit registration.' }, { status: 500 });
  }
}
