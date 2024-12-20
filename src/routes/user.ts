import express from 'express';
import { userController } from "../controllers";
import { adminJWT } from '../helper';

const router = express.Router();

router.post('/add', userController.add_user)

router.use(adminJWT)
router.post('/edit', userController.edit_user_by_id)
router.delete('/delete/:id', userController.delete_user_by_id)
router.get('/all', userController.get_all_users)
router.get('/profile-image/:id', userController.get_profile_image)
router.get('/referrals', userController.get_user_wise_referral_code)
router.get('/winner-list', userController.get_user_winner_list)
router.get('/:id', userController.get_user_by_id)
router.get('/', userController.get_all_user)

export let userRouter = router;