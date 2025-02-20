import { Router } from "express";
import controller from "../controllers/controllers.js";

const OtpController = controller.otp;

const router = Router();

router.post("/get", OtpController.getOtp);

router.post("/verify", OtpController.verifyOtp);

export const OtpRouter = router;
