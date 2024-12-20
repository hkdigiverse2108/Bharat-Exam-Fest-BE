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
import { privacyPolicyRouter } from "./privacy-policy";
import { termsConditionRouter } from "./terms-condition";
import { illegalityRouter } from "./illegality";
import { aboutUsRouter } from "./about-us";
import { kycRouter } from "./kyc";
import { contestTypeRouter } from "./contest-type";
import { uploadRouter } from "./upload";
import { qaRouter } from "./qa";
import { transactionRouter } from "./transaction";
import { questionReportRouter } from "./question-report";
import { resultReportRouter } from "./result-report";
import { reportRouter } from "./report";
import { pdfRouter } from "./pdf";
import { dashboardRouter } from "./dashboard";
import { feedbackRouter } from "./feedback";

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
router.use('/privacy-policy', privacyPolicyRouter)
router.use('/terms-condition', termsConditionRouter)
router.use('/illegality', illegalityRouter)
router.use('/about-us', aboutUsRouter)
router.use('/kyc', kycRouter)
router.use('/contest-type', contestTypeRouter)
router.use('/upload', uploadRouter)
router.use('/qa', qaRouter)
router.use('/transaction', transactionRouter)
router.use('/question-report', questionReportRouter)
router.use('/result-report', resultReportRouter)
router.use('/report', reportRouter)
router.use('/pdf', pdfRouter)
router.use('/dashboard', dashboardRouter)
router.use('/feedback', feedbackRouter)

export default router