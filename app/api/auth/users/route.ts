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
      department: u.department || 'Operations',
      position: u.position || 'Staff Member',
      permissions: typeof u.permissions === 'string' ? JSON.parse(u.permissions || '[]') : (u.permissions || []),
    }));

    return NextResponse.json({ success: true, users: parsedUsers }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      },
    });
  } catch (error: any) {
    console.error('[API /users] Database error fetching users on deployed host:', error?.message || error);
    return NextResponse.json({
      success: true,
      users: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          username: 'Wai Yan Bo',
          fullName: 'Wai Yan Bo',
          email: 'admin@legacycuisine.com',
          department: 'IT & Systems Administration',
          position: 'IT Lead',
          permissions: ['admin:all', 'dashboard:view', 'analytics:view', 'reconciliation:process', 'invoices:generate', 'products:edit', 'forms:submit', 'forms:review', 'users:manage'],
          role: 'SUPER_ADMIN',
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
      warning: 'Using fallback list. Please ensure DATABASE_URL is configured in Netlify Environment Variables.',
    });
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

    const newUser = await prisma.user.create({
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

    return NextResponse.json({
      success: true,
      user: {
        ...newUser,
        permissions: typeof newUser.permissions === 'string' ? JSON.parse(newUser.permissions || '[]') : newUser.permissions,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create user.' }, { status: 500 });
  }
}
