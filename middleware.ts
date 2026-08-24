import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('lc_session')?.value || request.cookies.get('lc_auth')?.value;
  const { pathname } = request.nextUrl;

  // Protect all dashboard and internal form routes
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/en') || 
    pathname.startsWith('/ms');

  // If user is accessing protected route without session
  if (isProtectedPath && !sessionCookie) {
    const loginUrl = new URL('/', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/en/:path*', '/ms/:path*'],
};

