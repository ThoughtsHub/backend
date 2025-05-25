import { Router } from "express";
import ProfileController from "../controllers/ProfileController.js";
import NewsController from "../controllers/NewsController.js";

const router = Router();

router.get("/check-username", ProfileController.checkUsername);

router.get("/categories", NewsController.getCategories);

router.get("/users", ProfileController.getUsers);

router.get("/delete-user", ProfileController.delete);

export const OtherRouter = router;
