import { Router } from "express";
import { loggedIn } from "../middlewares/auth.js";
import upload from "../middlewares/upload.js";
import UploadController from "../controllers/UploadController.js";

const router = Router();

router.post("/", loggedIn, upload.single("file"), UploadController.upload);

export const UploadRouter = router;
