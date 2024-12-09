import express from 'express';
import { pdfController } from "../controllers";

const router = express.Router();

router.get('', pdfController.get_pdf)

export let pdfRouter = router;