import { Router } from "express";
import controller from "../controllers/controllers.js";

const LoginController = controller.login;

const router = Router();

router.post("/", LoginController.getUser, LoginController.login);

export const LoginRouter = router;
