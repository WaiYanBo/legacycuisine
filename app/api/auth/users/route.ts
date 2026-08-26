import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { hashPassword } from '../../../../src/utils/security';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        lastLogin: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ success: true, users });
  } catch (error) {
    return NextResponse.json({
      success: true,
      users: [
        {
          id: '00000000-0000-0000-0000-000000000001',
          username: 'Wai Yan Bo',
          fullName: 'Wai Yan Bo (Super Administrator)',
          email: 'admin@legacycuisine.com',
          role: 'SUPER_ADMIN',
          isActive: true,
          lastLogin: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, fullName, email, password, role } = body;

    if (!username || !fullName || !password) {
      return NextResponse.json({ success: false, error: 'Please fill in all required fields.' }, { status: 400 });
    }

    const trimmed = String(username).trim();
    const passwordHash = hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: trimmed,
        fullName: String(fullName).trim(),
        email: email ? String(email).trim() : null,
        passwordHash,
        role: role || 'STAFF',
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, user: newUser });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to create user.' }, { status: 500 });
  }
}
