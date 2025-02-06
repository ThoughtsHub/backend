import _password from "../utils/password.js";
import _user from "../utils/user.js";
import auth from "../middlewares/auth.js";
import cookie from "../constants/cookies.js";
import { client, db } from "../db/connect.js";
import User from "../models/User.js";
import c from "../utils/status_codes.js";
import otp from "../utils/email.js";

const loginHandler = async (req, res) => {
  const { username = null, password = null } = req.body;

  try {
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

    if (_password.comparePassword(username, password, user.password) === false)
      return res.status(c.UNAUTHORIZED).json({ message: "Wrong password" });

    const userData = await _user.getUserDataByUsername(username);

    const sessionId = await auth.setup(userData);

    res.cookie(cookie.sessionId, sessionId, {
      sameSite: "strict",
      httpOnly: true,
      secure: true,
    });

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
    if (username === null || password === null || email === null) {
      await t.rollback();
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "Required credentials missing" });
    }

    if (!(await _user.isUsernameAvailable(username))) {
      await t.rollback();
      return res.status(c.CONFLICT).json({ message: "Username already taken" });
    }

    if (!(await _user.isEmailAvailable(email))) {
      await t.rollback();
      return res.status(c.CONFLICT).json({ message: "Email already used" });
    }

    if (!_password.checkPassword(password)) {
      await t.rollback();
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "Password doesn't adhere rules" });
    }

    const user = await User.create(
      { username, password, email },
      { transaction: t }
    );

    const generatedOtp = otp.generate(); // generate otp
    client.setEx(`otp:${email}:${username}`, 5 * 60, generatedOtp); // valid otp for 5 minutes

    const otpSend = otp.send(email, generatedOtp);
    if (!otpSend) {
      await t.rollback();
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "OTP could not be sent!" });
    }

    await t.commit(); // save user data
    transactionCommit = true; // transaction commited

    res
      .status(c.CREATED)
      .json({ message: "OTP sent, verify your email at /email/verify" });
  } catch (err) {
    if (transactionCommit == false) await t.rollback();
    console.log(err);
    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const handler = {
  login: loginHandler,
  signup: signupHandler,
};

export default handler;
