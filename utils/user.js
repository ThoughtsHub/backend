import _env from "../constants/env.js";
import Profile from "../models/Profile.js";
import User from "../models/User.js";

const getUserDataByUsername = async (username) => {
  const user = await User.findOne({
    where: { username },
    attributes: { exclude: ["password"] },
    include: [
      { model: Profile, as: "data", attributes: { exclude: ["userId"] } },
    ],
  });

  let userData = { ...user.dataValues };

  userData.profile = userData.data;
  delete userData.data;

  return userData;
};

const isUserBlocked = async (userId) => {
  const userData = await User.findOne({
    where: { id: userId },
    attributes: ["blocked"],
  });

  return userData.blocked === true;
};

const isUsernameAvailable = async (username) => {
  const user = await User.findOne({ where: { username } });

  return user === null;
};

const isEmailAvailable = async (email) => {
  const user = await User.findOne({ where: { email } });

  return user === null;
};

const _user = {
  getUserDataByUsername,
  isUserBlocked,
  isUsernameAvailable,
  isEmailAvailable,
};

export default _user;
