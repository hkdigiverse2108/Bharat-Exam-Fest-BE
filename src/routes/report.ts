import express from 'express';
import { reportController } from "../controllers";

const router = express.Router();

router.get("", reportController.get_report)


export let reportRouter = router;