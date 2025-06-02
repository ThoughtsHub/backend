import { Router } from "express";
import WordleController from "../controllers/WordleController.js";
import { haveProfile, loggedIn } from "../middlewares/auth.js";

const router = Router();

router.get("/today", WordleController.getTodayWord);

router.get("/", WordleController.getByDate);

router.post("/", loggedIn, haveProfile, WordleController.setResult);

router.get("/result", WordleController.getResult);

export const WordleRouter = router;
