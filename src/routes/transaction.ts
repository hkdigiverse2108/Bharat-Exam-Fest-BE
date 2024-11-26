import express from 'express';
import { transactionController } from "../controllers";

const router = express.Router();

router.post('/add', transactionController.add_transaction)
router.delete('/delete/:id', transactionController.delete_transaction_by_id)
router.get('/all', transactionController.get_all_transaction)
router.get('/:id', transactionController.get_transaction_by_id)

export let transactionRouter = router;