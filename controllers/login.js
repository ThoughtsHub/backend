import _password from "../utils/password.js";
import _user from "../utils/user.js";
import auth from "../middlewares/auth.js";
import cookie from "../constants/cookies.js";
import { db } from "../db/connect.js";
import User from "../models/User.js";
import c from "../utils/status_codes.js";
import Email from "../models/Email.js";

const COOKIE_OPTIONS = {
  sameSite: "strict",
  httpOnly: true,
  secure: true,
};

const loginHandler = async (req, res) => {
  const { username = null, password = null } = req.body;

  try {
    // checks
    {
      const user = await User.findOne({
        where: { username },
        attributes: ["blocked", "password", "verified"],
      });

      if (user === null)
        return res
          .status(c.BAD_REQUEST)
          .json({ message: "No user with that username" });

      if (user.blocked === true)
        return res
          .status(c.FORBIDDEN)
          .json({ message: "User is blocked by admin" });

      if (user.verified === false)
        return res
          .status(c.UNAUTHORIZED)
          .json({ message: "Unverified user, please verify your email" });

      if (
        _password.comparePassword(username, password, user.password) === false
      )
        return res.status(c.UNAUTHORIZED).json({ message: "Wrong password" });
    }

    const userData = await _user.getUserDataByUsername(username);

    const sessionId = await auth.setup(userData);

    res.cookie(cookie.sessionId, sessionId, COOKIE_OPTIONS);

    res
      .status(c.OK)
      .json({ message: "User logged in successfully", sessionId });
  } catch (err) {
    console.log(err);
    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const signupHandler = async (req, res) => {
  const { username = null, password = null, email = null } = req.body;

  let transactionCommit = false;
  const t = await db.transaction();
  try {
    // checks
    {
      if (username === null || password === null || email === null) {
        await t.rollback();
        return res
          .status(c.BAD_REQUEST)
          .json({ message: "Required credentials missing" });
      }

      if (!(await _user.isUsernameAvailable(username))) {
        await t.rollback();
        return res
          .status(c.CONFLICT)
          .json({ message: "Username already taken" });
      }

      const _email = await Email.findOne({ where: { email } });
      if (_email === null || _email?.verified === false) {
        await t.rollback();
        return res
          .status(c.UNAUTHORIZED)
          .json({ message: "Email is not verified" });
      }
      if (_email?.userId !== null) {
        await t.rollback();
        return res.status(c.CONFLICT).json({ message: "Email already exist" });
      }

      if (!_password.checkPassword(password)) {
        await t.rollback();
        return res
          .status(c.BAD_REQUEST)
          .json({ message: "Password doesn't adhere rules" });
      }
    }

    // creation and association
    {
      const user = await User.create(
        { username, password },
        { transaction: t }
      ); // create user

      await Email.update(
        { userId: user.id },
        { where: { email }, transaction: t }
      ); // associate the email with user

      await User.update(
        { verified: true },
        { where: { id: user.id }, transaction: t }
      ); // update user is verified
    }

    await t.commit(); // save user data
    transactionCommit = true; // transaction commited

    const userData = await _user.getUserDataByUsername(username);

    const sessionId = await auth.setup(userData);

    res.cookie(cookie.sessionId, sessionId, COOKIE_OPTIONS);

    res
      .status(c.OK)
      .json({ message: "User logged in successfully", sessionId });
  } catch (err) {
    if (transactionCommit == false) await t.rollback();
    console.log(err);
    res.status(c.INTERNAL_SERVER_ERROR).json({
      message: transactionCommit
        ? "User created but not logged in, try /login"
        : "Internal server error",
    });
  }
};

const handler = {
  login: loginHandler,
  signup: signupHandler,
};

export default handler;
