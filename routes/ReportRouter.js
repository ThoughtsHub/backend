import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth.js";
import ReportController from "../controllers/ReportController.js";

const router = Router();

router.post("/forum", loggedIn, haveProfile, ReportController.create)

export const ReportRouter = router;