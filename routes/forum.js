import { Router } from "express";
import h from "../controllers/handlers.js";

const handler = h.forums; // forums handler

const router = Router();

router.get("/", handler.get);

router.get("/me", handler.getUsers); // get user's forums

router.post("/", handler.create);

router.patch("/", handler.modify);

router.put("/", handler.modify);

router.delete("/", handler.del);

// voting
router.get("/upvote", handler.upvote);

router.delete("/upvote", handler.unvote);

// commenting
router.get("/comment", handler.getComments);

router.post("/comment", handler.comment);

router.delete("/comment", handler.uncomment);

router.get("/h/:handle", handler.getByHandle);

router.get("/u/:username", handler.getByUsername);

export const ForumsRouter = router;
