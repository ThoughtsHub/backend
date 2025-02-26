import { ADMIN } from "../constants/env.js";
import jwtAuth from "../utils/auth.js";
import { client } from "../db/clients.js";
import { v4 as uuidv4 } from "uuid";
import { c } from "../utils/status_codes.js";
import user from "../utils/user.js";

const REFERSH_KEY = "userId";

const COOKIE_OPTIONS = {
  sameSite: "strict",
  httpOnly: true,
  secure: true,
};

export const SID = "sessionId";

/**
 * sets up the authentication for the connected user
 * with its profile and user id \
 * should be applied after login/signup or during regeneration of cookies
 * @param {String} userId
 * @param {Response} res
 * @param {String} keyVal
 * @returns {Promise<String>} sessionId
 */
const setupAuthentication = async (userId, res, keyVal) => {
  // generate tokens
  const tokens = {
    access: jwtAuth.generate.access({ userId }),
    refresh: jwtAuth.generate.refresh({ key: "userId", value: userId }),
  };

  const tokensStringified = JSON.stringify(tokens);

  const sessionId = `${keyVal ?? userId}-${uuidv4()}`; // create a random session Id

  await client.setEx(sessionId, 7 * 24 * 60 * 60, tokensStringified); // set expiry

  res.cookie(SID, sessionId, COOKIE_OPTIONS);

  return sessionId;
};

/**
 * checks if the tokens associated with connection are valid
 * @param {tokens} tokens {access, refresh}
 * @returns {Error | Object}
 */
const verifyTokens = async ({ access, refresh }) => {
  try {
    // check the access token first
    const data = jwtAuth.verify.access(access);
    const userData = await user.getUserData(data[REFERSH_KEY]);
    return userData;
  } catch {
    console.log("Access Token did not get verified");
  }

  try {
    const data = jwtAuth.verify.refresh(refresh);
    const userData = await user.getUserData(data[REFERSH_KEY]);
    return userData;
  } catch {
    console.log("Refresh Token did not get verified");
  }

  throw new Error("Token verification failed");
};

/**
 * creates a user object in req
 * for easier access and writing in changing
 * or requesting data for/of the connected user
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns
 */
const verifyConnection = async (req, res, next) => {
  try {
    const sessionId = req.cookies[SID] ?? req.headers["auth_token"] ?? null; // get session Id

    if (typeof sessionId !== "string") return next(); // verification failed

    const tokensStringified = await client.get(sessionId);

    if (tokensStringified === null) return next(); // verification failed

    const tokens = JSON.parse(tokensStringified);

    try {
      const userData = await verifyTokens(tokens); // verify jwt tokens

      if (userData.blocked === true)
        return res
          .status(c.FORBIDDEN)
          .json({ message: "User is blocked by admin" });

      req.user = userData; // set user data
      req.sessionId = sessionId; // set session id for logout
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }

  next();
};

/**
 * checks if the current connection/user
 * is an admin
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns
 */
const admin = (req, res, next) => {
  const username = req.user.username;
  if (username !== ADMIN.USERNAME)
    return res.status(c.FORBIDDEN).json({ message: "Only admins have access" });

  next();
};

/**
 * checks if the current connection is logged in
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns
 */
const isLoggedIn = (req, res, next) => {
  if (req.user === undefined) return res.unauth("You are not logged in");
  next();
};

/**
 * Checks if the current connection/user
 * has a profile associated with them
 * @param {Request} req
 * @param {Response} res
 * @param {Function} next
 * @returns
 */
const isProfile = async (req, res, next) => {
  const isProfile = req.user.isProfile;
  if (!isProfile) return res.bad("No profile for this user exist");
  next();
};

const auth = {
  setup: setupAuthentication,
  verify: verifyConnection,
  admin,
  login: isLoggedIn,
  profile: isProfile,
};

export default auth;
