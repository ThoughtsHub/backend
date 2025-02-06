import User from "../models/User.js";
import c from "../utils/status_codes.js";
import { client } from "../db/connect.js";
import otp from "../utils/email.js";

const resend = async (username, res) => {
  try {
    const user = await User.findOne({
      where: { username },
      attributes: ["username", "email", "email_verified"],
    });
    if (user === null)
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "No user like that, signup at /login/new" });

    if (user.email_verified === true)
      return res
        .status(c.OK)
        .json({ message: "Already verified, login at /login" });

    await client.del(`otp:${user.email}:${user.username}`);

    const generatedOtp = otp.generate();
    await client.setEx(
      `otp:${user.email}:${user.username}`,
      5 * 60,
      generatedOtp
    );

    const sentOtp = await otp.send(user.email, generatedOtp);

    if (!sentOtp)
      return res
        .status(c.INTERNAL_SERVER_ERROR)
        .json({ message: "Resend was not successfull" });

    res.status(c.OK).json({ message: "Verification email sent" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const verify = async (username, sentOtp, res) => {
  try {
    const user = await User.findOne({
      where: { username },
      attributes: ["username", "email", "email_verified"],
    });
    if (user === null)
      return res
        .status(c.BAD_REQUEST)
        .json({ message: "No user like that, signup at /login/new" });

    if (user.email_verified === true)
      return res
        .status(c.OK)
        .json({ message: "Already verified, login at /login" });

    const userOtp = await client.get(`otp:${user.email}:${user.username}`);
    if (sentOtp !== userOtp)
      return res.status(c.BAD_REQUEST).json({ message: "Invalid OTP" });

    const updateResult = await User.update(
      { email_verified: true, verified: true },
      { where: { username }, individualHooks: true }
    );

    await client.del(`otp:${user.email}:${user.username}`);
    res.status(c.OK).json({ message: "Email Verified" });
  } catch (err) {
    console.log(err);

    res
      .status(c.INTERNAL_SERVER_ERROR)
      .json({ message: "Internal server error" });
  }
};

const resendEmailByParams = async (req, res) => {
  const { username } = req.params;

  await resend(username, res);
};

const resendEmailByQuery = async (req, res) => {
  const { username = null } = req.query;

  if (username === null)
    return res.status(c.BAD_REQUEST).json({ message: "No username given" });

  await resend(username, res);
};

const verifyEmailByParams = async (req, res) => {
  const { username } = req.params;
  const { otp: sentOtp = null } = req.body;

  await verify(username, sentOtp, res);
};

const verifyEmailByBody = async (req, res) => {
  const { username = null, otp: sentOtp = null } = req.body;

  if (username === null)
    return res.status(c.BAD_REQUEST).json({ message: "No username given" });

  await verify(username, sentOtp, res);
};

const handler = {
  resend: {
    params: resendEmailByParams,
    query: resendEmailByQuery,
  },
  verify: {
    params: verifyEmailByParams,
    body: verifyEmailByBody,
  },
};

export default handler;
