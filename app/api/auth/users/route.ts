import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { hashPassword } from '../../../../src/utils/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const users = await prisma.user.findMany({
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
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const parsedUsers = users.map((u) => ({
      ...u,
      department: (u.department || 'Operations').trim(),
      position: (u.position || 'Staff Member').trim(),
      permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : (u.permissions || []),
    }));

    return NextResponse.json({ success: true, users: parsedUsers }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[API /users] Prisma error, attempting direct pg query:', error?.message || error);
    
    // Direct PG Pool Fallback for Serverless Resilience
    try {
      const { Pool } = require('pg');
      const directPool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });
      const dbRes = await directPool.query(
        'SELECT id, username, full_name as "fullName", email, department, position, permissions, role, is_active as "isActive", last_login as "lastLogin", created_at as "createdAt" FROM users ORDER BY created_at DESC'
      );
      await directPool.end();

      const parsedUsers = dbRes.rows.map((u: any) => ({
        ...u,
        department: (u.department || 'Operations').trim(),
        position: (u.position || 'Staff Member').trim(),
        permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : (u.permissions || []),
      }));

      return NextResponse.json({ success: true, users: parsedUsers }, {
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate' },
      });
    } catch (pgErr: any) {
      console.error('[API /users] Direct PG query also failed:', pgErr?.message || pgErr);
      return NextResponse.json({
        success: false,
        error: 'Database connection error. Please ensure database pooler is reachable.',
        users: [],
      }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, fullName, email, password, department, position, permissions, role } = body;

    if (!username || !fullName || !password) {
      return NextResponse.json({ success: false, error: 'Please fill in all required fields.' }, { status: 400 });
    }

    const trimmed = String(username).trim();
    const passwordHash = hashPassword(password);
    const resolvedDept = department ? String(department).trim() : 'Operations & Reconciliation';
    const resolvedPos = position ? String(position).trim() : 'Staff Member';

    // IT Department automatically gets full permissions unless they are an intern
    const isIT = resolvedDept === 'IT & Systems Administration' || resolvedDept === 'IT Department';
    const isIntern = resolvedPos.toLowerCase().includes('intern');

    let finalPerms = permissions;
    if (isIT && !isIntern && (!permissions || permissions.length === 0)) {
      finalPerms = ['admin:all', 'dashboard:view', 'analytics:view', 'reconciliation:process', 'invoices:generate', 'products:edit', 'forms:submit', 'forms:review', 'users:manage'];
    }

    const formattedPermissions = Array.isArray(finalPerms)
      ? JSON.stringify(finalPerms)
      : typeof finalPerms === 'string'
      ? finalPerms
      : JSON.stringify(['dashboard:view', 'forms:submit']);

    let newUser: any;
    try {
      newUser = await prisma.user.create({
        data: {
          username: trimmed,
          fullName: String(fullName).trim(),
          email: email ? String(email).trim() : null,
          department: resolvedDept,
          position: resolvedPos,
          permissions: formattedPermissions,
          passwordHash,
          role: role || (isIT && !isIntern ? 'SUPER_ADMIN' : 'STAFF'),
          isActive: true,
        },
      });
    } catch (prismaErr: any) {
      console.warn('[POST /users] Prisma create failed, trying direct pg query:', prismaErr?.message);
      const { Pool } = require('pg');
      const directPool = new Pool({
        connectionString: process.env.DATABASE_URL || process.env.DIRECT_URL,
        ssl: { rejectUnauthorized: false },
        connectionTimeoutMillis: 5000,
      });

      const insertQuery = `
        INSERT INTO users (username, full_name, email, department, position, permissions, password_hash, role, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true, NOW(), NOW())
        RETURNING id, username, full_name as "fullName", email, department, position, permissions, role, is_active as "isActive", created_at as "createdAt", updated_at as "updatedAt"
      `;

      const pgRes = await directPool.query(insertQuery, [
        trimmed,
        String(fullName).trim(),
        email ? String(email).trim() : null,
        resolvedDept,
        resolvedPos,
        formattedPermissions,
        passwordHash,
        role || (isIT && !isIntern ? 'SUPER_ADMIN' : 'STAFF'),
      ]);
      await directPool.end();
      newUser = pgRes.rows[0];
    }

    return NextResponse.json({
      success: true,
      user: {
        ...newUser,
        permissions: typeof newUser.permissions === 'string' ? JSON.parse(newUser.permissions || '[]') : (newUser.permissions || []),
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create user.' }, { status: 500 });
  }
}
