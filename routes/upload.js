import { Router } from "express";
import upload from "../middlewares/uploads/upload.js";
import logger from "../constants/logger.js";

const router = Router();

router.use(upload.single("file"));

router.post("/", async (req, res) => {
  const fileLocDir = "/uploads/";
  const fileName = req?.file?.filename;
  if (typeof fileName !== "string") {
    logger.warning("File uploading failed", req.user, {
      reason: "No file given",
      fileName,
    });
    return res.failure("No file given");
  }

  const fileUrl = fileLocDir + fileName;

  res.ok("File Uploaded", { fileUrl });
  logger.info("File uploaded", req.user, {
    fileName,
    fileLocDir,
    fileUrl,
  });
});

export const UploadRouter = router;
