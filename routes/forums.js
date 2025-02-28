import { Router } from "express";
import controller from "../controllers/controllers.js";

const ForumController = controller.forums;

const router = Router();

router.get("/", ForumController.getForums);

export const ForumsRouter = router;
