import { Router } from 'express';
import { MerchantController } from '../controllers/merchant.controller';
import { requireAuth } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', MerchantController.getMerchants);
router.post('/', requireAuth, MerchantController.createMerchant);
router.post('/storefronts', requireAuth, MerchantController.createStorefront);

export default router;
