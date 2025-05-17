import { Router } from "express";
import LoginController from "../controllers/loginController.js";
import { loggedIn } from "../middlewares/auth.js";

const router = Router();

router.post("/login", LoginController.login);

router.get("/logout", loggedIn, LoginController.logout);

router.post("/signup/create-password", LoginController.createPassword);

export const LoginRouter = router;
