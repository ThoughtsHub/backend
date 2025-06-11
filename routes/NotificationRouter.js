import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth.js";
import NotificationController from "../controllers/NotificationController.js";

const router = Router();

router.get("/", loggedIn, haveProfile, NotificationController.get);

export const NotificationRouter = router;
