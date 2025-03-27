import { Router } from "express";
import otp from "../utils/otp.js";
import client from "../db/redis.js";
import { v4 as uuidv4 } from "uuid";

const router = Router();

router.post("/get", async (req, res) => {
  const body = req.body;

  if (body.allNuldefined("email mobile"))
    return res.failure("required mobile or email");
  if (body.isNuldefined("isMobile")) body.set("isMobile", false);

  const givenField = body.getNotNuldefined("email mobile");
  const [contact, isMobile] = body.bulkGet(`${givenField} isMobile`);

  const generatedOtp = otp.generate();
  const send = isMobile ? otp.sendMobile : otp.sendEmail;
  try {
    const sentSuccess = await send(contact, generatedOtp);
    await client.setEx(
      `otp:${contact}:${generatedOtp}`,
      5 * 60,
      `${givenField}:${contact}`
    );

    if (sentSuccess) return res.ok("Otp sent");
    res.failure("Otp could not be sent due to server failure", 500);
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

router.post("/verify", async (req, res) => {
  const body = req.body;

  const reqFields = body.anyNuldefined("otp contact", ",");
  if (body.isNuldefined("otp")) return res.failure(`Required: ${reqFields}`);
  const [givenOtp, contact] = body.bulkGet("otp contact");

  try {
    const otpValue = await client.get(`otp:${contact}:${givenOtp}`);
    if (otpValue === null) return res.unauth("Bad otp");
    await client.del(`otp:${contact}:${givenOtp}`);

    const otpToken = `password:${uuidv4()}-${Date.now()}`;
    await client.setEx(otpToken, 5 * 60, otpValue);

    res.ok("OTP verified", { otpToken });
  } catch (err) {
    console.log(err);

    res.serverError();
  }
});

export const OtpRouter = router;
