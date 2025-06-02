import { Router } from "express";
import { LoginRouter } from "./LoginRouter.js";
import { OtpRouter } from "./OtpRouter.js";
import { ProfileRouter } from "./ProfileRouter.js";
import { ForumRouter } from "./ForumRouter.js";
import { ReportRouter } from "./ReportRouter.js";
import { FeedbackRouter } from "./FeedbackRouter.js";
import { OtherRouter } from "./OtherRouter.js";
import { NewsRouter } from "./NewsRouter.js";
import { loggedAsAdmin } from "../middlewares/auth.js";
import { AdminRouter } from "./AdminRouter.js";
import { UploadRouter } from "./UploadRouter.js";
import { WordleRouter } from "./WordleRouter.js";

const router = Router();

router.use("/", LoginRouter);
router.use("/", OtherRouter);
router.use("/otp", OtpRouter);
router.use("/profile", ProfileRouter);
router.use("/news", NewsRouter);
router.use("/forums", ForumRouter);
router.use("/report", ReportRouter);
router.use("/feedback", FeedbackRouter);
router.use("/upload", UploadRouter);
router.use("/wordle", WordleRouter);

router.use("/admin", loggedAsAdmin, AdminRouter);

router.get(
  ["/admin-panel/", "/admin-panel/:other", "/admin-panel/*"],
  async (req, res) => {
    res.redirect("https://admin.thoughtshub.agency/");
  }
);

export const AppRouter = router;
