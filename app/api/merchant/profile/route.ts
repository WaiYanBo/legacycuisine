import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { verifySessionToken, hasPermission } from '../../../../src/utils/security';
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
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Authentication required.' },
        { status: 401 }
      );
    }

    const isPrivileged = session.role === 'SUPER_ADMIN' || session.role === 'MANAGER' || hasPermission(session, 'forms:review') || hasPermission(session, 'admin:all');
    const { searchParams } = new URL(request.url);
    const queryEmail = isPrivileged ? searchParams.get('email')?.trim().toLowerCase() : null;
    const queryId = searchParams.get('id')?.trim();
    const queryRegNo = searchParams.get('registrationNo')?.trim();

    const emailToSearch = (queryEmail || session.email || '').toLowerCase();
    const usernameToSearch = (session.username || '').toLowerCase();

    // If requester is an agent, restrict search to only merchants registered under this agent
    const agentFilter = session.role === 'AGENT' ? [
      { agentUserId: session.id },
      ...(session.email ? [{ agentEmail: { equals: session.email, mode: 'insensitive' as const } }] : []),
      ...(session.fullName ? [{ agentSignatureName: { equals: session.fullName, mode: 'insensitive' as const } }] : []),
    ] : [];

    let record: any = null;

    try {
      const orConditions: any[] = [
        ...(emailToSearch ? [{ emailAddress: { equals: emailToSearch, mode: 'insensitive' as const } }] : []),
        ...(usernameToSearch ? [{ registrationNo: { equals: usernameToSearch, mode: 'insensitive' as const } }] : []),
        ...(queryId ? [{ id: queryId }] : []),
        ...(queryRegNo ? [{ registrationNo: { equals: queryRegNo, mode: 'insensitive' as const } }] : []),
      ];

      record = await prisma.businessRegistration.findFirst({
        where: {
          AND: [
            ...(agentFilter.length > 0 ? [{ OR: agentFilter }] : []),
            ...(orConditions.length > 0 ? [{ OR: orConditions }] : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (prismaErr: any) {
      console.warn('[GET /api/merchant/profile] Prisma lookup error, using PG fallback:', prismaErr?.message);
    }

    // Direct PG query fallback
    if (!record) {
      try {
        const pool = new Pool({
          connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
        });

        let query = `
          SELECT * FROM business_registrations 
          WHERE ((email_address IS NOT NULL AND LOWER(email_address) = LOWER($1))
             OR (registration_no IS NOT NULL AND LOWER(registration_no) = LOWER($2))
             OR (id::text = $3))
        `;
        const params: any[] = [emailToSearch, usernameToSearch || queryRegNo || '', queryId || '00000000-0000-0000-0000-000000000000'];

        if (session.role === 'AGENT') {
          query += ` AND (agent_user_id = $4 OR (agent_email IS NOT NULL AND LOWER(agent_email) = LOWER($5)) OR (agent_signature_name IS NOT NULL AND LOWER(agent_signature_name) = LOWER($6)))`;
          params.push(session.id, session.email || '', session.fullName || '');
        }

        query += ` ORDER BY created_at DESC LIMIT 1`;
        const res = await pool.query(query, params);
        await pool.end();
        if (res.rows.length > 0) {
          record = res.rows[0];
        }
      } catch (pgErr: any) {
        console.error('[GET /api/merchant/profile] PG pool error:', pgErr?.message);
      }
    }

    if (!record) {
      return NextResponse.json({
        success: false,
        message: 'No merchant registration record found.',
        data: null,
      });
    }

    const storageKey = `registration-forms/merchants/${record.id || record.registrationNo}.json`;
    const publicStorageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pxdeuforfrpgpulpmbfv.supabase.co'}/storage/v1/object/public/${storageKey}`;

    return NextResponse.json({
      success: true,
      data: record,
      storage: {
        bucket: 'registration-forms',
        key: storageKey,
        publicUrl: publicStorageUrl,
        isSafe: true,
      },
    });
  } catch (error: any) {
    console.error('[GET /api/merchant/profile] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve merchant profile' },
      { status: 500 }
    );
  }
}
