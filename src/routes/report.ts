import express from 'express';
import { reportController } from "../controllers";

const router = express.Router();

router.get('/user/contest', reportController.contest_user_report)

export let reportRouter = router;