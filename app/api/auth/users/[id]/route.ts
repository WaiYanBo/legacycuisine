import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../src/prisma';
import { verifySessionToken } from '../../../../../src/utils/security';

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionUser(request);
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
      return NextResponse.json(
        { success: false, error: 'Access denied. Administrator privileges required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    const body = await request.json();
    const { fullName, email, department, position, permissions, role, isActive } = body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    // Protect against self-deactivation or self-demotion
    if (user.id === session.id) {
      if (isActive === false) {
        return NextResponse.json({ success: false, error: 'You cannot deactivate your own account.' }, { status: 400 });
      }
    }

    const formattedPermissions = permissions !== undefined
      ? Array.isArray(permissions)
        ? JSON.stringify(permissions)
        : String(permissions)
      : undefined;

    let updated: any;
    try {
      updated = await prisma.user.update({
        where: { id },
        data: {
          fullName: fullName !== undefined ? String(fullName).trim() : undefined,
          email: email !== undefined ? (email ? String(email).trim() : null) : undefined,
          department: department !== undefined ? String(department).trim() : undefined,
          position: position !== undefined ? String(position).trim() : undefined,
          permissions: formattedPermissions,
          role: role !== undefined ? role : undefined,
          isActive: isActive !== undefined ? Boolean(isActive) : undefined,
        },
        select: {
          id: true,
          username: true,
          fullName: true,
          email: true,
          department: true,
          position: true,
          permissions: true,
          role: true,
          isActive: true,
          updatedAt: true,
        },
      });
    } catch (prismaErr: any) {
      console.warn('[PATCH /users] Prisma update failed, trying direct pg query:', prismaErr?.message);
      const { Pool } = require('pg');
      const directPool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      const updateQuery = `
        UPDATE users
        SET
          full_name = COALESCE($1::text, full_name),
          email = CASE WHEN $2::text IS NOT NULL THEN NULLIF($2::text, '') ELSE email END,
          department = COALESCE($3::text, department),
          position = COALESCE($4::text, position),
          permissions = COALESCE($5::text, permissions),
          is_active = COALESCE($6::boolean, is_active),
          updated_at = NOW()
        WHERE id = $7::uuid
        RETURNING id, username, full_name as "fullName", email, department, position, permissions, role, is_active as "isActive", updated_at as "updatedAt"
      `;

      const pgRes = await directPool.query(updateQuery, [
        fullName !== undefined ? String(fullName).trim() : null,
        email !== undefined ? String(email).trim() : null,
        department !== undefined ? String(department).trim() : null,
        position !== undefined ? String(position).trim() : null,
        formattedPermissions || null,
        isActive !== undefined ? Boolean(isActive) : null,
        id,
      ]);
      await directPool.end();

      if (pgRes.rows.length === 0) {
        return NextResponse.json({ success: false, error: 'User not found in database.' }, { status: 404 });
      }
      updated = pgRes.rows[0];
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully.',
      user: {
        ...updated,
        permissions: typeof updated.permissions === 'string' ? JSON.parse(updated.permissions || '[]') : (updated.permissions || []),
      },
    });
  } catch (error: any) {
    console.error('[PATCH /users] Fatal error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update user.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = getSessionUser(request);
    if (!session || session.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Access denied. Super Admin privileges required.' },
        { status: 403 }
      );
    }

    const { id } = params;
    if (id === session.id) {
      return NextResponse.json({ success: false, error: 'You cannot delete your own account.' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: `User "${user.fullName}" deleted successfully.` });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to delete user.' }, { status: 500 });
  }
}
