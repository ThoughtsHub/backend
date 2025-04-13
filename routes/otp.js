import { Router } from "express";
import otp from "../utils/otp.js";
import client from "../db/redis.js";
import { v4 as uuidv4 } from "uuid";
import User from "../models/User.js";
import logger from "../constants/logger.js";

const router = Router();

router.post("/get", async (req, res) => {
  const body = req.body;

  if (body.allNuldefined("email mobile")) {
    logger.warning("otp generation failed", req.user, {
      reason: "required fields not given",
      required: "email, mobile",
      body: body.data,
    });
    return res.failure("required mobile or email");
  }
  if (body.isNuldefined("isMobile")) body.set("isMobile", false);

  const givenField = body.getNotNuldefined("email mobile");
  const [contact, isMobile] = body.bulkGet(`${givenField} isMobile`);

  const user = await User.findOne({ where: { [givenField]: contact } });
  if (user !== null) {
    logger.warning("otp generation failed", req.user, {
      reason: "contact given is already in use",
      body: body.data,
      userWithAssociatedContact: user,
    });
    return res.conflict("Email already used by another user.");
  }

  const generatedOtp = otp.generate(4);
  const send = isMobile ? otp.sendMobile : otp.sendEmail;
  try {
    send(contact, generatedOtp);
    const sentSuccess = true;
    await client.setEx(
      `otp:${contact}:${generatedOtp}`,
      5 * 60,
      `${givenField}:${contact}`
    );

    if (sentSuccess) {
      logger.info("Otp generated", null, {
        body: body.data,
        generatedOtp,
        sentSuccess,
      });
      return res.ok("Otp sent");
    }
    res.failure("Otp could not be sent due to server failure", 500);
    logger.warning("otp generation failed", req.user, {
      reason:
        "Internal server failure or due to error in redis or nodemailer not responding",
      body: body.data,
      generatedOtp,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "otp generation failed",
      body: body.data,
    });

    res.serverError();
  }
});

router.post("/verify", async (req, res) => {
  const body = req.body;

  const reqFields = body.anyNuldefined("otp contact", ",");
  if (reqFields.length !== 0) {
    logger.warning("otp verification failed", req.user, {
      reason: "required fields were not given",
      requires: reqFields,
      body: body.data,
    });
    return res.failure(`Required: ${reqFields}`);
  }
  const [givenOtp, contact] = body.bulkGet("otp contact");

  try {
    const otpValue = await client.get(`otp:${contact}:${givenOtp}`);
    if (otpValue === null) return res.unauth("Bad otp");
    await client.del(`otp:${contact}:${givenOtp}`);

    const otpToken = `password:${uuidv4()}-${Date.now()}`;
    await client.setEx(otpToken, 5 * 60, otpValue);

    res.ok("OTP verified", { otpToken });
    logger.info("otp verification successfull", null, {
      body: body.data,
      otpValue,
      otpToken,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "otp verification failed",
      body: body.data,
    });

    res.serverError();
  }
});

export const OtpRouter = router;
