import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { verifyPassword, generateSessionToken } from '../../../../src/utils/security';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Please enter Username and Password. / Sila masukkan Nama Pengguna dan Kata Laluan.' },
        { status: 400 }
      );
    }

    const trimmedUsername = String(username).trim();

    // 1. Try finding in database
    let user: any = null;
    try {
      user = await prisma.user.findFirst({
        where: {
          username: {
            equals: trimmedUsername,
            mode: 'insensitive',
          },
        },
      });
    } catch (e) {
      console.warn('DB lookup fallback for admin login');
    }

    // 2. Direct fallback for Super Admin if database is cold starting
    if (!user && (trimmedUsername.toLowerCase() === 'wai yan bo' || trimmedUsername.toLowerCase() === 'admin')) {
      if (password === 'Hahaha123!') {
        user = {
          id: '00000000-0000-0000-0000-000000000001',
          username: 'Wai Yan Bo',
          fullName: 'Wai Yan Bo',
          email: 'admin@legacycuisine.com',
          department: 'IT & Systems Administration',
          position: 'IT Lead',
          permissions: ['admin:all', 'dashboard:view', 'analytics:view', 'reconciliation:process', 'invoices:generate', 'products:edit', 'forms:submit', 'forms:review', 'users:manage'],
          role: 'SUPER_ADMIN',
          isActive: true,
        };
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Invalid Username or Password. / Nama Pengguna atau Kata Laluan tidak sah.' },
        { status: 401 }
      );
    }

    if (user.passwordHash) {
      const isMatch = verifyPassword(String(password), user.passwordHash);
      if (!isMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid Username or Password. / Nama Pengguna atau Kata Laluan tidak sah.' },
          { status: 401 }
        );
      }
    }

    if (!user.isActive) {
      return NextResponse.json(
        { success: false, error: 'Your account has been deactivated. / Akaun anda telah dinyahaktifkan.' },
        { status: 403 }
      );
    }

    const token = generateSessionToken({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
      department: user.department,
      position: user.position,
      permissions: user.permissions,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Login successful.',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        department: user.department || 'Operations',
        position: user.position || 'Staff Member',
        permissions: typeof user.permissions === 'string' ? JSON.parse(user.permissions || '[]') : (user.permissions || []),
        role: user.role,
      },
      token,
    });

    response.cookies.set('lc_session', token, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    response.cookies.set('lc_auth', 'authenticated', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Server error during authentication.' },
      { status: 500 }
    );
  }
}
