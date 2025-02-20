import { Router } from "express";
import controller from "../controllers/controllers";

const LoginController = controller.login;

const router = Router();

router.get("/", LoginController.logout);

export const LogoutRouter = router;
