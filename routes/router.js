import { Router } from "express";
import { LoginRouter } from "./login.js";
import { OtpRouter } from "./otp.js";
import { TestRouter } from "./extras_testing.js";
import { OtherRouter } from "./other.js";
import { ProfileRouter } from "./profile.js";
import { ForumsRouter } from "./forums.js";
import { NewsRouter } from "./news.js";
import { AdminRouter } from "./admin.js";
import { loggedAsAdmin } from "../middlewares/auth/auth.js";
import { UploadRouter } from "./upload.js";
import { ReportRouter } from "./report.js";
import { FeedbackRouter } from "./feedback.js";

const router = Router();

router.use("/", LoginRouter);
router.use("/", TestRouter);
router.use("/", OtherRouter);
router.use("/otp", OtpRouter);
router.use("/profile", ProfileRouter);
router.use("/forums", ForumsRouter);
router.use("/news", NewsRouter);
router.use("/upload", UploadRouter);
router.use("/report", ReportRouter);
router.use("/feedback", FeedbackRouter);

router.use("/admin", loggedAsAdmin, AdminRouter);

router.get(["/admin-panel/", "/admin-panel/:other"], async (req, res) => {
  res.sendFile("/dist/index.html", { root: "./public" });
});

export const AppRouter = router;
