import { Request, Response, NextFunction } from 'express';
import { getAuthenticatedUser } from '../controllers/auth.controller';
import { hasPermission, SessionPayload } from '../utils/security';

export interface AuthenticatedRequest extends Request {
  user?: SessionPayload;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const user = getAuthenticatedUser(req);
  if (!user) {
    res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
    return;
  }
  req.user = user;
  next();
}

export function requirePermission(permissionKey: string) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    const user = getAuthenticatedUser(req);
    if (!user) {
      res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
      return;
    }
    if (!hasPermission(user, permissionKey)) {
      res.status(403).json({ success: false, error: `Forbidden: Missing required permission "${permissionKey}".` });
      return;
    }
    req.user = user;
    next();
  };
}
