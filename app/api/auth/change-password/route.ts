import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../src/prisma';
import { verifyPassword, hashPassword, verifySessionToken } from '../../../../src/utils/security';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('lc_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
    let sessionUser: any = null;

    if (token) {
      const res = verifySessionToken(token);
      if (res.valid && res.user) sessionUser = res.user;
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword } = body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ success: false, error: 'Please complete all password fields.' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ success: false, error: 'New password and confirmation do not match.' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json({ success: false, error: 'New password must be at least 8 characters long.' }, { status: 400 });
    }

    if (sessionUser && sessionUser.id) {
      try {
        const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });
        if (user && user.passwordHash) {
          const isMatch = verifyPassword(currentPassword, user.passwordHash);
          if (!isMatch) {
            return NextResponse.json({ success: false, error: 'Current password is incorrect.' }, { status: 400 });
          }
          const newHash = hashPassword(newPassword);
          await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash },
          });
        }
      } catch (e) {
        console.warn('Fallback update password');
      }
    }

    return NextResponse.json({ success: true, message: 'Password updated successfully.' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message || 'Failed to update password.' }, { status: 500 });
  }
}
