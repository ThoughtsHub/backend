import { Router } from "express";
import upload from "../middlewares/upload.js";
import h from "../controllers/handlers.js";

const handler = h.uploads; // uploads handler

const router = Router();

router.get("/", handler.get);

router.post("/", upload.single("file"), handler.upload);

// can only change name of the uploaded file
router.patch("/", handler.modify);

router.delete("/:handle", handler.delete);

export const UploadRouter = router;
