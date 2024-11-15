import express from 'express';
import { termsConditionController } from "../controllers";

const router = express.Router();

router.post('/add/edit', termsConditionController.add_edit_terms_condition)
router.get('/', termsConditionController.get_terms_condition)

export let termsConditionRouter = router;