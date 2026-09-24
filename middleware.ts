import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SESSION_SECRET = process.env.SESSION_SECRET || 'legacy_cuisine_ultra_secure_jwt_secret_2026_!@#$%^';

async function verifySessionTokenEdge(token: string): Promise<boolean> {
  if (!token || !token.includes('.')) return false;
  const [payloadB64, signature] = token.split('.');
  if (!payloadB64 || !signature) return false;

  // 1. Verify expiration
  try {
    const jsonStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(jsonStr);
    if (payload.exp && payload.exp < Date.now()) {
      return false;
    }
  } catch {
    return false;
  }

  // 2. Verify cryptographic HMAC-SHA256 signature using Web Crypto API
  try {
    const sigMatch = signature.match(/.{1,2}/g);
    if (!sigMatch) return false;
    const sigBytes = new Uint8Array(sigMatch.map((b) => parseInt(b, 16)));
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      enc.encode(SESSION_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );
    return await crypto.subtle.verify('HMAC', key, sigBytes, enc.encode(payloadB64));
  } catch {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get('lc_session')?.value;
  const { pathname } = request.nextUrl;

  // Protect all dashboard and internal form routes
  const isProtectedPath = 
    pathname.startsWith('/dashboard') || 
    pathname.startsWith('/en') || 
    pathname.startsWith('/ms');

  // Verify session cryptographically
  if (isProtectedPath) {
    const isValid = sessionToken ? await verifySessionTokenEdge(sessionToken) : false;
    if (!isValid) {
      const loginUrl = new URL('/', request.url);
      const res = NextResponse.redirect(loginUrl);
      if (sessionToken) {
        res.cookies.delete('lc_session');
      }
      res.cookies.delete('lc_auth');
      return res;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/en/:path*', '/ms/:path*'],
};
