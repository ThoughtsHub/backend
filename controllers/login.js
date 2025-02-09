import _password from "../utils/password.js";
import _user from "../utils/user.js";
import auth from "../middlewares/auth.js";
import cookie from "../constants/cookies.js";
import { db } from "../db/connect.js";
import User from "../models/User.js";
import Email from "../models/Email.js";

const COOKIE_OPTIONS = {
  sameSite: "strict",
  httpOnly: true,
  secure: true,
};

const login = async (req, res) => {
  const { username = null, password = null } = req.body;

  try {
    // checks
    {
      const user = await User.findOne({
        where: { username },
        attributes: ["blocked", "password", "verified"],
      });

      if (user === null) return res.bad("No user with that username");

      if (user.blocked) return res.forbidden("User is blocked by admin");

      if (!user.verified)
        return res.unauth("Unverified user, please verify your email");

      if (!_password.comparePassword(username, password, user.password))
        return res.unauth("Wrong password");
    }

    const userData = await _user.getUserDataByUsername(username);

    const sessionId = await auth.setup(userData);

    res.cookie(cookie.sessionId, sessionId, COOKIE_OPTIONS);

    res.ok("User logged in successfully", { sessionId });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const signup = async (req, res) => {
  const { username = null, password = null, email = null } = req.body;

  let transactionCommit = false;
  const t = await db.transaction();
  try {
    // checks
    {
      if (username === null || password === null || email === null) {
        await t.rollback();
        return res.noParams();
      }

      if (!(await _user.isUsernameAvailable(username))) {
        await t.rollback();
        return res.conflict("Username already taken");
      }

      const _email = await Email.findOne({ where: { email } });
      if (_email === null || _email?.verified === false) {
        await t.rollback();
        return res.unauth("Email is not verified");
      }
      if (_email?.userId !== null) {
        await t.rollback();
        return res.conflict("Email already exist");
      }

      if (!_password.checkPassword(password)) {
        await t.rollback();
        return res.bad("Password doesn't adhere rules");
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

    res.ok("User logged in successfully", { sessionId });
  } catch (err) {
    if (transactionCommit == false) await t.rollback();
    console.log(err);

    res.serverError(
      transactionCommit
        ? "User created but not logged in, try /login"
        : "Internal server error"
    );
  }
};

const LoginHandler = { login, signup };

export default LoginHandler;
