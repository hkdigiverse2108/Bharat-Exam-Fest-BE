import express from 'express';
import { qaController } from "../controllers";

const router = express.Router();

router.post('/add', qaController.add_qa)
router.post('/edit', qaController.edit_qa_by_id)
// router.delete('/delete/:id', qaController.delete_qa_by_id)
router.get('/all', qaController.get_all_qa)
router.get("/contest/question", qaController.get_user_contest_question_by_id)
router.get("/contest/ranks", qaController.get_all_contest_ranks)
// router.get('/:id', qaController.get_qa_by_id)

export let qaRouter = router;