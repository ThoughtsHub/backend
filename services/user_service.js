import User from "../models/User.js";
import { parseFields } from "../utils/field_parser.js";
import { usernameValid } from "../utils/service_checks.js";
import { sResult } from "../utils/service_return.js";
import { SERVICE_CODE } from "../utils/service_status_codes.js";

const modelFields = "username email mobile password*";
const { fields, reqFields } = parseFields(modelFields);

class UserService {
  static updateUsernameByID = async (
    id,
    username,
    options = { transaction }
  ) => {
    let idCheck = idInvalidOrMissing(id, "User");
    if (idCheck !== false) return idCheck;

    try {
      const usernameAvailable = await usernameValid(username);

      if (!usernameAvailable) {
        return sResult(
          SERVICE_CODE.USERNAME_UNAVAILABLE,
          "Username is not available, or is not valid."
        );
      }

      const [updateResult] = await User.update(
        { username },
        {
          where: { id },
          transaction: options.transaction ?? null,
          individualHooks: true,
        }
      );

      if (updateResult !== 1)
        return sResult(SERVICE_CODE.ID_INVALID, "User Id Invalid");

      return true;
    } catch (err) {
      return sResult(SERVICE_CODE.ERROR, err);
    }
  };
}

export default UserService;
