import multer from "multer";
import _env from "../constants/env.js";
import handle from "../utils/handle.js";
import _file from "../utils/file.js";

const uploadloc = _env.app.UPLOADS.DIR;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadloc);
  },
  filename: (req, file, cb) => {
    const fileInfo = _file.info(file.originalname);
    const newFileName =
      req.user.username +
      "_" +
      handle.create(fileInfo.name, Date.now()) +
      "." +
      fileInfo.ext;
    cb(null, newFileName);
  },
});

const upload = multer({ storage: storage });

export default upload;
