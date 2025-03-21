import client from "../../db/redis.js";
import { hashSHA256 } from "../../utils/hash.js";
import { v4 as uuidv4 } from "uuid";

export const setupAuth = async (username) => {
  const nowTime = Date.now().toString();
  const usernameHash = hashSHA256(username);
  const randomUniqueString = uuidv4();

  // unique user token
  const userToken = `${nowTime}-${randomUniqueString}-${usernameHash}`;

  // expiry of 5 days
  await client.setEx(userToken, 5 * 24 * 60 * 60, username); // set userToken to username

  return userToken;
};

export const validateAuth = async (userToken) => {
  const username = await client.get(userToken);

  const result = { valid: username !== null, username };
  return result;
};

export const auth = async (req, _, next) => {
  const userToken = req.headers["authorization"]?.split(" ")?.[1] ?? "null";

  const { valid, username } = await validateAuth(userToken);

  if (valid) {
    req.loggedIn = true;
    req.username = username;
    req.userToken = userToken;
  } else req.loggedIn = false;

  next();
};

export const loggedIn = (req, res, next) => {
  if (req.loggedIn === true) next();
  else res.unauth("Not logged In");
};

export const loggedAsAdmin = (req, res, next) => {
  if (req.loggedIn && req.username === "admin") next();
  else res.forbidden("Only admins are allowed");
};

export default auth;
