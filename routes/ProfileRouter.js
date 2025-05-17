import { Router } from "express";
import ProfileController from "../controllers/ProfileController.js";
import { haveProfile, loggedIn } from "../middlewares/auth.js";

const router = Router();

router.post("/", loggedIn, ProfileController.create);

router.put("/", loggedIn, haveProfile, ProfileController.update);

router.patch("/", loggedIn, haveProfile, ProfileController.update);

router.get("/", ProfileController.get);

router.get("/me", loggedIn, haveProfile, ProfileController.getMine);

router.get("/forums", ProfileController.getProfileForums);

export const ProfileRouter = router;
