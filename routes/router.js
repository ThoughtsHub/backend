import { Router } from "express";
import { LoginRouter } from "./login.js";
import { OtpRouter } from "./otp.js";
import { TestRouter } from "./extras_testing.js";
import { OtherRouter } from "./other.js";
import { ProfileRouter } from "./profile.js";
import { ProfileCollegeRouter } from "./school.js";

const router = Router();

router.use("/", LoginRouter);
router.use("/otp", OtpRouter);
router.use("/", TestRouter);
router.use("/", OtherRouter);
router.use("/profile", ProfileRouter);
router.use("/school", ProfileCollegeRouter);

export const AppRouter = router;
