import express from 'express';
import { subTopicController } from "../controllers";

const router = express.Router();

router.post('/add', subTopicController.add_sub_topic)
router.post('/edit', subTopicController.edit_sub_topic_by_id)
router.delete('/delete/:id', subTopicController.delete_sub_topic_by_id)
router.get('/all', subTopicController.get_all_sub_topic)
router.get('/:id', subTopicController.get_sub_topic_by_id)
router.get('/', subTopicController.get_all_sub_topics)

export let subTopicRouter = router;