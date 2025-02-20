import _req from "../utils/request.js";
import otp from "../utils/otp.js";
import { client } from "../db/clients.js";
import { v4 } from "uuid";

const OTP_FIELDS = ["mobile", "email", "isMobile", "otp", "confirmationId"];

/**
 * generates an otp for the incoming request and sends otp to the requested
 * target [email | mobile]
 * @param {Request} req
 * @param {Response} res
 * @returns {Response | null}
 */
const getOtp = async (req, res) => {
  const { mobile, email, isMobile } = _req.getDataO(req.body, OTP_FIELDS);

  if (_req.allNull(mobile, email)) return res.noParams();

  // TODO: check if email or mobile available

  const key = isMobile === true ? mobile : email;
  const generatedOtp = otp.generate(6);
  const confirmationId = `${key}:${v4()}`;

  try {
    await client.del(`otp:${key}`);

    await client.setEx(`otp:${key}`, 5 * 60, generatedOtp);
    await client.setEx(confirmationId, 5 * 60, key);

    const sendOtp = isMobile ? otp.sendMobile : otp.sendEmail;
    const otpSent = await sendOtp(key, generatedOtp);

    if (otpSent) return res.ok("OTP sent", { otpSent, confirmationId });

    await client.del([`otp:${key}`, confirmationId]);

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
 * @returns {Response | null}
 */
const verifyOtp = async (req, res) => {
  const { otp, confirmationId } = _req.getDataO(req.body, OTP_FIELDS);

  if (_req.anyNull(otp, confirmationId)) return res.noParams();

  try {
    const key = await client.get(confirmationId);
    if (key === null) return res.bad("Invalid confirmation Id");

    const setOtp = await client.get(`otp:${key}`);
    if (setOtp !== otp)
      return res.bad("Invalid OTP", { confirmationCodeMatched: false });

    const newConfirmationId = `password:${key}:${v4()}`;
    await client.setEx(newConfirmationId, 5 * 60, key);
    await client.del([`otp:${key}`, confirmationId]);

    res.ok("OTP verified", {
      confirmationCodeMatched: true,
      confirmationId: newConfirmationId,
    });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

export const OtpController = { getOtp, verifyOtp };
