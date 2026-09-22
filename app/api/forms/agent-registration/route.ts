import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { hashPassword } from '../../../../src/utils/security';
import { archiveAgentForm, deleteFormFromSupabaseStorage } from '../../../../src/services/storage.service';
import { Pool } from 'pg';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const records = await prisma.agentRegistration.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, data: records });
  } catch (error: any) {
    return NextResponse.json({ success: false, data: [], error: error.message });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      date,
      agentNo,
      agentName,
      email,
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

    const trimmedEmail = email ? String(email).trim().toLowerCase() : null;
    const trimmedAgentName = agentName ? String(agentName).trim() : 'Agent';

    if (!trimmedEmail) {
      return NextResponse.json(
        { success: false, error: 'Email address is required for agent portal account creation.' },
        { status: 400 }
      );
    }

    // 1. Save Agent Registration in Database
    let record: any = null;
    try {
      record = await prisma.agentRegistration.create({
        data: {
          date: date ? new Date(date) : new Date(),
          agentNo: agentNo || 'AGT-TEMP',
          agentName: trimmedAgentName,
          email: trimmedEmail,
          icNumber: icNumber || '',
          race: race || 'Melayu',
          religion: religion || 'Islam',
          address: address || '',
          phoneNumber: phoneNumber || '',
          bankAccountName: bankAccountName || trimmedAgentName || '',
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
    } catch (prismaErr: any) {
      console.warn('[POST /api/forms/agent-registration] Prisma error, using direct pg fallback:', prismaErr?.message);
      const pool = new Pool({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      const res = await pool.query(
        `INSERT INTO agent_registrations 
         (date, agent_no, agent_name, email, ic_number, race, religion, address, phone_number, bank_account_name, bank_name, bank_account_number, registered_merchants, prospect_source, approached_by_other_agents, confidence_level, estimated_duration, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
         RETURNING *`,
        [
          date ? new Date(date) : new Date(),
          agentNo || 'AGT-TEMP',
          trimmedAgentName,
          trimmedEmail,
          icNumber || '',
          race || 'Melayu',
          religion || 'Islam',
          address || '',
          phoneNumber || '',
          bankAccountName || trimmedAgentName || '',
          bankName || '',
          bankAccountNumber || '',
          typeof registeredMerchants === 'object' ? JSON.stringify(registeredMerchants) : String(registeredMerchants || '[]'),
          prospectSource || 'Rujukan',
          approachedByOtherAgents || 'Tidak',
          confidenceLevel || 'Tinggi',
          estimatedDuration || '1-3 Hari',
        ]
      );
      await pool.end();
      record = res.rows[0];
    }

    // 2. Automatically provision or update user in Supabase `users` table with Default123! password
    const defaultPasswordHash = hashPassword('Default123!');

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email: { equals: trimmedEmail, mode: 'insensitive' } },
            { username: { equals: trimmedEmail, mode: 'insensitive' } },
          ],
        },
      });

      if (existingUser) {
        const isPrivileged = (existingUser.role as string) === 'SUPER_ADMIN' || (existingUser.role as string) === 'ADMIN' || (existingUser.role as string) === 'MANAGER';
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            fullName: trimmedAgentName || existingUser.fullName,
            // Preserve existing password if user already has one
            passwordHash: existingUser.passwordHash || defaultPasswordHash,
            // Retain high-privilege role if existing user is SUPER_ADMIN, ADMIN or MANAGER
            role: isPrivileged ? existingUser.role : (existingUser.role || ('AGENT' as any)),
            department: existingUser.department || 'Field Recruitment',
            position: existingUser.position || 'Agent',
            isActive: true,
          },
        });
      } else {
        await prisma.user.create({
          data: {
            username: trimmedEmail,
            email: trimmedEmail,
            fullName: trimmedAgentName,
            passwordHash: defaultPasswordHash,
            department: 'Field Recruitment',
            position: 'Agent',
            role: 'AGENT',
            permissions: JSON.stringify(['forms:submit']),
            isActive: true,
          },
        });
      }
    } catch (userErr: any) {
      console.warn('[POST /api/forms/agent-registration] User provisioning via Prisma failed, running direct SQL upsert:', userErr?.message);
      try {
        const pool = new Pool({
          connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
        });
        await pool.query(
          `INSERT INTO users (id, username, email, full_name, password_hash, department, position, role, permissions, is_active, created_at, updated_at)
           VALUES (gen_random_uuid(), $1, $2, $3, $4, 'Field Recruitment', 'Agent', 'AGENT', '["forms:submit"]', true, NOW(), NOW())
           ON CONFLICT (email) DO UPDATE
           SET full_name = COALESCE(NULLIF(EXCLUDED.full_name, ''), users.full_name),
               role = CASE WHEN users.role IN ('ADMIN', 'MANAGER') THEN users.role ELSE 'AGENT' END,
               is_active = true,
               updated_at = NOW()`,
          [trimmedEmail, trimmedEmail, trimmedAgentName, defaultPasswordHash]
        );
        await pool.end();
      } catch (sqlErr: any) {
        console.error('[POST /api/forms/agent-registration] Direct SQL user creation failed:', sqlErr?.message);
      }
    }

    // 3. Archive form snapshot to Supabase Cloud Storage
    let storageResult = null;
    if (record) {
      storageResult = await archiveAgentForm(record);
    }

    return NextResponse.json({
      success: true,
      message: `Agent registration submitted and portal account provisioned for ${trimmedEmail} with default password Default123!.`,
      data: record,
      storage: storageResult,
    });
  } catch (error: any) {
    console.error('[POST /api/forms/agent-registration] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to submit agent registration.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    let id = searchParams.get('id');

    if (!id) {
      const body = await request.json().catch(() => ({}));
      id = body?.id;
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Agent registration ID is required' }, { status: 400 });
    }

    // 1. Fetch agent record first to find associated email/user
    let agentEmail: string | null = null;
    try {
      const agent = await prisma.agentRegistration.findUnique({
        where: { id },
        select: { email: true },
      });
      agentEmail = agent?.email || null;
    } catch {}

    // 2. Delete agent registration record
    let deleted = false;
    try {
      await prisma.agentRegistration.delete({
        where: { id },
      });
      deleted = true;
    } catch (prismaErr: any) {
      console.warn('[DELETE /api/forms/agent-registration] Prisma delete failed, trying direct PG pooler:', prismaErr?.message);
    }

    if (!deleted) {
      const pool = new Pool({
        connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      await pool.query('DELETE FROM agent_registrations WHERE id = $1', [id]);
      await pool.end();
    }

    // 3. If there is an associated agent login account in `users` with this email, delete it as well
    if (agentEmail) {
      try {
        await prisma.user.deleteMany({
          where: {
            email: { equals: agentEmail, mode: 'insensitive' },
            role: 'AGENT',
          },
        });
      } catch (userDelErr) {
        console.warn('[DELETE /api/forms/agent-registration] Could not delete associated agent user account:', userDelErr);
      }
    }

    // 4. Clean up storage snapshot asynchronously
    deleteFormFromSupabaseStorage('agents', id).catch(() => {});

    return NextResponse.json({
      success: true,
      message: 'Agent registration and associated agent user account deleted successfully.',
    });
  } catch (error: any) {
    console.error('[DELETE /api/forms/agent-registration] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete agent registration.' },
      { status: 500 }
    );
  }
}
