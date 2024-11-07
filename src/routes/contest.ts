import express from 'express';
import { contestController } from "../controllers";

const router = express.Router();

router.post('/add', contestController.add_contest)
router.post('/edit', contestController.edit_contest_by_id)
router.delete('/delete/:id', contestController.delete_contest_by_id)
router.get('/all', contestController.get_all_contests)
router.get('/:id', contestController.get_contest_by_id)

export let contestRouter = router;