import { ADMIN } from "../constants/env.js";
import User from "../models/user.js";

const createAdmin = () => {
  setTimeout(async () => {
    const adminFound = await User.findOne({ where: { username: "admin" } });
    if (adminFound === null)
      await User.create({ username: ADMIN.USERNAME, password: ADMIN.PASSWORD });
  }, 4000);
};

export default createAdmin;
