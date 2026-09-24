import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken } from '../../../../src/utils/security';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('lc_session')?.value || request.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No session token provided.' }, { status: 401 });
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
        email: result.user.email,
        department: result.user.department || (result.user.role === 'AGENT' ? 'Field Recruitment' : 'Operations'),
        position: result.user.position || (result.user.role === 'AGENT' ? 'Agent' : 'Staff Member'),
        permissions: result.user.permissions || [],
        role: result.user.role,
        isActive: true,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
