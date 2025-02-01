import cookie from "../constants/cookies.js";
import _env from "../constants/env.js";
import jwtAuth from "../controllers/auth.js";
import { client } from "../db/connect.js";
import { v4 as uuidv4 } from "uuid";
import c from "../utils/status_codes.js";
import _user from "../utils/user.js";

const REFERSH_KEY = _env.auth.jwt.refresh.key;

const setupAuthentication = async (userData, key = REFERSH_KEY) => {
  const keyVal = userData[key];

  // generate tokens
  const tokens = {
    access: jwtAuth.generate.access(userData),
    refresh: jwtAuth.generate.refresh({ key: key, value: keyVal }),
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
      req.cookies?.[cookie.sessionId] ??
      req.headers?.authorization?.split(" ")[1] ??
      null; // get session Id

    if (typeof sessionId !== "string")
      return res.status(c.FORBIDDEN).json({ message: "Invalid session" });

    const tokensStringified = await client.get(sessionId);

    if (tokensStringified === null)
      return res.status(c.FORBIDDEN).json({ message: "No session" });

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
      return res.status(c.FORBIDDEN).json({ message: "Invalid session" });
    }
  } catch (err) {
    console.log(err);

    return res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal Server Error" });
  }

  next();
};

const auth = {
  setup: setupAuthentication,
  verify: verifyConnection,
  resetup: resetAuthentication,
};

export default auth;
