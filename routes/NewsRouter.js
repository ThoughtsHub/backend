import { Router } from "express";
import NewsController from "../controllers/NewsController.js";

const router = Router();

router.get("/", NewsController.get);

export const NewsRouter = router;
