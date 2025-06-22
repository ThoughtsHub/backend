import { Router } from "express";
import ProfileEducationController from "../controllers/ProfileEducationController.js";
import { haveProfile, loggedIn } from "../middlewares/auth.js";

const router = Router();

router.get("/", ProfileEducationController.get);

router.post("/", loggedIn, haveProfile, ProfileEducationController.add);

router.put("/", loggedIn, haveProfile, ProfileEducationController.update);

router.patch("/", loggedIn, haveProfile, ProfileEducationController.update);

router.delete("/", loggedIn, haveProfile, ProfileEducationController.delete);

export const ProfileEducationRouter = router;
