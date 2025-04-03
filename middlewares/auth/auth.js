import logger from "../../constants/logger.js";
import client from "../../db/redis.js";
import Profile from "../../models/Profile.js";
import User from "../../models/User.js";
import { hashSHA256 } from "../../utils/hash.js";
import { v4 as uuidv4 } from "uuid";

export const setupAuth = async (userId) => {
  const nowTime = Date.now().toString();
  const userIdHash = hashSHA256(userId);
  const randomUniqueString = uuidv4();

  // unique user token
  const userToken = `${nowTime}-${randomUniqueString}-${userIdHash}`;

  // expiry of 5 days
  await client.setEx(userToken, 5 * 24 * 60 * 60, userId); // set userToken to userId

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
    ? await User.findByPk(userId, { include: { model: Profile } })
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
    logger.warning("Accessing information without logging in", null, { req });
    res.unauth("Not logged In");
  }
};

export const loggedAsAdmin = (req, res, next) => {
  if (req.loggedIn === true && req?.user?.username === "admin") next();
  else {
    logger.warning("Admin restricted", null, {
      user: req.user,
      headers: req.headers,
    });
    res.forbidden("Only admins are allowed");
  }
};

export const haveProfile = (req, res, next) => {
  if (req.loggedIn && req.user.Profile !== null) next();
  else {
    logger.warning("Profiled entry", null, { req });
    res.forbidden("Only users with profile created can access");
  }
};

export default auth;
