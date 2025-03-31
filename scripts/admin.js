import Profile from "../models/Profile.js";
import User from "../models/User.js";
import { usernameAvailable } from "../utils/username.js";

const createAdmin = () => {
  setTimeout(async () => {
    if (usernameAvailable("admin")) {
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
  }, 5000);
};

export default createAdmin;
