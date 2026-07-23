import { Router } from 'express';
import { VendorController } from '../controllers/vendor.controller';

const router = Router();

router.get('/', VendorController.getVendors);
router.post('/', VendorController.createVendor);
router.post('/storefronts', VendorController.createStorefront);

export default router;
