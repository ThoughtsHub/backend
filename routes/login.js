import { Router } from "express";
import h from "../controllers/handlers.js";
import auth from "../middlewares/auth.js";
import User from "../models/User.js";

const loginHandler = h.login; // login handler
const emailHandler = h.email; // login handler

const router = Router();

// login
router.post("/login", loginHandler.login);

// signup
router.post("/get-otp", emailHandler.send);

router.post("/verify-otp", emailHandler.verify);

router.post("/create-password", loginHandler.signup);

router.post("/set-username", auth.verify, loginHandler.setUsername);

router.get("/delete-user", auth.verify, async (req, res) => {
  const userId = req.user.id;

  try {
    await User.destroy({ where: { id: userId } });
    await client.del(req.sessionId); // remove from db
    res.clearCookie(cookie.sessionId); // remove cookies
    

    res.ok("Deleted");
  } catch (err) {
    console.log(err);
    res.serverError();
  }
});

export const LoginRouter = router;
