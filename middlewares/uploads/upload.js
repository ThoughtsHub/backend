import multer from "multer";
import sharp from "sharp";

const storage = multer.memoryStorage();

const upload = multer({ storage: storage });

export default upload;

export const compressToTargetSize = async (
  buffer,
  maxSizeKB = 200,
  minQuality = 30
) => {
  let quality = 80;
  let outputBuffer;

  for (; quality >= minQuality; quality -= 10) {
    outputBuffer = await sharp(buffer)
      .resize({ width: 1000, withoutEnlargement: true }) // Optional: adjust width to help compression
      .jpeg({ quality })
      .toBuffer();

    if (outputBuffer.length <= maxSizeKB * 1024) break;
  }

  return outputBuffer;
};
