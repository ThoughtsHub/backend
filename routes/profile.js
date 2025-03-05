import { Router } from "express";
import auth from "../middlewares/auth.js";
import controller from "../controllers/controllers.js";

const ProfileController = controller.profile;

const router = Router();

router.get("/", auth.login, auth.profile, ProfileController.getProfile.id);

router.get("/me", auth.login, auth.profile, ProfileController.getProfile.mine);

router.get("/h/:handle", ProfileController.getProfile.handle);

router.post("/", auth.login, ProfileController.createProfile);

router.patch("/", auth.login, auth.profile, ProfileController.fixProfile);

router.put("/", auth.login, auth.profile, ProfileController.replaceProfile);

export const ProfileRouter = router;
