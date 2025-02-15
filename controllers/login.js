import Profile from "../models/Profile.js";
import User from "../models/user.js";
import checks from "../utils/checks.js";
import _req from "../utils/request.js";
import p from "../utils/password.js";

const LOGIN_FIELDS = ["email", "mobile", "password"];

const getUser = async (req, res, next) => {
  const { username, email, mobile, password } = _req.getDataO(
    req.body,
    LOGIN_FIELDS
  );

  if (_req.allNull(email, mobile)) return res.noParams();
  if (_req.allNull(password)) return res.noParams();

  try {
    let user = null,
      uniqueKeyVal;
    if (!checks.isNull(username)) {
      user = await User.findOne({ where: { username } });
      uniqueKeyVal = username;
    } else if (!checks.isNull(email)) {
      user = await User.findOne({ where: { email } });
      uniqueKeyVal = email;
    } else if (!checks.isNull(mobile)) {
      user = await User.findOne({ where: { mobile } });
      uniqueKeyVal = mobile;
    }

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

export const LoginController = {
  getUser,
};
