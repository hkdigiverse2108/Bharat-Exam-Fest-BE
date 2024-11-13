import express from 'express';
import { privacyPolicyController } from "../controllers";

const router = express.Router();

router.post('/add/edit', privacyPolicyController.add_edit_privacy_policy)
router.get('/', privacyPolicyController.get_privacy_policy)

export let privacyPolicyRouter = router;