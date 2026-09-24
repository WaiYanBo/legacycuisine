import { Router } from 'express';
import {
  createChecklist,
  getChecklists,
  createBusinessRegistration,
  getBusinessRegistrations,
  createAgentRegistration,
  getAgentRegistrations,
} from '../controllers/form.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

// Merchant Checklist Endpoints
router.post('/checklist', createChecklist);
router.get('/checklist', requireAuth, getChecklists);

// Business Registration Endpoints
router.post('/registration', createBusinessRegistration);
router.get('/registration', requireAuth, getBusinessRegistrations);

// Agent Registration (Borang Ejen) Endpoints
router.post('/agent-registration', createAgentRegistration);
router.get('/agent-registration', requireAuth, getAgentRegistrations);

export default router;
