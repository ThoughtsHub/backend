import { Router } from "express";
import h from "../controllers/handlers.js";
import { client } from "../db/connect.js";
import _password from "../utils/password.js";
import User from "../models/User.js";
import _user from "../utils/user.js";
import auth from "../middlewares/auth.js";
import cookie from "../constants/cookies.js";
import { COOKIE_OPTIONS } from "../controllers/login.js";

const loginHandler = h.login; // login handler
const emailHandler = h.email; // login handler

const router = Router();

router.post("/login", loginHandler.login);

router.post("/get-otp", emailHandler.send);
router.post("/verify-otp", emailHandler.verify);

router.post("/create-password", async (req, res) => {
  const { password = null, confirmationId = null } = req.body;

  if (password === null) return res.bad("No password");
  if (confirmationId === null) return res.bad("Invalid confirmation Id");

  try {
    const email = await client.get(`confirmPassword:${confirmationId}`);
    if (email === null) return res.bad("Invalid confirmation Id");

    if (!_password.checkPassword(password))
      return res.bad("password does not match criteria");

    const userAvailable = await User.findOne({ where: { email } });
    if (userAvailable !== null) res.conflict("Email already used");

    const user = await User.create({
      username: email,
      email,
      password,
      verified: true,
    });

    const userData = await _user.getUserDataByUsername(user.username);

    const sessionId = await auth.setup(userData);

    res.cookie(cookie.sessionId, sessionId, COOKIE_OPTIONS);

    res.ok("User logged in successfully", { sessionId });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const LoginRouter = router;
