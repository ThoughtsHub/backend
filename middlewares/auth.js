import cookie from "../constants/cookies.js";
import { ADMIN } from "../constants/env.js";
import jwtAuth from "../utils/auth.js";
import { client } from "../db/clients.js";
import { v4 as uuidv4 } from "uuid";
import { c } from "../utils/status_codes.js";
import _user from "../utils/user.js";

const REFERSH_KEY = "userId";

const setupAuthentication = async (userId) => {
  // generate tokens
  const tokens = {
    access: jwtAuth.generate.access({ userId }),
    refresh: jwtAuth.generate.refresh({ key: "userId", value: userId }),
  };

  const tokensStringified = JSON.stringify(tokens);

  const sessionId = `${keyVal}:${uuidv4()}`; // create a random session Id

  await client.setEx(sessionId, 7 * 24 * 60 * 60, tokensStringified); // set expiry

  return sessionId;
};

const resetAuthentication = async (req, res) => {
  const userData = await _user.getUserDataByUsername(req.user.username);

  const sessionId = await setupAuthentication(userData);

  await client.del(req.sessionId); // remove from db

  // update the sessionId cookie
  res.cookie(cookie.sessionId, sessionId, {
    sameSite: "strict",
    httpOnly: true,
    secure: true,
  });
};

const verifyTokens = async ({ access, refresh }) => {
  try {
    // check the access token first
    const data = jwtAuth.verify.access(access);
    return data;
  } catch {
    console.log("Access Token did not get verified");
  }

  try {
    const data = jwtAuth.verify.refresh(refresh);
    const userData = await _user.getUserDataByUsername(data[REFERSH_KEY]);
    return userData;
  } catch {
    console.log("Refresh Token did not get verified");
  }

  throw new Error("Token verification failed");
};

const verifyConnection = async (req, res, next) => {
  try {
    const sessionId =
      req.cookies?.[cookie.sessionId] ?? req.headers?.["auth_token"] ?? null; // get session Id

    if (typeof sessionId !== "string") return next();

    const tokensStringified = await client.get(sessionId);

    if (tokensStringified === null) return next();

    const tokens = JSON.parse(tokensStringified);

    try {
      const userData = await verifyTokens(tokens); // verify jwt tokens

      const _userData = await _user.getUserDataByUsername(userData.username); // new user data, only when in production

      if (_userData.blocked === true)
        return res
          .status(c.FORBIDDEN)
          .json({ message: "User is blocked by admin" });

      req.user = _userData; // set user data
      req.sessionId = sessionId; // set session id for logout
    } catch (err) {
      console.log(err);
    }
  } catch (err) {
    console.log(err);
  }

  next();
};

const admin = (req, res, next) => {
  const username = req.user.username;
  if (username !== ADMIN.USERNAME)
    return res.status(c.FORBIDDEN).json({ message: "Only admins have access" });

  next();
};

const isLoggedIn = (req, res, next) => {
  if (req.user === undefined) return res.unauth("You are not logged in");
  next();
};

const auth = {
  setup: setupAuthentication,
  verify: verifyConnection,
  resetup: resetAuthentication,
  admin,
  login: isLoggedIn,
};

export default auth;
