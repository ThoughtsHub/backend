import { Router } from "express";
import controller from "../controllers/controllers.js";
import auth from "../middlewares/auth.js";
import permissions from "../middlewares/permission.js";

const ForumController = controller.forums;

const router = Router();

router.get("/", ForumController.getForums);

router.get("/me", auth.login, auth.profile, ForumController.getMyForums);

router.get("/of", ForumController.getSomeoneForums);

router.post("/", auth.login, auth.profile, ForumController.createForum);

router.put(
  "/",
  auth.login,
  auth.profile,
  permissions.forumBelongsToUser,
  ForumController.replaceForum
);

router.patch(
  "/",
  auth.login,
  auth.profile,
  permissions.forumBelongsToUser,
  ForumController.updateForum
);

router.delete(
  "/",
  auth.login,
  auth.profile,
  permissions.forumBelongsToUser,
  ForumController.deleteForum
);

export const ForumsRouter = router;
