import express from 'express';
import { contestTypeController } from "../controllers";

const router = express.Router();

router.post('/add', contestTypeController.add_contest_type)
router.post('/edit', contestTypeController.edit_contest_type_by_id)
router.delete('/delete/:id', contestTypeController.delete_contest_type_by_id)
router.get('/all', contestTypeController.get_all_contest_type)
router.get('/:id', contestTypeController.get_contest_type_by_id)
router.get('/', contestTypeController.get_all_contests_type)

export let contestTypeRouter = router;