import Profile from "../models/Profile.js";
import User from "../models/user.js";
import checks from "../utils/checks.js";
import _req from "../utils/request.js";
import p from "../utils/password.js";
import auth, { SID } from "../middlewares/auth.js";
import { client } from "../db/clients.js";

const LOGIN_FIELDS = ["email", "mobile", "password"];

/**
 * get the user for logging in, by username and password w/ request
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const getUser = async (req, res, next) => {
  const { username, email, mobile, password } = _req.getDataO(
    req.body,
    LOGIN_FIELDS
  );

  if (_req.allNull(email, mobile)) return res.noParams();
  if (_req.allNull(password)) return res.noParams();

  try {
    let user = null,
      uniqueKeyVal;
    if (!checks.isNull(username)) {
      user = await User.findOne({ where: { username } });
      uniqueKeyVal = username;
    } else if (!checks.isNull(email)) {
      user = await User.findOne({ where: { email } });
      uniqueKeyVal = email;
    } else if (!checks.isNull(mobile)) {
      user = await User.findOne({ where: { mobile } });
      uniqueKeyVal = mobile;
    }

    if (checks.isNull(user)) return res.bad("Invalid user");
    if (!p.compare(password, user.password))
      return res.unauth("Wrong Password");

    const userId = user.id;
    const profile = await Profile.findOne({ where: { userId } });

    req.setParams = { user, userId, profile, keyVal: uniqueKeyVal };

    next();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * logs in user if credentials matches
 * @param {Request} req
 * @param {Response} res
 */
const login = async (req, res) => {
  const { user, userId, profile: isProfile, keyVal } = req.setParams;

  const profile = await Profile.findOne({ where: { userId } });

  try {
    const sessionId = await auth.setup(userId, res, keyVal);

    res.ok("Login successfull", {
      sessionId,
      profileCreated: !checks.isNull(isProfile),
      profile,
    });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * logs out user if logged in
 * @param {Request} req
 * @param {Response} res
 */
const logout = async (req, res) => {
  try {
    await client.del(req.sessionId); // remove from db
    res.clearCookie(SID); // remove cookies

    res.deleted();
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

export const LoginController = { getUser, login, logout };
