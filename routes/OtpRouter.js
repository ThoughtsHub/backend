import { Router } from "express";
import OtpController from "../controllers/OtpController.js";

const router = Router();

router.post("/get", OtpController.sendOtp);

router.post("/verify", OtpController.verifyOtp);

export const OtpRouter = router;
