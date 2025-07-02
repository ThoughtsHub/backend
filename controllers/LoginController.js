import { logBad, logOk, logServerErr } from "../services/LogService.js";
import { User_ } from "../services/UserService.js";
import { Profile_ } from "../services/ProfileService.js";
import { serviceCodes, serviceResultBadHandler } from "../utils/services.js";
import { setupAuth } from "../middlewares/auth.js";
import activity from "../services/ActivityService.js";
import client from "../db/redis.js";

class LoginController {
  static login = async (req, res) => {
    const { email, password } = req.body;

    try {
      let result = null; // check with email and password
      {
        result = await User_.getByEmailAndPassword(email, password);
        if (
          ![User_.codes.INCORRECT_PASS[0], serviceCodes.OK[0]].includes(
            result.code
          )
        )
          result = await User_.getByUsernameAndPassword(email, password);
      }

      if (serviceResultBadHandler(result, res, "Login failed")) return;

      const userId = result.info.user.id;

      result = await Profile_.getByUserId(userId);
      if (serviceResultBadHandler(result, res, "User information get failed"))
        return;

      const user = result.info.profile;
      const authToken = await setupAuth(userId);

      res.ok("Login success", { auth_token: authToken, user });

      logOk("Login success", "A user logged in", { userId, user });
      activity("Login", "A user logged in");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static logout = async (req, res) => {
    const { userToken, userId, user } = req;

    try {
      await client.del(userToken);

      res.ok("Successfully logged out");

      logOk("Logout success", "A user logged out", { userId, user });
      activity("Logout", "A user logged out");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static createPassword = async (req, res) => {
    const { otpToken, password, referralCode = null } = req.body;

    try {
      const otpTokenValue = await client.get(otpToken);
      {
        if (otpTokenValue === null) {
          logBad(
            "Signup failed",
            "Bad Otp Token was used for password creation",
            { otpToken, password }
          );
          return res.failure("Invalid OtpToken");
        }
        await client.del(otpToken);
      }

      const [givenField, contact] = otpTokenValue.split(":");

      const result = await User_.create(contact, password, referralCode);

      if (serviceResultBadHandler(result, res, "Create Password failed"))
        return;

      const userId = result.info.user.id;
      const authToken = await setupAuth(userId);

      res.ok("Signup success", { auth_token: authToken, user: null });

      logOk("Signup success", "A user created an account", { userId });
      activity("Signup", "A user created an account");
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default LoginController;
