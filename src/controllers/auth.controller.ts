import { Request, Response } from 'express';
import { prisma } from '../prisma';
import { hashPassword, verifyPassword, generateSessionToken, verifySessionToken, SessionPayload } from '../utils/security';

/**
 * Extracts authenticated user session payload from request.
 */
export function getAuthenticatedUser(req: Request): SessionPayload | null {
  const token = req.cookies?.lc_session || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  const result = verifySessionToken(token);
  return result.valid && result.user ? result.user : null;
}

/**
 * 1. Login Portal Endpoint
 * POST /api/auth/login
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ success: false, error: 'Please enter Username and Password. / Sila masukkan Nama Pengguna dan Kata Laluan.' });
      return;
    }

    const trimmedUsername = String(username).trim();

    const user = await prisma.user.findFirst({
      where: {
        username: {
          equals: trimmedUsername,
          mode: 'insensitive',
        },
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid Username or Password. / Nama Pengguna atau Kata Laluan tidak sah.' });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({ success: false, error: 'Your account has been deactivated. Please contact the administrator. / Akaun anda telah dinyahaktifkan.' });
      return;
    }

    const isMatch = verifyPassword(String(password), user.passwordHash);
    if (!isMatch) {
      res.status(401).json({ success: false, error: 'Invalid Username or Password. / Nama Pengguna atau Kata Laluan tidak sah.' });
      return;
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });

    const token = generateSessionToken({
      id: user.id,
      username: user.username,
      fullName: user.fullName,
      role: user.role,
    });

    // Set secure cookies
    res.cookie('lc_session', token, {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.cookie('lc_auth', 'authenticated', {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      message: 'Login successful. / Log masuk berjaya.',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error: any) {
    console.error('[AuthController] Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during authentication.' });
  }
}

/**
 * 2. Get Current Authenticated User
 * GET /api/auth/me
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const session = getAuthenticatedUser(req);
    if (!session) {
      res.status(401).json({ success: false, error: 'Unauthorized / Session expired.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
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
    });

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: 'User does not exist or is inactive.' });
      return;
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to verify session.' });
  }
}

/**
 * 3. Logout Endpoint
 * POST /api/auth/logout
 */
export async function logout(req: Request, res: Response): Promise<void> {
  res.clearCookie('lc_session', { path: '/' });
  res.clearCookie('lc_auth', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
}

/**
 * 4. Self-Service Change Password
 * POST /api/auth/change-password
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
  try {
    const session = getAuthenticatedUser(req);
    if (!session) {
      res.status(401).json({ success: false, error: 'Please log in again.' });
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      res.status(400).json({ success: false, error: 'Please complete all password fields.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      res.status(400).json({ success: false, error: 'New password and confirmation do not match.' });
      return;
    }

    if (newPassword.length < 8) {
      res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: session.id },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found.' });
      return;
    }

    const isMatch = verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      res.status(400).json({ success: false, error: 'Current password is incorrect.' });
      return;
    }

    const newHash = hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    res.json({ success: true, message: 'Your password has been successfully updated.' });
  } catch (error: any) {
    console.error('[AuthController] Change password error:', error);
    res.status(500).json({ success: false, error: 'Failed to update password.' });
  }
}

/**
 * 5. List Staff (Access Control)
 * GET /api/auth/users
 */
export async function listStaff(req: Request, res: Response): Promise<void> {
  try {
    const session = getAuthenticatedUser(req);
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'MANAGER')) {
      res.status(403).json({ success: false, error: 'Access denied. Administrator permissions required.' });
      return;
    }

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

    res.json({ success: true, users });
  } catch (error: any) {
    console.error('[AuthController] List staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch staff list.' });
  }
}

/**
 * 6. Create New Staff (Access Control)
 * POST /api/auth/users
 */
export async function createStaff(req: Request, res: Response): Promise<void> {
  try {
    const session = getAuthenticatedUser(req);
    if (!session || session.role !== 'SUPER_ADMIN') {
      res.status(403).json({ success: false, error: 'Access denied. Only Super Admins can add staff.' });
      return;
    }

    const { username, fullName, email, password, role } = req.body;

    if (!username || !fullName || !password) {
      res.status(400).json({ success: false, error: 'Please enter Username, Full Name, and Password.' });
      return;
    }

    if (password.length < 8) {
      res.status(400).json({ success: false, error: 'Password must be at least 8 characters long.' });
      return;
    }

    const trimmedUsername = String(username).trim();
    const existing = await prisma.user.findFirst({
      where: {
        username: {
          equals: trimmedUsername,
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      res.status(400).json({ success: false, error: `Username "${trimmedUsername}" is already taken.` });
      return;
    }

    const passwordHash = hashPassword(password);
    const validRoles = ['SUPER_ADMIN', 'MANAGER', 'STAFF', 'AGENT'];
    const assignedRole = validRoles.includes(role) ? role : 'STAFF';

    const newUser = await prisma.user.create({
      data: {
        username: trimmedUsername,
        fullName: String(fullName).trim(),
        email: email ? String(email).trim() : null,
        passwordHash,
        role: assignedRole as any,
        isActive: true,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      message: `Staff account for "${newUser.fullName}" created successfully.`,
      user: newUser,
    });
  } catch (error: any) {
    console.error('[AuthController] Create staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to create staff account.' });
  }
}

/**
 * 7. Update Staff Role / Details
 * PATCH /api/auth/users/:id
 */
export async function updateStaff(req: Request, res: Response): Promise<void> {
  try {
    const session = getAuthenticatedUser(req);
    if (!session || session.role !== 'SUPER_ADMIN') {
      res.status(403).json({ success: false, error: 'Access denied. Super Admin privileges required.' });
      return;
    }

    const { id } = req.params;
    const { fullName, email, role, isActive } = req.body;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, error: 'Staff member not found.' });
      return;
    }

    // Protect against self-deactivation or self-demotion
    if (user.id === session.id) {
      if (isActive === false) {
        res.status(400).json({ success: false, error: 'You cannot deactivate your own account.' });
        return;
      }
      if (role && role !== 'SUPER_ADMIN') {
        res.status(400).json({ success: false, error: 'You cannot alter your own role.' });
        return;
      }
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        fullName: fullName !== undefined ? String(fullName).trim() : undefined,
        email: email !== undefined ? (email ? String(email).trim() : null) : undefined,
        role: role !== undefined ? role : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({ success: true, message: 'Staff member updated successfully.', user: updated });
  } catch (error: any) {
    console.error('[AuthController] Update staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to update staff member.' });
  }
}

/**
 * 8. Reset Staff Password by Admin
 * POST /api/auth/users/:id/reset-password
 */
export async function resetStaffPassword(req: Request, res: Response): Promise<void> {
  try {
    const session = getAuthenticatedUser(req);
    if (!session || session.role !== 'SUPER_ADMIN') {
      res.status(403).json({ success: false, error: 'Access denied. Only Super Admins can reset passwords.' });
      return;
    }

    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 8) {
      res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, error: 'Staff member not found.' });
      return;
    }

    const newHash = hashPassword(newPassword);
    await prisma.user.update({
      where: { id },
      data: { passwordHash: newHash },
    });

    res.json({ success: true, message: `Password for "${user.fullName}" reset successfully.` });
  } catch (error: any) {
    console.error('[AuthController] Reset password error:', error);
    res.status(500).json({ success: false, error: 'Failed to reset staff password.' });
  }
}

/**
 * 9. Delete Staff Account
 * DELETE /api/auth/users/:id
 */
export async function deleteStaff(req: Request, res: Response): Promise<void> {
  try {
    const session = getAuthenticatedUser(req);
    if (!session || session.role !== 'SUPER_ADMIN') {
      res.status(403).json({ success: false, error: 'Access denied. Super Admin privileges required.' });
      return;
    }

    const { id } = req.params;
    if (id === session.id) {
      res.status(400).json({ success: false, error: 'You cannot delete your own account.' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      res.status(404).json({ success: false, error: 'Staff member not found.' });
      return;
    }

    await prisma.user.delete({ where: { id } });
    res.json({ success: true, message: `Staff member "${user.fullName}" deleted successfully.` });
  } catch (error: any) {
    console.error('[AuthController] Delete staff error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete staff member.' });
  }
}
