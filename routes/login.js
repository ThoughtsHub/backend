import { Router } from "express";
import h from "../controllers/handlers.js";

const loginHandler = h.login; // login handler
const emailHandler = h.email; // login handler

const router = Router();

router.post("/login", loginHandler.login);

router.post("/get-otp", emailHandler.send);

router.post("/verify-otp", emailHandler.verify);

router.post("/create-password", loginHandler.signup);

export const LoginRouter = router;
