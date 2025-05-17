import { Router } from "express";
import { haveProfile, loggedIn } from "../middlewares/auth.js";
import ForumController from "../controllers/ForumController.js";

const router = Router();

router.post("/", loggedIn, haveProfile, ForumController.create);

router.put("/", loggedIn, haveProfile, ForumController.update);

router.patch("/", loggedIn, haveProfile, ForumController.update);

router.delete("/", loggedIn, haveProfile, ForumController.delete);

router.get("/", ForumController.get);

router.post("/upvote", loggedIn, haveProfile, ForumController.vote);

router.post("/comments", loggedIn, haveProfile, ForumController.comment);

router.put("/comments", loggedIn, haveProfile, ForumController.updateComment);

router.patch("/comments", loggedIn, haveProfile, ForumController.updateComment);

router.delete(
  "/comments",
  loggedIn,
  haveProfile,
  ForumController.deleteComment
);

router.get("/comments", ForumController.getComments);

export const ForumRouter = router;
