import { Router } from "express";
import User from "../models/User.js";
import { loggedIn, setupAuth } from "../middlewares/auth/auth.js";
import client from "../db/redis.js";
import logger from "../constants/logger.js";
import Profile from "../models/Profile.js";

const router = Router();

router.post("/login", async (req, res) => {
  const body = req.body;

  if (body.allNuldefined("username email mobile")) {
    logger.warning("login attempt failed", null, {
      reason: "required fields missing",
      requires: "username, email, mobile",
      body: body.data,
    });
    return res.failure("Username/email/mobile, required, at least one");
  }
  if (body.isNuldefined("password")) {
    logger.warning("login attempt failed", null, {
      reason: "password was not provided in body",
      body: body.data,
    });
    return res.failure("password is required");
  }

  const givenField = body.getNotNuldefined("username email mobile");
  const [identifier, password] = body.bulkGet(`${givenField} password`);

  try {
    const user = await User.findOne({ where: { [givenField]: identifier } });
    if (user === null) {
      logger.warning("login attempt failed", null, {
        reason: "credentials invalid: username/email/mobile",
        body: body.data,
        userFound: user,
      });
      return res.failure(`Bad ${givenField}`);
    }
    if (user.password !== password) {
      logger.warning("login attempt failed", null, {
        reason: "wrong password",
        body: body.data,
        userFound: user,
      });
      return res.unauth("Wrong password");
    }

    let profile = await Profile.findOne({ where: { userId: user.id } });

    profile = profile.get({ plain: true });
    profile.profileId = profile.id;
    delete profile.id;

    const userToken = await setupAuth(user.id);
    res.ok("Log in successful", {
      auth_token: userToken,
      user: profile,
    });
    logger.info("login successfull", req.user, {
      userToken,
      body: body.data,
      user,
      profile,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "login attempt failed",
      body: body.data,
    });

    res.serverError();
  }
});

router.get("/logout", loggedIn, async (req, res) => {
  const userToken = req.userToken;

  try {
    await client.del(userToken);

    res.ok("Successfully logged out");
    logger.info("logout successfull", req.user, { userToken, user: req.user });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "logout attempt failed",
      userToken,
      user: req.user,
    });

    res.serverError();
  }
});

router.post("/signup/create-password", async (req, res) => {
  const body = req.body;

  const otpTokenFromHeaders =
    req.headers["otpToken"] ?? body.get("otpToken", null) ?? null;
  body.set("otpToken", otpTokenFromHeaders);

  const reqFields = body.anyNuldefined("password otpToken", ",");
  if (reqFields.length !== 0) {
    logger.warning("create password failed", req.user, {
      reason: "required fields not given",
      requires: notGivreqFieldsereqFieldsnFields,
      body: body.data,
      otpTokenFromHeaders,
    });
    return res.failure(`Required: ${reqFields}`);
  }

  const { password, otpToken } = body.bulkGetMap("password otpToken");

  try {
    const otpTokenValue = await client.get(otpToken);
    await client.del(otpToken);
    if (otpTokenValue === null) {
      logger.warning("create password failed", req.user, {
        reason: "otp token was invalid",
        body: body.data,
        otpTokenFromHeaders,
      });
      return res.failure("Bad otpToken");
    }
    const [givenField, contact] = otpTokenValue.split(":");

    // TODO: check password requirements

    const user = await User.create({ [givenField]: contact, password });

    const userToken = await setupAuth(user.id);
    res.ok("Sign up successful", {
      auth_token: userToken,
      user: user.username === null ? null : user,
    });
    logger.info("Signup successful", req.user, {
      event: "password created",
      body: body.data,
      createdUser: user,
      userToken,
      otpTokenValue,
      otpToken,
    });
  } catch (err) {
    logger.error("Internal server error", err, req.user, {
      event: "create password failed",
      body: body.data,
    });

    res.serverError();
  }
});

export const LoginRouter = router;
