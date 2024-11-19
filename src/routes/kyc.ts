import express from 'express';
import { kycController } from "../controllers";

const router = express.Router();

router.post('/add', kycController.add_kyc)
router.post('/edit', kycController.edit_kyc_by_id)
router.delete('/delete/:id', kycController.delete_kyc_by_id)
router.get('/all', kycController.get_all_kyc)
router.get('/:id', kycController.get_kyc_by_id)

export let kycRouter = router;