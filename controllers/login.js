import Profile from "../models/Profile.js";
import User from "../models/user.js";
import password from "../utils/password.js";
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
  if (body.isNull("password")) return res.noParams();
  if (body.isString("password")) return res.bad("Invalid type of password");

  try {
    const [key, keyVal] = body.getNonNullField("username email mobile");
    let user = await User.findOne({ where: { [key]: keyVal } });

    if (user === null) return res.bad("Invalid user");
    if (!password.compare(body.get("password"), user.password))
      return res.unauth("Wrong Password");

    const userId = user.id;
    const profile = await Profile.findOne({ where: { userId } });

    req.setParams = { user, userId, profile, keyVal };

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
  const { user, userId, profile, keyVal } = req.setParams;

  try {
    const sessionId = await auth.setup(userId, res, keyVal);

    res.ok("Login successfull", {
      sessionId,
      profileCreated: profile !== null,
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
