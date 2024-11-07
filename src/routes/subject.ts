import express from 'express';
import { subjectController } from "../controllers";

const router = express.Router();

router.post('/add', subjectController.add_subject)
router.post('/edit', subjectController.edit_subject_by_id)
router.delete('/delete/:id', subjectController.delete_subject_by_id)
router.get('/all', subjectController.get_all_subject)
router.get('/:id', subjectController.get_subject_by_id)
router.get('/', subjectController.get_all_subject)

export let subjectRouter = router;