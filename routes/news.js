import { Router } from "express";
import auth from "../middlewares/auth.js";
import h from "../controllers/handlers.js";

const handler = h.news; // news handler

const router = Router();

router.get("/", handler.get);

router.post("/", auth.admin, handler.create);

router.patch("/", auth.admin, handler.modify);

router.put("/", auth.admin, handler.modify);

router.delete("/", auth.admin, handler.del);

export const NewsRouter = router;
