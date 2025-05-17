import { Router } from "express";
import FeedbackController from "../controllers/FeedbackController.js";

const router = Router();

router.post("/", FeedbackController.create);

export const FeedbackRouter = router;
