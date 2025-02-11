import { Router } from "express";
import h from "../controllers/handlers.js";
import auth from "../middlewares/auth.js";

const handler = h.book; // book handler

const router = Router();

router.get("/", handler.get);

router.get("/:handle", handler.getByHandle);

router.post("/", auth.admin, handler.create);

router.patch("/", auth.admin, handler.modify);

router.put("/", auth.admin, handler.modify);

router.delete("/", auth.admin, handler.del);

export const BookRouter = router;
