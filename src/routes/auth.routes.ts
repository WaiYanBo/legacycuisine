import { Router } from 'express';
import {
  login,
  getMe,
  logout,
  changePassword,
  listStaff,
  createStaff,
  updateStaff,
  resetStaffPassword,
  deleteStaff,
} from '../controllers/auth.controller';

const router = Router();

// Public auth endpoints
router.post('/login', login);
router.post('/logout', logout);

// Authenticated session & self-service endpoints
router.get('/me', getMe);
router.post('/change-password', changePassword);

// Staff Access Control (RBAC) endpoints
router.get('/users', listStaff);
router.post('/users', createStaff);
router.patch('/users/:id', updateStaff);
router.post('/users/:id/reset-password', resetStaffPassword);
router.delete('/users/:id', deleteStaff);

export default router;
