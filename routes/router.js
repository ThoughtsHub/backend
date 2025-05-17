import { Router } from "express";
import { LoginRouter } from "./LoginRouter.js";
import { OtpRouter } from "./OtpRouter.js";
import { ProfileRouter } from "./ProfileRouter.js";
import { ForumRouter } from "./ForumRouter.js";
import { ReportRouter } from "./ReportRouter.js";
import { FeedbackRouter } from "./FeedbackRouter.js";
import { OtherRouter } from "./OtherRouter.js";
import { NewsRouter } from "./NewsRouter.js";

const router = Router();

router.use("/", LoginRouter);
router.use("/", OtherRouter);
router.use("/otp", OtpRouter);
router.use("/profile", ProfileRouter);
router.use("/news", NewsRouter);
router.use("/forums", ForumRouter);
router.use("/report", ReportRouter);
router.use("/feedback", FeedbackRouter);

export const AppRouter = router;
