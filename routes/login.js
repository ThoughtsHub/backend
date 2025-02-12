import { Router } from "express";
import h from "../controllers/handlers.js";
import { client } from "../db/connect.js";
import _password from "../utils/password.js";
import User from "../models/User.js";
import _user from "../utils/user.js";
import auth from "../middlewares/auth.js";
import cookie from "../constants/cookies.js";
import { COOKIE_OPTIONS } from "../controllers/login.js";

const loginHandler = h.login; // login handler
const emailHandler = h.email; // login handler

const router = Router();

router.post("/login", loginHandler.login);

router.post("/get-otp", emailHandler.send);

router.post("/verify-otp", emailHandler.verify);

router.post("/create-password", loginHandler.signup);

export const LoginRouter = router;
