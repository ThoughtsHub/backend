import { Router } from "express";
import { EducationRouter } from "./education.js";
import h from "../controllers/handlers.js";

const handler = h.profile; // profile handler

const router = Router();

router.get("/", handler.get);

router.get("/:username", handler.getByUsername); // with username

router.post("/", handler.update);

router.patch("/", handler.update); // both requests are handle by same handler

router.put("/", handler.update); // both requests are handle by same handler

router.delete("/:key", handler.del); // updates a key to null in profile

// education
router.use("/education", EducationRouter);

export const ProfileRouter = router;
