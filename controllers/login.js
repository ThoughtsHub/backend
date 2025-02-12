import _password from "../utils/password.js";
import _user from "../utils/user.js";
import auth from "../middlewares/auth.js";
import cookie from "../constants/cookies.js";
import { client, db } from "../db/connect.js";
import User from "../models/User.js";
import Email from "../models/Email.js";
import { or } from "sequelize";

export const COOKIE_OPTIONS = {
  sameSite: "strict",
  httpOnly: true,
  secure: true,
};

const login = async (req, res) => {
  const {
    username = null,
    password = null,
    email = null,
    mobile = null,
  } = req.body;

  try {
    // checks
    let user;
    {
      if (username === null) {
        if (email === null) {
          if (mobile === null) return res.noParams();
          user = await User.findOne({
            where: { mobile },
            attributes: ["blocked", "password", "verified", "username"],
          });
        }
        user = await User.findOne({
          where: { email },
          attributes: ["blocked", "password", "verified", "username"],
        });
      } else
        user = await User.findOne({
          where: { username },
          attributes: ["blocked", "password", "verified", "username"],
        });

      if (user === null) return res.bad("No user with that username");

      if (user.blocked) return res.forbidden("User is blocked by admin");

      if (!user.verified)
        return res.unauth("Unverified user, please verify your email");

      if (!_password.comparePassword(password, user.password))
        return res.unauth("Wrong password");
    }

    const userData = await _user.getUserDataByUsername(user.username);

    const sessionId = await auth.setup(userData);

    res.cookie(cookie.sessionId, sessionId, COOKIE_OPTIONS);

    res.ok("User logged in successfully", { sessionId });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const signup = async (req, res) => {
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

    res.created("User created", { sessionId });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const LoginHandler = { login, signup };

export default LoginHandler;
