import { Router } from 'express';
import {
  createChecklist,
  getChecklists,
  createBusinessRegistration,
  getBusinessRegistrations,
  createAgentRegistration,
  getAgentRegistrations,
} from '../controllers/form.controller';

const router = Router();

// Merchant Checklist Endpoints
router.post('/checklist', createChecklist);
router.get('/checklist', getChecklists);

// Business Registration Endpoints
router.post('/registration', createBusinessRegistration);
router.get('/registration', getBusinessRegistrations);

// Agent Registration (Borang Ejen) Endpoints
router.post('/agent-registration', createAgentRegistration);
router.get('/agent-registration', getAgentRegistrations);

export default router;
