import { Router } from "express";
import { LoginRouter } from "./login.js";
import { OtpRouter } from "./otp.js";
import { TestRouter } from "./extras_testing.js";
import { OtherRouter } from "./other.js";
import { ProfileRouter } from "./profile.js";
import { ProfileCollegeRouter } from "./school.js";
import { ForumsRouter } from "./forums.js";
import { StoryRouter } from "./story.js";
import { NewsRouter } from "./news.js";

const router = Router();

router.use("/", LoginRouter);
router.use("/", TestRouter);
router.use("/", OtherRouter);
router.use("/otp", OtpRouter);
router.use("/profile", ProfileRouter);
router.use("/school", ProfileCollegeRouter);
router.use("/forums", ForumsRouter);
router.use("/story", StoryRouter);
router.use("/news", NewsRouter);

export const AppRouter = router;
