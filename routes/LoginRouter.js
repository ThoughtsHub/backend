import { Router } from "express";
import LoginController from "../controllers/loginController.js";
import { loggedIn } from "../middlewares/auth.js";
import ProfileController from "../controllers/ProfileController.js";

const router = Router();

router.post("/login", LoginController.login);

router.get("/logout", loggedIn, LoginController.logout);

router.post("/signup/create-password", LoginController.createPassword);

router.delete("/delete-user", loggedIn, ProfileController.delete);

export const LoginRouter = router;
