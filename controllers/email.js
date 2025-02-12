import otp from "../utils/email.js";
import _otp from "../db/commands/email.js";
import { client } from "../db/connect.js";
import handle from "../utils/handle.js";

const sendOtp = async (req, res) => {
  const { email = null } = req.body;

  if (email === null) return res.bad("No email");

  const generatedOtp = otp.generate();

  try {
    if (
      (await _otp.create(email, generatedOtp)) && // create otp key
      (await otp.send(email, generatedOtp)) // send otp
    ) {
      const confirmationId = handle.createConfirmationId();
      await client.setEx(`confirm:${confirmationId}`, 5 * 60, email); // set confirmation Id

      res.ok("OTP sent", { confirmationId, otpSent: true });
    } else res.serverError("Couldn't send the otp");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const verifyOtp = async (req, res) => {
  const { otp = null, confirmationId = null } = req.body;

  if (confirmationId === null) return res.noParams();

  const email = await client.get(`confirm:${confirmationId}`); // get email from confirmation id

  if (email === null) return res.bad("Invalid confirmationId");

  try {
    if (await _otp.verify(email, otp)) {
      await client.del(`confirm:${confirmationId}`);

      const newConfirmationId = handle.createConfirmationId();
      client.setEx(`confirmPassword:${newConfirmationId}`, 5 * 60, email); // set new confirmation Id

      res.ok("OK", { email, confirmationId: newConfirmationId, confirmationCodeMatched: true });
    } else res.unauth("OTP invalid");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const EmailHandler = { send: sendOtp, verify: verifyOtp };

export default EmailHandler;
