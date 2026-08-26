import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '../../../../src/utils/security';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('lc_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!token) {
      // Backwards compatible default session if lc_auth cookie exists
      const authCookie = request.cookies.get('lc_auth')?.value;
      if (authCookie === 'authenticated') {
        return NextResponse.json({
          success: true,
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            username: 'Wai Yan Bo',
            fullName: 'Wai Yan Bo (Super Administrator)',
            email: 'admin@legacycuisine.com',
            role: 'SUPER_ADMIN',
            isActive: true,
          },
        });
      }
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const result = verifySessionToken(token);
    if (!result.valid || !result.user) {
      return NextResponse.json({ success: false, error: 'Invalid or expired session' }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user.id,
        username: result.user.username,
        fullName: result.user.fullName,
        role: result.user.role,
        isActive: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
