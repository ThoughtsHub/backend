import { Router } from "express";
import handler from "../controllers/email.js";

const router = Router();

router.get("/resend/:username", handler.resend.params); // username should be in url after /resend/username

router.get("/resend", handler.resend.query); // username should be in query, /resend?username=your-username

// username should be in url after /resend/username,
// otp should be in body
router.post("/verify/:username", handler.verify.params);

// both username and otp should be in body
router.post("/verify", handler.verify.body);

export const EmailRouter = router;
