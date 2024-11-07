import { Router } from "express";
import { authController } from "../controllers";
import { authRouter } from "./auth";
import { subjectRouter } from "./subject";
import { adminJWT } from "../helper";
import { classesRouter } from "./classes";
import { userRouter } from "./user";
import { contestRouter } from "./contest";
import { subTopicRouter } from "./sub-topic";

const router = Router()

router.use('/auth', authRouter)
router.use('/user', userRouter)

router.use(adminJWT)
router.use('/subject', subjectRouter)
router.use('/classes', classesRouter)
router.use('/contest', contestRouter)
router.use('/sub-topic', subTopicRouter)

export default router