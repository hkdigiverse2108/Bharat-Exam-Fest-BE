import express from 'express';
import { questionController, subjectController } from "../controllers";

const router = express.Router();

router.post('/add', questionController.add_question)
router.post('/edit', questionController.edit_question_by_id)
router.delete('/delete/:id', questionController.delete_question_by_id)
router.get('/all', questionController.get_all_questions)
router.get('/subject-wise-question-count', questionController.subject_wise_question_count)
router.get('/:id', questionController.get_question_by_id)

export let questionRouter = router;