import express from 'express';
import { authController } from "../controllers";

const router = express.Router();

router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.post('/otp/verify', authController.otp_verification)

export let authRouter = router;