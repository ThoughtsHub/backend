import { Router } from "express";
import ForgotPasswordController from "../controllers/ForgotPasswordController.js";

const router = Router();

router.post("/otp/get", ForgotPasswordController.sendOtp);

router.post("/otp/verify", ForgotPasswordController.verifyOtp);

router.post("/set-password", ForgotPasswordController.resetPassword);

export const ForgotPasswordRouter = router;
