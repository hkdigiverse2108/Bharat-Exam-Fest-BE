import express from 'express';
import { authController } from "../controllers";

const router = express.Router();

router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.post('/otp/verify', authController.otp_verification)
router.post('/forgot-password', authController.forgot_password)
router.post('/reset-password', authController.reset_password)
router.post('/change-password', authController.change_user_password)

export let authRouter = router; 