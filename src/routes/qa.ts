import express from 'express';
import { qaController } from "../controllers";

const router = express.Router();

router.post('/add', qaController.add_qa)
router.post('/edit', qaController.edit_qa_by_id)
// router.delete('/delete/:id', qaController.delete_qa_by_id)
router.get('/all', qaController.get_all_qa)
router.get("/contest/question", qaController.get_user_contest_question_by_id)
router.get("/contest/ranks", qaController.get_all_contest_ranks)
router.post('/why-false', qaController.update_qa_by_answer_id)
router.get("/mistake-map/:id", qaController.mistake_map_report)

export let qaRouter = router;