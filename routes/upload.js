import { Router } from "express";
import upload from "../middlewares/upload.js";
import handler from "../controllers/upload.js";

const router = Router();

router.get("/", handler.getUploads);

router.post("/", upload.single("file"), handler.upload);

// can only change name
router.patch("/", handler.patch);

router.delete("/:handle", handler.delete);

export const UploadRouter = router;
