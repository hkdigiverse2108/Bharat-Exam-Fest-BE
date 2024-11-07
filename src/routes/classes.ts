import express from 'express';
import { classesController } from "../controllers";

const router = express.Router();

router.post('/add', classesController.add_classes)
router.post('/edit', classesController.edit_classes_by_id)
router.delete('/delete/:id', classesController.delete_classes_by_id)
router.get('/all', classesController.get_all_classes)
router.get('/:id', classesController.get_classes_by_id)

export let classesRouter = router;