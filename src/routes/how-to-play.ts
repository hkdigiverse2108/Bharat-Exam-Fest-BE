import express from 'express';
import { howToPlayController } from "../controllers";

const router = express.Router();

router.post('/add', howToPlayController.add_how_to_play)
router.post('/edit', howToPlayController.edit_how_to_play_by_id)
router.delete('/delete/:id', howToPlayController.delete_how_to_play_by_id)
router.get('/all', howToPlayController.get_all_how_to_play)
router.get('/:id', howToPlayController.get_how_to_play_by_id)

export let howToPlayRouter = router;