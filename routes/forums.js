import { Router } from "express";
import controller from "../controllers/controllers.js";
import auth from "../middlewares/auth.js";

const ForumController = controller.forums;

const router = Router();

router.get("/", ForumController.getForums);

router.get("/me", auth.login, auth.profile, ForumController.getMyForums);

router.get("/of", ForumController.getSomeoneForums);

export const ForumsRouter = router;
