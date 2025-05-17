import client from "../db/redis.js";
import { logBad, logOk, logServerErr } from "../services/LogService.js";
import { Validate } from "../services/ValidationService.js";
import { isString } from "../utils/checks.js";
import otp from "../utils/otp.js";
import { v4 as uuidv4 } from "uuid";

const otpLength = 4;

class OtpController {
  static validateOtp = (otp) => isString(otp) && otp.length === 4;

  static sendOtp = async (req, res) => {
    const { email } = req.body;

    if (!Validate.email(email)) {
      logBad("Otp sent failed", "Bad email was used to request an otp", {
        email,
      });
      return res.failure("Bad Email");
    }

    const generatedOtp = otp.generate(otpLength);
    const send = otp.sendEmail;

    try {
      send(email, generatedOtp);
      await client.setEx(
        `otp:${email}:${generatedOtp}`,
        5 * 60,
        `${"email"}:${email}`
      );

      res.ok("Otp Sent");

      logOk("Otp Sent", "Otp requested with an email", { email });
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
        "Invalid Otp was sent for verification",
        { contact, otp: givenOtp }
      );
      return res.failure("Bad Otp");
    }

    try {
      const otpValue = await client.get(`otp:${contact}:${givenOtp}`);
      {
        if (otpValue === null) {
          logBad(
            "Otp Verification failed",
            "Invalid Otp was sent for verification",
            { contact, otp: givenOtp }
          );
          return res.failure("Bad Otp");
        }
        await client.del(`otp:${contact}:${givenOtp}`);
      }

      const otpToken = `password:${uuidv4()}-${Date.now()}`;
      await client.setEx(otpToken, 5 * 60, otpValue);

      res.ok("Otp verified", { otpToken });

      logOk("Otp verified", "Otp token has been generated for the user", {
        contact,
        otp,
      });
    } catch (err) {
      logServerErr();
      res.serverError();
    }
  };
}

export default OtpController;
