import { Router } from "express";
import { EducationRouter } from "./education.js";
import h from "../controllers/handlers.js";
import auth from "../middlewares/auth.js";

const handler = h.profile; // profile handler

const router = Router();

router.get("/", auth.login, handler.get);

router.get("/:username", handler.getByUsername); // with username

router.post("/", auth.login, handler.update);

router.patch("/", auth.login, handler.update); // both requests are handle by same handler

router.put("/", auth.login, handler.update); // both requests are handle by same handler

router.delete("/:key", auth.login, handler.del); // updates a key to null in profile

// education
router.use("/education", auth.login, EducationRouter);

export const ProfileRouter = router;
