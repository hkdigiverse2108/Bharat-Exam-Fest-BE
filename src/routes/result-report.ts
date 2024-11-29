import express from 'express';
import { resultReportController } from "../controllers";

const router = express.Router();

router.post('/add', resultReportController.add_result_report)
router.post('/edit', resultReportController.edit_result_report_by_id)
router.delete('/delete/:id', resultReportController.delete_result_report_by_id)
router.get('/all', resultReportController.get_all_result_report)
router.get('/:id', resultReportController.get_result_report_by_id)

export let resultReportRouter = router;