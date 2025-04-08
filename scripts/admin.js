import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { usernameAvailable } from "../utils/username.js";

const createAdmin = () => {
  setTimeout(async () => {
    const available = await usernameAvailable("admin");
    if (available) {
      const user = await User.create({
        username: "admin",
        password: "admin",
        email: "admin@thoughtshub.com",
      });
      await Profile.create({
        username: "admin",
        fullName: "admin",
        about: "admin",
        userId: user.id,
      });
    }
  }, 4000);
};

export default createAdmin;
