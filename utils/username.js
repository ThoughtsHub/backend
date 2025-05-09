import User from "../models/User.js";

export const usernameAvailable = async (username = "admin") => {
  const user = await User.findOne({ where: { username } });
  if (user === null) return true;
  return false;
};

export const usernameNotAvailable = async (username = "admin") => {
  return !(await usernameAvailable(username));
};
