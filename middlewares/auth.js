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

const verifyConnection = async (req, res, next) => {
  try {
    const sessionId = req.cookies?.[SID] ?? req.headers?.["auth_token"] ?? null; // get session Id

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
  admin,
  login: isLoggedIn,
};

export default auth;
