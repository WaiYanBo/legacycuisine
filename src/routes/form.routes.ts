import { Router } from 'express';
import {
  createChecklist,
  getChecklists,
  createBusinessRegistration,
  getBusinessRegistrations,
} from '../controllers/form.controller';

const router = Router();

// Vendor Checklist Endpoints
router.post('/checklist', createChecklist);
router.get('/checklist', getChecklists);

// Business Registration Endpoints
router.post('/registration', createBusinessRegistration);
router.get('/registration', getBusinessRegistrations);

export default router;
