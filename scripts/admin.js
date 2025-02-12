import _env from "../constants/env.js";
import User from "../models/User.js";

const admin = async () => {
  const adminFound = await User.findOne({
    where: { username: _env.admin.USERNAME },
  });

  if (adminFound === null)
    await User.create({
      username: _env.admin.USERNAME,
      password: _env.admin.PASSWORD,
      usernameSet: true,
      verified: true,
    });
};

export default admin;
