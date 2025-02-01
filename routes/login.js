import { Router } from "express";
import _password from "../utils/password.js";
import _user from "../utils/user.js";
import handler from "../controllers/login.js";

const router = Router();

// Login
router.post("/", handler.login);

// Signup
router.post("/new", handler.signup);

export const LoginRouter = router;
