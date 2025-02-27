import otp from "../utils/otp.js";
import { client } from "../db/clients.js";
import { v4 } from "uuid";
import ReqBody from "../utils/request.js";

const OTP_FIELDS = ["mobile", "email", "isMobile", "otp", "confirmationId"];

/**
 * generates an otp for the incoming request and sends otp to the requested
 * target [email | mobile]
 * @param {Request} req
 * @param {Response} res
 * @returns {Response | null}
 */
const getOtp = async (req, res) => {
  const body = new ReqBody(req.body, OTP_FIELDS);

  if (body.fieldsNull("email mobile")) return res.noParams();

  // TODO: check if email or mobile available
  const isMobile = body.get("isMobile");
  const key = isMobile === true ? body.get("mobile") : body.get("email");
  const generatedOtp = otp.generate(6);
  const confirmationId = `${key}:${v4()}`;

  try {
    await client.del(`otp:${key}`); // delete the prev otp

    // set a new otp for the same email/otp
    await client.setEx(`otp:${key}`, 5 * 60, generatedOtp);
    await client.setEx(confirmationId, 5 * 60, key); // and confirmationId

    // send otp based on if mobile or email given
    const sendOtp = isMobile ? otp.sendMobile : otp.sendEmail;
    const otpSent = await sendOtp(key, generatedOtp);

    if (otpSent) return res.ok("OTP sent", { otpSent, confirmationId });

    // delete the generated otp and confirmationId if otp not sent
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
  const body = new ReqBody(req.body, OTP_FIELDS);

  if (body.anyFieldNull("otp confirmationId")) return res.noParams();

  const [otp, confirmationId] = body.bulkGet("otp confirmationId");
  try {
    const key = await client.get(confirmationId); // check the confirmationId
    if (key === null) return res.bad("Invalid confirmation Id");

    // the otp that was set for that email/mobile
    const setOtp = await client.get(`otp:${key}`);
    if (setOtp !== otp)
      return res.bad("Invalid OTP", { confirmationCodeMatched: false });

    // create a new confirmationId for setting a password
    const newConfirmationId = `password:${key}:${v4()}`;
    await client.setEx(newConfirmationId, 5 * 60, key);
    await client.del([`otp:${key}`, confirmationId]); // delete the verified otp

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
