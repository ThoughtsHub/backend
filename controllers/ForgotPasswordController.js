import client from "../db/redis.js";
import { logBad, logOk, logServerErr } from "../services/LogService.js";
import { User_ } from "../services/UserService.js";
import otp from "../utils/otp.js";
import { serviceCodes, serviceResultBadHandler } from "../utils/services.js";
import OtpController from "./OtpController.js";
import { v4 as uuidv4 } from "uuid";

const otpLength = 4;

class ForgotPasswordController {
  static sendOtp = async (req, res) => {
    const { email } = req.body;

    let result = await User_.exists(email);
    if (result.code !== serviceCodes.OK[0]) {
      logBad(
        "Otp sent failed",
        "Bad email/username was used to request an otp",
        {
          email,
        }
      );
      return res.failure("Bad Email/Username");
    }
    let userId = result.info.userId;

    const generatedOtp = otp.generate(otpLength);
    const send = otp.sendEmail;

    try {
      send(result.info.email, generatedOtp);
      await client.setEx(
        `otp-fp:${userId}:${generatedOtp}`,
        5 * 60,
        `${"userId"}:${userId}`
      );

      res.ok("Otp Sent");

      logOk("Otp Sent", "Otp requested for forgot password", { userId });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };

  static verifyOtp = async (req, res) => {
    const { otp: givenOtp, contact } = req.body;

    if (!OtpController.validateOtp(givenOtp)) {
      logBad(
        "Otp Verification failed",
        "Invalid Otp was sent for verification for forgot password",
        { contact, otp: givenOtp }
      );
      return res.failure("Bad Otp");
    }

    let result = await User_.exists(contact);
    if (result.code !== serviceCodes.OK[0]) {
      logBad(
        "Otp verification failed",
        "Bad email/username was used to request an otp",
        {
          email,
        }
      );
      return res.failure("Bad Email/Username");
    }
    let userId = result.info.userId;

    try {
      const otpValue = await client.get(`otp-fp:${userId}:${givenOtp}`);
      {
        if (otpValue === null) {
          logBad(
            "Otp Verification failed",
            "Invalid Otp was sent for verification",
            { contact, otp: givenOtp }
          );
          return res.failure("Bad Otp");
        }
        await client.del(`otp-fp:${userId}:${givenOtp}`);
      }

      const otpToken = `forgot-password:${uuidv4()}-${Date.now()}`;
      await client.setEx(otpToken, 5 * 60, otpValue);

      res.ok("Otp verified", { otpToken });

      logOk(
        "Otp verified",
        "Otp token has been generated for the user for forgot password",
        { userId }
      );
    } catch (err) {
      logServerErr();
      res.serverError();
    }
  };

  static resetPassword = async (req, res) => {
    const { otpToken, password } = req.body;

    try {
      const otpTokenValue = await client.get(otpToken);
      {
        if (otpTokenValue === null) {
          logBad(
            "Update password failed",
            "Bad Otp Token was used for re-password generation",
            { otpToken, password }
          );
          return res.failure("Invalid OtpToken");
        }
        await client.del(otpToken);
      }

      const [_, userId] = otpTokenValue.split(":");

      const result = await User_.updatePassword(password, userId);
      if (serviceResultBadHandler(result, res, "Update Password failed"))
        return;

      res.ok("Password updated");

      logOk("Password updated", "A user updated the password (forgotten)", {
        userId,
      });
    } catch (err) {
      logServerErr(err);
      res.serverError();
    }
  };
}

export default ForgotPasswordController;
