import otp from "../utils/otp.js";
import { client } from "../db/clients.js";
import { v4 } from "uuid";

const OTP_FIELDS = ["mobile", "email", "isMobile", "otp", "otpToken"];

/**
 * generates an otp for the incoming request and sends otp to the requested
 * target [email | mobile]
 * @param {Request} req
 * @param {Response} res
 */
const getOtp = async (req, res) => {
  const body = req.body;
  body.setFields(OTP_FIELDS);

  if (body.fieldsNull("email mobile")) return res.noParams();

  // TODO: check if email or mobile available
  const isMobile = body.get("isMobile");
  const key = isMobile === true ? body.get("mobile") : body.get("email");
  const generatedOtp = otp.generate(6);
  const otpToken = `${key}:${v4()}`;

  try {
    await client.del(`otp:${key}`); // delete the prev otp

    // set a new otp for the same email/otp
    await client.setEx(`otp:${key}`, 5 * 60, generatedOtp);
    await client.setEx(otpToken, 5 * 60, key); // and otpToken

    // send otp based on if mobile or email given
    const sendOtp = isMobile ? otp.sendMobile : otp.sendEmail;
    const otpSent = await sendOtp(key, generatedOtp);

    if (otpSent) return res.ok("OTP sent", { otpSent, otpToken });

    // delete the generated otp and otpToken if otp not sent
    await client.del([`otp:${key}`, otpToken]);

    res.bad("OTP could not be sent", { otpSent });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

/**
 * verifies the sent otp
 * @param {Request} req
 * @param {Response} res
 */
const verifyOtp = async (req, res) => {
  const body = req.body;
  body.setFields(OTP_FIELDS);

  body.set("otpToken", req.headers["otptoken"]);

  if (body.anyFieldNull("otp otpToken")) return res.noParams();

  const [otp, otpToken] = body.bulkGet("otp otpToken");
  try {
    const key = await client.get(otpToken); // check the otpToken
    if (key === null) return res.bad("Invalid otp token");

    // the otp that was set for that email/mobile
    const setOtp = await client.get(`otp:${key}`);
    if (setOtp !== otp)
      return res.bad("Invalid OTP", { otpTokenMatched: false });

    // create a new otpToken for setting a password
    const newOtpToken = `password:${key}:${v4()}`;
    await client.setEx(newOtpToken, 5 * 60, key);
    await client.del([`otp:${key}`, otpToken]); // delete the verified otp

    res.ok("OTP verified", {
      otpTokenMatched: true,
      otpToken: newOtpToken,
    });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

export const OtpController = { getOtp, verifyOtp };
