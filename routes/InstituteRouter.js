import { Router } from "express";
import InstituteController from "../controllers/InstituteController.js";
import { haveProfile, loggedIn } from "../middlewares/auth.js";

const router = Router();

router.get("/all", InstituteController.getAll);

router.get("/", InstituteController.get);

router.get("/users/all", InstituteController.getAllUsersOfInstitute);

router.post("/review", loggedIn, haveProfile, InstituteController.review);

router.post("/discussion", loggedIn, haveProfile, InstituteController.discuss);

router.get("/review", InstituteController.getReviews);

router.get("/discussion", InstituteController.getDiscs);

router.get("/discussion/replies", InstituteController.getDiscReplies);

export const InstituteRouter = router;
