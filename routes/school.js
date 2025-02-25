import { Router } from "express";
import auth from "../middlewares/auth.js";
import controller from "../controllers/controllers.js";

const SchoolController = controller.school;

const router = Router();

router.post("/", auth.login, auth.profile, SchoolController.createSchools);

export const SchoolRouter = router;
