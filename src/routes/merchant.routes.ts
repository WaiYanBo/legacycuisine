import { Router } from 'express';
import { MerchantController } from '../controllers/merchant.controller';

const router = Router();

router.get('/', MerchantController.getMerchants);
router.post('/', MerchantController.createMerchant);
router.post('/storefronts', MerchantController.createStorefront);

export default router;
