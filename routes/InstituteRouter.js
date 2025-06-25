import { Router } from "express";
import InstituteController from "../controllers/InstituteController.js";

const router = Router();

router.get("/all", InstituteController.getAll);

router.get("/", InstituteController.get);

router.get("/users/all", InstituteController.getAllUsersOfInstitute);

export const InstituteRouter = router;
