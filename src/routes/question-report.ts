import express from 'express';
import { questionReportController } from "../controllers";

const router = express.Router();

router.post('/add', questionReportController.add_question_report)
router.post('/edit', questionReportController.edit_question_report_by_id)
router.delete('/delete/:id', questionReportController.delete_question_report_by_id)
router.get('/all', questionReportController.get_all_question_report)
router.get('/:id', questionReportController.get_question_report_by_id)

export let questionReportRouter = router;