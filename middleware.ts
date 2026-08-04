import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const authCookie = request.cookies.get('lc_auth');
  const { pathname } = request.nextUrl;

  // Protect all dashboard and form routes
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/en') || 
    pathname.startsWith('/ms');

  if (isProtectedPath && authCookie?.value !== 'authenticated') {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/en/:path*', '/ms/:path*'],
};
