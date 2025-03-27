import { Router } from "express";
import upload from "../middlewares/uploads/upload.js";

const router = Router();

router.use(upload.single("file"));

router.post("/", async (req, res) => {
  const fileLocDir = "/uploads/";
  const fileName = req?.file?.filename;
  if (typeof fileName !== "string") return res.failure("No file given");

  const fileUrl = fileLocDir + fileName;

  res.ok("File Uploaded", { fileUrl });
});

export const UploadRouter = router;
