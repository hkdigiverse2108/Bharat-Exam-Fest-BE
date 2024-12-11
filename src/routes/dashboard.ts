import express from 'express';
import { dashboardController } from "../controllers";

const router = express.Router();

router.get('', dashboardController.dashboard)

export let dashboardRouter = router;