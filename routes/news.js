import { Router } from "express";
import handler from "../controllers/news.js";
import auth from "../middlewares/auth.js";

const router = Router();

router.get("/", handler.get);

router.post("/", auth.admin, handler.create);

router.patch("/", auth.admin, handler.update);

router.put("/", auth.admin, handler.update);

router.delete("/", auth.admin, handler.del);

export const NewsRouter = router;
