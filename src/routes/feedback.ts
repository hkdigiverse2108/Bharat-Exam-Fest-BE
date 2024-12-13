import express from 'express';
import { feedbackController } from "../controllers";

const router = express.Router();

router.post('/add', feedbackController.add_feedback)
router.post('/edit', feedbackController.edit_feedback_by_id)
router.delete('/delete/:id', feedbackController.delete_feedback_by_id)
router.get('/all', feedbackController.get_all_feedback)
router.get('/:id', feedbackController.get_feedback_by_id)

export let feedbackRouter = router;