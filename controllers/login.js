import Profile from "../models/Profile.js";
import User from "../models/user.js";
import checks from "../utils/checks.js";
import p from "../utils/password.js";
import auth, { SID } from "../middlewares/auth.js";
import { client } from "../db/clients.js";
import ReqBody from "../utils/request.js";

const LOGIN_FIELDS = ["username", "email", "mobile", "password"];

/**
 * get the user for logging in, by username and password w/ request
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 */
const getUser = async (req, res, next) => {
  const body = new ReqBody(req.body, LOGIN_FIELDS);

  if (body.fieldsNull("username mobile email")) return res.noParams();
  if (body.fieldsNull("password")) return res.noParams();

  try {
    const [key, keyVal] = body.getNonNullField("username email mobile");
    let user = await User.findOne({ where: { [key]: keyVal } });
    let uniqueKeyVal = keyVal;

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
