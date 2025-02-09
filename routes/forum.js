import { Router } from "express";
import handler from "../controllers/forum.js";

const router = Router();

router.get("/", handler.get);

router.post("/", handler.create);

router.patch("/", handler.modify);

router.put("/", handler.modify);

router.delete("/", handler.del);

export const LoginRouter = router;
