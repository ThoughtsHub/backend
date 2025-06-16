import { Router } from "express";
import InstituteController from "../controllers/InstituteController.js";

const router = Router();

router.get("/all", InstituteController.getAll);

router.get("/", InstituteController.get);

export const InstituteRouter = router;
