import { Router } from "express";
import handler from "../controllers/email.js";

const router = Router();

// requires email in query
router.get("/verify", handler.send); // send otp

// requires email and otp in body
router.post("/verify", handler.verify); // verify otp

export const EmailRouter = router;
