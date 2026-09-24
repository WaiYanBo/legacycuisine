import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST() {
  const response = NextResponse.json({ success: true, message: 'Logged out' });
  response.cookies.set('lc_session', '', { path: '/', maxAge: 0 });
  response.cookies.set('lc_auth', '', { path: '/', maxAge: 0 });
  return response;
}
