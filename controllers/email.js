import otp from "../utils/email.js";
import _otp from "../db/commands/email.js";
import Email from "../models/Email.js";

const sendOtp = async (req, res) => {
  const { email = null } = req.query;

  if (email === null) return res.bad("No email");

  const generatedOtp = otp.generate();

  try {
    if (
      (await _otp.create(email, generatedOtp)) && // create otp key
      (await otp.send(email, generatedOtp)) // send otp
    )
      res.ok("OTP sent");
    else res.serverError("Couldn't send the otp");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const verifyOtp = async (req, res) => {
  const { email = null, otp = null } = req.body;

  if (email === null) return res.bad("No email");

  const _email = await Email.findOne({ where: { email } });

  if (_email?.verified === true) return res.ok("Email already verified");

  try {
    if (await _otp.verify(email, otp)) {
      // create/update the email
      {
        if (_email === null) await Email.create({ email, verified: true });
        else await Email.update({ verified: true }, { where: { email } });
      }

      res.ok("OTP verified", { email });
    } else res.unauth("OTP invalid");
  } catch (err) {
    console.log(err);

    res.serverError();
  }
};

const EmailHandler = { send: sendOtp, verify: verifyOtp };

export default EmailHandler;
