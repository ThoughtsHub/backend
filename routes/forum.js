import { Router } from "express";
import h from "../controllers/handlers.js";

const handler = h.forums; // forums handler

const router = Router();

router.get("/", handler.get);

router.get("/:handle", handler.getByHandle);

router.post("/", handler.create);

router.patch("/", handler.modify);

router.put("/", handler.modify);

router.delete("/", handler.del);

export const ForumsRouter = router;
