import crypto from 'crypto';

const SESSION_SECRET = process.env.SESSION_SECRET || 'legacy_cuisine_ultra_secure_jwt_secret_2026_!@#$%^';
const TOKEN_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/**
 * Hashes a plaintext password using PBKDF2 with a random 16-byte cryptographic salt.
 * Output format: "pbkdf2:100000:saltHex:hashHex"
 */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const iterations = 100000;
  const keylen = 64;
  const digest = 'sha512';
  const derivedKey = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);
  return `pbkdf2:${iterations}:${salt}:${derivedKey.toString('hex')}`;
}

/**
 * Verifies a plaintext password against a stored PBKDF2 hash using constant-time comparison.
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    if (!storedHash || !storedHash.startsWith('pbkdf2:')) {
      return false;
    }
    const parts = storedHash.split(':');
    if (parts.length !== 4) return false;

    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const originalHash = Buffer.from(parts[3], 'hex');

    const keylen = 64;
    const digest = 'sha512';
    const computedHash = crypto.pbkdf2Sync(password, salt, iterations, keylen, digest);

    if (originalHash.length !== computedHash.length) return false;
    return crypto.timingSafeEqual(originalHash, computedHash);
  } catch (error) {
    console.error('[Security] Error verifying password:', error);
    return false;
  }
}

export interface SessionPayload {
  id: string;
  username: string;
  fullName: string;
  department?: string;
  position?: string;
  permissions?: string[];
  role: 'SUPER_ADMIN' | 'MANAGER' | 'STAFF' | 'AGENT';
  exp: number;
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 * Output format: "base64Payload.signatureHex"
 */
export function generateSessionToken(user: {
  id: string;
  username: string;
  fullName: string;
  role?: string;
  department?: string | null;
  position?: string | null;
  permissions?: string | string[] | null;
}): string {
  let parsedPermissions: string[] = [];
  if (Array.isArray(user.permissions)) {
    parsedPermissions = user.permissions;
  } else if (typeof user.permissions === 'string') {
    try {
      parsedPermissions = JSON.parse(user.permissions);
    } catch {
      parsedPermissions = [];
    }
  }

  const payload: SessionPayload = {
    id: user.id,
    username: user.username,
    fullName: user.fullName,
    department: user.department || 'Operations',
    position: user.position || 'Staff Member',
    permissions: parsedPermissions,
    role: (user.role as any) || 'STAFF',
    exp: Date.now() + TOKEN_MAX_AGE_MS,
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const hmac = crypto.createHmac('sha256', SESSION_SECRET);
  hmac.update(payloadB64);
  const signature = hmac.digest('hex');

  return `${payloadB64}.${signature}`;
}

/**
 * Checks if a session payload holds a specific permission or has IT Department / root admin override.
 * IT Department members automatically receive FULL ACCESS across the entire system, EXCEPT interns.
 */
export function hasPermission(sessionUser: SessionPayload | null | undefined, permissionKey: string): boolean {
  if (!sessionUser) return false;

  // 1. Check IT Department (Full Access to all non-interns)
  const isIT = sessionUser.department === 'IT & Systems Administration' || sessionUser.department === 'IT Department';
  const isIntern = sessionUser.position?.toLowerCase().includes('intern');
  if (isIT && !isIntern) return true;

  // 2. Direct master override
  if (sessionUser.role === 'SUPER_ADMIN') return true;
  if (sessionUser.permissions?.includes('admin:all')) return true;

  // 3. Granular permission check
  return Boolean(sessionUser.permissions?.includes(permissionKey));
}

/**
 * Verifies and decodes an HMAC-SHA256 session token.
 */
export function verifySessionToken(token: string): { valid: boolean; user?: SessionPayload; error?: string } {
  try {
    if (!token || !token.includes('.')) {
      return { valid: false, error: 'Invalid token structure' };
    }

    const [payloadB64, signature] = token.split('.');
    const hmac = crypto.createHmac('sha256', SESSION_SECRET);
    hmac.update(payloadB64);
    const expectedSignature = hmac.digest('hex');

    const sigBuf = Buffer.from(signature, 'hex');
    const expBuf = Buffer.from(expectedSignature, 'hex');

    if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
      return { valid: false, error: 'Invalid token signature' };
    }

    const payload: SessionPayload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf-8'));
    if (payload.exp && payload.exp < Date.now()) {
      return { valid: false, error: 'Session token has expired' };
    }

    return { valid: true, user: payload };
  } catch (error: any) {
    return { valid: false, error: error.message || 'Verification failure' };
  }
}

