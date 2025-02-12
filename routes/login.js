import { Router } from "express";
import h from "../controllers/handlers.js";
import auth from "../middlewares/auth.js";

const loginHandler = h.login; // login handler
const emailHandler = h.email; // login handler

const router = Router();

// login
router.post("/login", loginHandler.login);

// signup
router.post("/get-otp", emailHandler.send);

router.post("/verify-otp", emailHandler.verify);

router.post("/create-password", loginHandler.signup);

router.post("/set-username", auth.verify, loginHandler.setUsername);

export const LoginRouter = router;
