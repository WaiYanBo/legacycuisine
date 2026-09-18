import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { verifySessionToken } from '../../../../src/utils/security';
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
    const { searchParams } = new URL(request.url);
    const queryEmail = searchParams.get('email')?.trim().toLowerCase();
    const queryId = searchParams.get('id');

    const emailToSearch = (session?.email || queryEmail || '').toLowerCase();
    const usernameToSearch = (session?.username || '').toLowerCase();
    const nameToSearch = session?.fullName || '';

    let record: any = null;

    try {
      record = await prisma.agentRegistration.findFirst({
        where: {
          OR: [
            ...(emailToSearch ? [{ email: { equals: emailToSearch, mode: 'insensitive' as const } }] : []),
            ...(usernameToSearch ? [{ agentNo: { equals: usernameToSearch, mode: 'insensitive' as const } }] : []),
            ...(nameToSearch ? [{ agentName: { equals: nameToSearch, mode: 'insensitive' as const } }] : []),
            ...(queryId ? [{ id: queryId }] : []),
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    } catch (prismaErr: any) {
      console.warn('[GET /api/agent/profile] Prisma lookup error, using PG fallback:', prismaErr?.message);
    }

    // Direct PG query fallback
    if (!record) {
      try {
        const pool = new Pool({
          connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
        });

        const res = await pool.query(
          `SELECT * FROM agent_registrations 
           WHERE (email IS NOT NULL AND LOWER(email) = LOWER($1))
              OR (agent_no IS NOT NULL AND LOWER(agent_no) = LOWER($2))
              OR (agent_name IS NOT NULL AND LOWER(agent_name) = LOWER($3))
           ORDER BY created_at DESC
           LIMIT 1`,
          [emailToSearch, usernameToSearch, nameToSearch]
        );
        await pool.end();
        if (res.rows.length > 0) {
          record = res.rows[0];
        }
      } catch (pgErr: any) {
        console.error('[GET /api/agent/profile] PG pool error:', pgErr?.message);
      }
    }

    if (!record) {
      return NextResponse.json({
        success: false,
        message: 'No agent registration form found for this user.',
        data: null,
      });
    }

    const storageKey = `registration-forms/agents/${record.id || record.agentNo}.json`;
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
    console.error('[GET /api/agent/profile] Unhandled error:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to retrieve agent profile' },
      { status: 500 }
    );
  }
}
