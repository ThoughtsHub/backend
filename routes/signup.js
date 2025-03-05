import { Router } from "express";
import controller from "../controllers/controllers.js";

const SignupController = controller.signup;

const router = Router();

router.post("/create_password", SignupController.createPassword);

export const SignupRouter = router;
