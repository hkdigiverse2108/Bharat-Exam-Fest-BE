import express from 'express';
import { balanceController } from "../controllers";

const router = express.Router();

router.post('/add', balanceController.add_balance)
router.get('/all', balanceController.get_all_balance)
router.get('/:id', balanceController.get_balance_by_id)

export let balanceRouter = router;