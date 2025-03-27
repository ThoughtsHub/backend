import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads");
  },
  filename: (req, file, cb) => {
    let username = "";
    if (req.loggedIn === true) username = req.user.username;
    cb(
      null,
      Date.now() + "-" + uuidv4() + "-" + username + "-" + file.originalname
    );
  },
});

const upload = multer({ storage: storage });

export default upload;
