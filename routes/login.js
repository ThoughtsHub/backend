import { Router } from "express";
import User from "../models/User.js";
import c from "../utils/status_codes.js";
import _password from "../utils/password.js";
import auth from "../middlewares/auth.js";
import cookie from "../constants/cookies.js";
import { db } from "../db/connect.js";
import _user from "../utils/user.js";

const router = Router();

// Login
router.post("/", async (req, res) => {
  const { username = null, password = null } = req.body;

  try {
    const user = await User.findOne({
      where: { username },
      attributes: ["blocked", "password"],
    });

    if (user === null)
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "No user with that username" });

    if (user.blocked === true)
      return res
        .status(c.FORBIDDEN)
        .json({ message: "User is blocked by admin" });

    if (_password.comparePassword(username, password, user.password) === false)
      return res.status(c.UNAUTHORIZED).json({ message: "Wrong password" });

    const userData = await _user.getUserDataByUsername(username);

    const sessionId = await auth.setup(userData);

    res.cookie(cookie.sessionId, sessionId, {
      sameSite: "strict",
      httpOnly: true,
      secure: true,
    });

    res.status(c.OK).json({ message: "User logged in successfully" });
  } catch (err) {
    console.log(err);
    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

// Signup
router.post("/new", async (req, res) => {
  const { username = null, password = null } = req.body;

  const t = await db.transaction();
  try {
    if (username === null || password === null)
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "Required credentials missing" });

    if (!(await _user.isUsernameAvailable(username)))
      return res.status(c.CONFLICT).json({ message: "Username already taken" });

    if (!_password.checkPassword(password))
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "Password doesn't adhere rules" });

    const user = await User.create({ username, password }, { transaction: t });

    await t.commit();

    const userData = await _user.getUserDataByUsername(user.username);

    const sessionId = await auth.setup(userData);

    res.cookie(cookie.sessionId, sessionId, {
      sameSite: "strict",
      httpOnly: true,
      secure: true,
    });

    res.status(c.CREATED).json({ message: "User created" });
  } catch (err) {
    await t.rollback();
    console.log(err);
    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
});

export const LoginRouter = router;
