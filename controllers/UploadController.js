import sharp from "sharp";
import fs from "fs";
import path from "path";
import { toNumber } from "../utils/number.js";
import { logBad, logOk, logServerErr } from "../services/LogService.js";
import { v4 as uuidv4 } from "uuid";

class UploadController {
  static maxSizeImageConfigFile = "./env/max_image_size.config.txt";

  static minQuality = 40;
  static startQuality = 100;

  static compressToTargetSize = async (buffer) => {
    let maxSizeKB = this.getMaxSizeKb();
    let minQuality = this.minQuality;
    let quality = this.startQuality;
    let outputBuffer;

    for (; quality >= minQuality; quality -= 3) {
      outputBuffer = await sharp(buffer)
        // .resize({ width: 1000, withoutEnlargement: true }) // Optional: adjust width to help compression
        .jpeg({ quality })
        .toBuffer();

      if (outputBuffer.length <= maxSizeKB * 1024) break;
    }

    return outputBuffer;
  };

  static getMaxSizeKb = () => {
    const maxSize = fs.readFileSync(this.maxSizeImageConfigFile).toString();
    return toNumber(maxSize);
  };

  static changeMaxSizeKb = async (req, res) => {
    const { maxSize } = req.body;

    try {
      const maxSizeKb = toNumber(maxSize);
      fs.writeFileSync(this.maxSizeImageConfigFile, String(maxSizeKb));

      res.ok("Max size changed", { maxSizeKb });

      logOk("Max size change", "Max size for image uploads changed by admin", {
        maxSizeKb,
        maxSize,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static upload = async (req, res) => {
    const fileLocDir = "/uploads";
    const uploadPath = path.join("public", "uploads");

    try {
      const file = req.file;
      if (!file) {
        logBad(
          "File uploading failed",
          "File uploading failed due to not given any file in field file",
          { file }
        );

        return res.failure("No file given");
      }

      // Step 2: Construct custom file name
      const username =
        req.loggedIn === true ? req.user.profile.username : "null";
      const fileName =
        Date.now() +
        "-" +
        uuidv4() +
        "-" +
        username +
        "-" +
        file.originalname +
        ".jpeg";
      const outputPath = path.join(uploadPath, fileName);

      // Step 3: Compress/resize image
      const compressedBuffer = await this.compressToTargetSize(file.buffer);

      // Step 4: Save the compressed image to disk
      fs.writeFileSync(outputPath, compressedBuffer);

      const fileUrl = path.join(fileLocDir, fileName);

      res.ok("File Uploaded", { fileUrl });

      logOk("File uploaded", "File uploaded successfully", {
        fileUrl,
        fileLocDir,
        fileName,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default UploadController;
