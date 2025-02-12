import { Router } from "express";
import h from "../controllers/handlers.js";
import auth from "../middlewares/auth.js";

const handler = h.forums; // forums handler

const router = Router();

router.get("/", handler.get);

router.get("/me", auth.login, handler.getUsers); // get user's forums

router.post("/", auth.login, handler.create);

router.patch("/", auth.login, handler.modify);

router.put("/", auth.login, handler.modify);

router.delete("/", auth.login, handler.del);

// voting
router.post("/upvote", auth.login, handler.upvote);

router.delete("/upvote", auth.login, handler.unvote);

// commenting
router.get("/comment", handler.getComments);

router.post("/comment", auth.login, handler.comment);

router.delete("/comment", auth.login, handler.uncomment);

router.get("/h/:handle", handler.getByHandle);

router.get("/u/:username", handler.getByUsername);

export const ForumsRouter = router;
