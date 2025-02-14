import { Router } from "express";
import _req from "../utils/request.js";
import otp from "../utils/otp.js";
import { v4 } from "uuid";
import { client } from "../db/clients.js";
import User from "../models/user.js";
import auth from "../middlewares/auth.js";

const router = Router();

const EMAIL_REGEXP = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const OTP_FIELDS = ["mobile", "email", "isMobile", "otp", "confirmationId"];
const PASS_FIELDS = ["password", "confirmationId"];

router.post("/get-otp", async (req, res) => {
  const { mobile, email, isMobile } = _req.getDataO(req.body, OTP_FIELDS);

  if (_req.allNull(mobile, email)) return res.noParams();

  // TODO: check if email or mobile

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
});

router.post("/verify-otp", async (req, res) => {
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
});

router.post("/create-password", async (req, res) => {
  const { password, confirmationId } = _req.getDataO(req.body, PASS_FIELDS);

  if (_req.anyNull(password, confirmationId)) return res.noParams();
  if (typeof password !== "string") return res.bad("Invalid type of password");

  try {
    const key = await client.get(confirmationId);
    if (key === null) return res.bad("Invalid confirmation Id");

    const isEmail = EMAIL_REGEXP.test(key);
    const updateWith = isEmail ? { email: key } : { mobile: key };

    // TODO: Check the password requirements

    const user = await User.create({ ...updateWith, password });

    const sessionId = await auth.setup(user.id, res, key);

    res.ok("User created and logged In", { sessionId });

    client.del(confirmationId);
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const OtpRouter = router;
