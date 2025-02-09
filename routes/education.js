import { Router } from "express";
import h from "../controllers/handlers.js";

const handler = h.education; // education handler

const router = Router();

router.post("/", handler.add);

router.patch("/", handler.modify);

router.put("/", handler.modify);

router.delete("/", handler.del);

export const EducationRouter = router;
