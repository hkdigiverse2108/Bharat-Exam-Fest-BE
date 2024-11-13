import { Router } from "express";
import { authController } from "../controllers";
import { authRouter } from "./auth";
import { subjectRouter } from "./subject";
import { adminJWT } from "../helper";
import { classesRouter } from "./classes";
import { userRouter } from "./user";
import { contestRouter } from "./contest";
import { subTopicRouter } from "./sub-topic";
import { questionRouter } from "./question";
import { balanceRouter } from "./balance";
import { bannerRouter } from "./banner";
import { howToPlayRouter } from "./how-to-play";

const router = Router()

router.use('/auth', authRouter)
router.use('/user', userRouter)

router.use(adminJWT)
router.use('/subject', subjectRouter)
router.use('/classes', classesRouter)
router.use('/contest', contestRouter)
router.use('/sub-topic', subTopicRouter)
router.use('/question', questionRouter)
router.use('/balance', balanceRouter)
router.use('/banner', bannerRouter)
router.use('/how-to-play', howToPlayRouter)

export default router