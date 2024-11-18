import express from 'express';
import { aboutUsController } from "../controllers";

const router = express.Router();

router.post('/add/edit', aboutUsController.add_edit_about_us)
router.get('/', aboutUsController.get_about_us)

export let aboutUsRouter = router;