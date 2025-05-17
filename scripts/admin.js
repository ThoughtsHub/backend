import { Profile_ } from "../services/ProfileService.js";
import { User_ } from "../services/UserService.js";
import { serviceCodes } from "../utils/services.js";

const createAdmin = () => {
  setTimeout(async () => {
    const available = await Profile_.usernameAvailable("admin");
    if (available.code === serviceCodes.OK && available.info) {
      let result = await User_.create("admin@thoughtshub.com", "admin582");
      result = await Profile_.create(
        "admin",
        "admin",
        "other",
        "",
        null,
        "admin",
        result.info.user.id
      );
    }
  }, 4000);
};

export default createAdmin;
