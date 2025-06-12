import { Router } from "express";
import ProfileController from "../controllers/ProfileController.js";
import { haveProfile, loggedIn } from "../middlewares/auth.js";
import FollowerController from "../controllers/FollowerController.js";

const router = Router();

router.post("/", loggedIn, ProfileController.create);

router.put("/", loggedIn, haveProfile, ProfileController.update);

router.patch("/", loggedIn, haveProfile, ProfileController.update);

router.get("/", ProfileController.get);

router.get("/me", loggedIn, haveProfile, ProfileController.getMine);

router.get("/forums", ProfileController.getProfileForums);

router.post("/follow", loggedIn, haveProfile, FollowerController.follow);

router.post("/unfollow", loggedIn, haveProfile, FollowerController.unfollow);

router.get("/followers", FollowerController.getFollowers);

router.get("/following", FollowerController.getFollowing);

export const ProfileRouter = router;
