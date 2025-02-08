import { Router } from "express";
import handler from "../controllers/education.js";

const router = Router();

router.post("/", handler.add);

router.patch("/", handler.update);

router.put("/", handler.update);

router.delete("/", handler.remove);

export const EducationRouter = router;
