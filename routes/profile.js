import { Router } from "express";
import handler from "../controllers/profile.js";
import { EducationRouter } from "./education.js";

const router = Router();

router.get("/", handler.get);

router.patch("/", handler.update.profile); // both requests are handle by same handler

router.put("/", handler.update.profile); // both requests are handle by same handler

router.patch("/:key/:value", handler.update.attribute); // set key to value in profile

router.delete("/:key", handler.delete); // updates a key to null in profile

// education
router.use("/education", EducationRouter);

export const ProfileRouter = router;
