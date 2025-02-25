import { Router } from "express";
import controller from "../controllers/controllers.js";

const LoginController = controller.login;

const router = Router();

router.get("/", LoginController.logout);

export const LogoutRouter = router;
