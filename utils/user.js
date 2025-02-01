import _env from "../constants/env.js";
import User from "../models/User.js";


const getUserDataByUsername = async (username) => {
  const user = await User.findOne({
    where: { username },
    attributes: ["id", "username", "blocked"],
  });

  console.log(user);

  const userData = {
    id: user.id,
    username: user.username,
    blocked: user.blocked,
  };

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

const _user = {
  getUserDataByUsername,
  isUserBlocked,
  isUsernameAvailable,
};

export default _user;
