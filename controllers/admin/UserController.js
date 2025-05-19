import { timestampsKeys } from "../../constants/timestamps.js";
import { logOk, logServerErr } from "../../services/LogService.js";
import { User_ } from "../../services/UserService.js";
import { toNumber } from "../../utils/number.js";
import { sendEmail } from "../../utils/otp.js";
import { serviceResultBadHandler } from "../../utils/services.js";

class AdminUserController {
  static get = async (req, res) => {
    const offset = toNumber(req.query.offset);
    const order = req.query.order ?? [[timestampsKeys.createdAt, "desc"]];

    try {
      let result = await User_.getByOffset(offset, res.originalQuery, order);
      if (serviceResultBadHandler(result, res, "Users fetch failed (admin)"))
        return;

      const users = result.info.users;

      res.ok("Users fetched", { users });

      logOk("User fetching successfull", "Admin requested users");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static delete = async (req, res) => {
    const { userId, email, reason = "No reason" } = req.query;

    try {
      let result = await User_.delete(userId);
      if (serviceResultBadHandler(result, res, "User deletion failed (admin)"))
        return;

      sendEmail(
        email,
        "Account deleted | ThoughtsHub",
        `Your account has been deleted due to ${reason}`
      );

      res.ok("User deleted");

      logOk("User deleted successfully", "Admin deleted a user", { userId });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default AdminUserController;
