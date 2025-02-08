import User from "../models/User.js";
import c from "../utils/status_codes.js";
import otp from "../utils/email.js";
import _otp from "../db/commands/email.js";
import Email from "../models/Email.js";

const sendOtp = async (req, res) => {
  const { email = null } = req.query;

  if (email === null)
    return res.status(c.BAD_REQUEST).json({ message: "No email" });

  const generatedOtp = otp.generate();

  try {
    if (
      (await _otp.create(email, generatedOtp)) &&
      (await otp.send(email, generatedOtp))
    )
      res.status(c.OK).json({ message: "OTP sent" });
    else res.status(c.INTERNAL_SERVER_ERROR).json("Couldn't send the otp");
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const verifyOtp = async (req, res) => {
  const { email = null, otp = null } = req.body;

  if (email === null)
    return res.status(c.BAD_REQUEST).json({ message: "No email" });

  const _email = await Email.findOne({ where: { email } });

  if (_email && _email?.verified === true)
    return res.status(c.OK).json({ message: "Email already verified" });

  try {
    if (await _otp.verify(email, otp)) {
      // create/update the email
      {
        if (_email === null) await Email.create({ email, verified: true });
        else await Email.update({ verified: true }, { where: { email } });
      }

      res.status(c.OK).json({ message: "OTP verified", email });
    } else res.status(c.UNAUTHORIZED).json({ message: "OTP invalid" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const handler = {
  send: sendOtp,
  verify: verifyOtp,
};

export default handler;
