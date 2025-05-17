import client from "../db/redis.js";
import { RT } from "../models/Log.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";
import log from "../services/LogService.js";
import { RC } from "../utils/codes.js";
import { hashSHA256 } from "../utils/hash.js";
import { v4 as uuidv4 } from "uuid";

export const setupAuth = async (userId) => {
  const nowTime = Date.now().toString();
  const userIdHash = hashSHA256(userId);
  const randomUniqueString = uuidv4();

  // unique user token
  const userToken = `${nowTime}-${randomUniqueString}-${userIdHash}`;

  // removed expiry, mismatch between the frontend and backend
  // the userToken will be valid till logout/deletion of account.
  await client.set(userToken, userId); // set userToken to userId

  return userToken;
};

export const validateAuth = async (userToken) => {
  const userId = await client.get(userToken);

  const result = { valid: userId !== null, userId };
  return result;
};

export const auth = async (req, _, next) => {
  const userToken =
    req.headers["authorization"]?.split(" ")?.[1] ??
    req.headers["auth_token"] ??
    "null";

  const { valid, userId } = await validateAuth(userToken);
  const user = valid
    ? await User.findByPk(userId, {
        include: { model: Profile, as: "profile" },
      })
    : null;

  if (user !== null) {
    req.user = user;
    req.loggedIn = true;
    req.userId = userId;
    req.userToken = userToken;
  } else req.loggedIn = false;

  next();
};

export const loggedIn = (req, res, next) => {
  if (req.loggedIn === true) next();
  else {
    log({
      responseCode: RC.UNAUTHORIZED,
      responseType: RT.WARNING,
      responseTitle: "Unauthorized access",
      responseDescription:
        "Accessing routes that require an account to continue",
      responseValues: null,
    });
    return res.unauth("Not logged In");
  }
};

export const loggedAsAdmin = (req, res, next) => {
  if (req.loggedIn === true && req?.user?.profile?.username === "admin") next();
  else {
    log({
      responseCode: RC.FORBIDDEN,
      responseType: RT.ERROR,
      responseTitle: "Forbidden access",
      responseDescription: "A normal user tried to access admin routes",
      responseValues: null,
    });
    return res.forbidden("Only admins are allowed");
  }
};

export const haveProfile = (req, res, next) => {
  if (req.loggedIn && req.user.profile !== null) next();
  else {
    log({
      responseCode: RC.FORBIDDEN,
      responseType: RT.WARNING,
      responseTitle: "Forbidden access",
      responseDescription:
        "A user without having created his/her profile accessed routes requiring a profile",
      responseValues: null,
    });
    return res.forbidden("Only users with profile created can access");
  }
};

export default auth;
