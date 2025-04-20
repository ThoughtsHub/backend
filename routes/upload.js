import { Router } from "express";
import upload, { compressToTargetSize } from "../middlewares/uploads/upload.js";
import logger from "../constants/logger.js";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import sharp from "sharp";
import fs from "fs";

const router = Router();

router.use(upload.single("file"));

router.post("/", async (req, res) => {
  const fileLocDir = "/uploads";
  const uploadPath = path.join("public", "uploads");

  try {
    const file = req.file;
    if (!file) {
      logger.warning("File uploading failed", req.user, {
        reason: "No file given",
      });
      return res.failure("No file given");
    }

    // Step 2: Construct custom file name
    const username = req.loggedIn === true ? req.user.username : "null";
    const fileName =
      Date.now() + "-" + uuidv4() + "-" + username + "-" + file.originalname;
    const outputPath = path.join(uploadPath, fileName);

    // Step 3: Compress/resize image
    const compressedBuffer = await compressToTargetSize(file.buffer, 60);

    // Step 4: Save the compressed image to disk
    fs.writeFileSync(outputPath, compressedBuffer);

    const fileUrl = path.join(fileLocDir, fileName);

    res.ok("File Uploaded", { fileUrl });
    logger.info("File uploaded", req.user, {
      fileName,
      fileLocDir,
      fileUrl,
    });
  } catch (err) {
    logger.error("Image upload failed", err, req.user, { error: err.message });
    res.failure("Image upload failed");
  }
});

export const UploadRouter = router;
