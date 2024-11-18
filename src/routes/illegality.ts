import express from 'express';
import { illegalityController } from "../controllers";

const router = express.Router();

router.post('/add/edit', illegalityController.add_edit_illegality)
router.get('/', illegalityController.get_illegality)

export let illegalityRouter = router;