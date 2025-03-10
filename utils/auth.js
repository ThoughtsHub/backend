import jwt from "jsonwebtoken";
import { JWT } from "../constants/env.js";

const act = JWT.access;
const rft = JWT.refresh;

const generateAccessToken = (data) => {
  const accessToken = jwt.sign(data, act.secret, { expiresIn: act.expiry });

  return accessToken;
};

const generateRefreshToken = ({ key, value }) => {
  const data = {};
  data[key] = value;
  const refreshToken = jwt.sign(data, rft.secret, { expiresIn: rft.expiry });

  return refreshToken;
};

const verifyAccessToken = (accessToken) => {
  const data = jwt.verify(accessToken, act.secret);
  delete data.iat;
  delete data.exp;

  return data;
};

const verifyRefreshToken = (refreshToken) => {
  const data = jwt.verify(refreshToken, rft.secret);
  delete data.iat;
  delete data.exp;

  return data;
};

const jwtAuth = {
  generate: { access: generateAccessToken, refresh: generateRefreshToken },
  verify: { access: verifyAccessToken, refresh: verifyRefreshToken },
};

export default jwtAuth;
